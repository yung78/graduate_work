from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import datetime
import secrets
import os
import json
import urllib.parse
import logging

from .forms import AvatarForm, AvatarIdForm
from .models import CloudUser, UserSession, UserData, UserFiles
from .custom_decorators import user_auth, user_not_auth, admin_auth
from .crypto import encrypt, decrypt
from .serializers import FileUploadSerializer


logger = logging.getLogger(__name__)
load_dotenv()


# ОБЩИЕ
# Вход в систему (аутентификация)
@api_view(['POST'])
@user_not_auth
def login(request):
    logger.info('Аутентификация.')
    body = json.loads(request.body.decode('utf-8'))
    users = CloudUser.objects.all()
    for user in users:
        if user.email == body['email'] and decrypt(user.password, user.key) == body['password']:
            session = UserSession.objects.get(user=user.id)
            session_token = secrets.token_hex(16)
            session.session_token = session_token
            session.save()
            response_data = {'sessionToken': session_token}

            return Response(data=response_data, status=200, headers={'Content-type': 'application/json'})
    raise ObjectDoesNotExist


# Выход из системы (обратная аутентификация)
@api_view(['GET'])
@user_auth
def logout(request, data):
    logger.info('Обратная аутентификация.')
    session = data['session']
    session.session_token = ''
    session.save()
    return Response(status=200)


# Проверка авторизации (флага администратора)
@api_view(['GET'])
@user_auth
def is_admin(request, data):
    return Response({'admin': data['user'].is_admin}, status=200)


# Получение данных аккаунта
@api_view(['GET'])
@user_auth
def get_data(request, data):
    logger.info(f'Запрос данных своего аккаунта id:{data["user"].id}')
    data['user'].last_visit = datetime.datetime.now()
    data['user'].save(update_fields=['last_visit'])

    files = [{
        'name': x.name,
        'size': x.size,
        'created': x.created,
    } for x in data['files']]

    response_data = {
        'id': data['user'].id,
        'name': data['data'].name,
        'lastName': data['data'].last_name,
        'avatar': f"http://localhost:8000/{data['data'].avatar.url}" if data['data'].avatar != '' else '',
        'isAdmin': data['user'].is_admin,
        'email': data['user'].email,
        'files': files,
    }
    return Response(data=response_data, status=200)


# Регистрация (только пользователей)
@api_view(['POST'])
def registration(request):
    logger.info('Регистрация нового аккаунта.')
    body = json.loads(request.body.decode('utf-8'))
    print(request.body)
    if len(body['email']) == 0 or len(body['password']) == 0:
        return Response({'error': 'not enough data'}, status=400)
    try:
        CloudUser.objects.get(email=body['email'])

        return Response({'error': 'already exists'}, status=409)
    except ObjectDoesNotExist:
        print('tyt')
        try:
            key = Fernet.generate_key().decode()
            new_user = CloudUser(
                email=body['email'],
                password=encrypt(body['password'], key),
                key=key,
                is_admin=False,
            )

            # Присвоение флага админа из запроса только по запросу от админа
            if request.headers.get('Authorization'):
                if UserSession.objects.get(session_token=request.headers['Authorization']).user.is_admin:
                    new_user.is_admin = body.get('isAdmin', False)

            new_user_data = UserData(
                name=body['name'],
                last_name=body['lastName'],
                user=new_user,
            )

            new_session = UserSession(user=new_user)
            new_user.save()
            new_user_data.save()
            new_session.save()

            return Response({'success': True}, status=201)
        except (Exception, TypeError,) as err:
            return Response({'error': f'{err}'}, status=500)


# Изменение данных своего аккаунта
@api_view(['PATCH'])
@user_auth
def change_self_data(request, data):
    logger.info(f'Изменение данных своего аккаунта id:{data["user"].id}.')
    if len(request.FILES) == 1:
        avatar = AvatarForm(request.POST, request.FILES)
        if avatar.is_valid():
            data['data'].avatar.delete()
            data['data'].avatar = request.FILES['avatar']
            data['data'].save()
            return Response({'avatar': f"http://localhost:8000/{data['data'].avatar.url}"}, status=201)
        return Response({'error': 'not valid'}, status=400)
    else:
        body = request.data
        if body.get('name'):
            data['data'].name = body['name']
            data['data'].save(update_fields=['name'])
        elif body.get('lastName'):
            data['data'].last_name = body['lastName']
            data['data'].save(update_fields=['last_name'])
        elif body.get('email'):
            data['user'].email = body['email']
            data['user'].save(update_fields=['email'])
        elif body.get('password'):
            if decrypt(data['user'].password, data['user'].key) == body['password']:
                data['user'].password = encrypt(body['newPassword'], data['user'].key)
                data['user'].save(update_fields=['password'])
            else:
                return Response({'error': 'wrong password'}, status=400)
        return Response(body, status=201)


# ПОЛЬЗОВАТЕЛЬ
# Работа с файлами
class File(APIView):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = FileUploadSerializer

    # Загрузка файла на сервер
    def post(self, request):
        @user_auth
        def download(req, data):
            logger.info(f'Загрузка файла на сервер id:{data["user"].id}.')
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save()
                files = [{
                    'name': x.name,
                    'size': x.size,
                    'created': x.created,
                } for x in data['files']]

                return Response(data={'files': files}, status=201)
            else:
                return Response(data={'error': 'bad file'}, status=400)
        return download(request)

    # Удаление файла с сервера (django-cleanup удаляет файл из директории user_(id))
    def delete(self, request, name):
        @user_auth
        def remove(req, data):
            logger.info(f'Удаление файла id:{data["user"].id}')
            data['files'].get(name=urllib.parse.unquote(name)).delete()
            return Response(status=204)
        return remove(request)

    # Отправка файла для сохранения на клиенте
    def get(self, request, name):
        @user_auth
        def upload(req, data):
            logger.info(f'Сохранение файла на клиенте id:{data["user"].id}')
            file = data['files'].get(name=urllib.parse.unquote(name))
            return FileResponse(file.file, as_attachment=True)
        return upload(request)


# Формирование и отправка ссылки для скачивания(сохранения) файла сторонним пользователем
@api_view(['GET'])
def get_url(request, name):
    @user_auth
    def _get_url(req, data):
        logger.info(f'Получение ссылки id:{data["user"].id}.')
        url = f"{data['user'].id}/{data['files'].get(name=urllib.parse.unquote(name)).name}"
        key = os.getenv('URL_KEY')
        encrypt_url = encrypt(url, key)
        return Response({'url': f'http://localhost:3000/download/{encrypt_url}'}, status=200)
    return _get_url(request)


# Отправка файла для скачивания(сохранения) файла сторонним пользователем
@api_view(['GET'])
def get_file(request, code):
    logger.info('Сохранение файла по ссылке.')
    try:
        key = os.getenv('URL_KEY')
        try:
            params = decrypt(code, key).split('/')
            if len(params) != 2:
                raise ObjectDoesNotExist
        except (Exception,) as err:
            raise ObjectDoesNotExist

        file = UserFiles.objects.get(user=params[0], name=params[1])
        response = FileResponse(file.file, as_attachment=True, filename=params[1])
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response

    except ObjectDoesNotExist as err:
        return Response({'error': 'bad url'}, status=404)
    except (Exception, ) as err:
        return Response(status=500)


# АДМИН
# Получение данных всех аккаунтов
@api_view(['GET'])
@admin_auth
def get_all(request):
    logger.info('Админ. Получение общих данных.')
    data = []
    for user in CloudUser.objects.all():
        data.append({
            'id': user.id,
            'email': user.email,
            'isAdmin': user.is_admin,
            'lastVisit': user.last_visit,
            'name': UserData.objects.get(user=user).name,
            'lastName': UserData.objects.get(user=user).last_name,
            'files': UserFiles.objects.filter(user=user).count(),
            'fullSize': UserFiles.objects.filter(user=user).values('size')
        })

    return Response(data=data, status=200)


# Получение данных конкретного аккаунта
@api_view(['GET'])
def get_one(request, uid):
    @admin_auth
    def _get_one(req):
        logger.info(f'Админ. Получение данных аккаунта id:{uid}.')
        files = []
        user = CloudUser.objects.get(id=uid)
        user_data = UserData.objects.get(user=user)

        for file in UserFiles.objects.filter(user=user):
            files.append({
                'id': file.id,
                'name': file.name,
                'size': file.size,
                'created': file.created,
            })

        data = {
            'id': user.id,
            'email': user.email,
            'isAdmin': user.is_admin,
            'lastVisit': user.last_visit,
            'name': user_data.name,
            'lastName': user_data.last_name,
            'avatar': f"http://localhost:8000/{user_data.avatar.url}" if user_data.avatar != '' else '',
            'files': files,
        }

        return Response(data=data, status=200)
    return _get_one(request)


# Изменение данных конкретного аккаунта
@api_view(['PATCH'])
def change_one(request):
    @admin_auth
    def _change_one(req):
        logger.info('Админ. Изменение данных аккаунта.')
        if len(request.FILES) == 1:
            avatar = AvatarIdForm(request.POST, request.FILES)
            user_data = UserData.objects.get(user=request.data['id'])
            if avatar.is_valid():
                user_data.avatar.delete()
                user_data.avatar = request.FILES['avatar']
                user_data.save()

                return Response({'avatar': f"http://localhost:8000/{user_data.avatar.url}"}, status=201)
            return Response({'error': 'not valid'}, status=400)
        else:
            user = CloudUser.objects.get(id=request.data['id'])
            user_data = UserData.objects.get(user=user)
            body = request.data
            user_data.name = body['name']
            user_data.last_name = body['lastName']
            user_data.save(update_fields=['name', 'last_name'])
            user.is_admin = body.get('isAdmin', False)
            user.email = body['email']
            user.save(update_fields=['email', 'is_admin'])

            return Response({'success': True}, status=201)
    return _change_one(request)


@api_view(['DELETE'])
def delete_one(request, uid):
    @admin_auth
    def _delete_one(req):
        logger.info(f'Админ. Удаление аккаунта id:{uid}.')
        CloudUser.objects.get(id=uid).delete()
        return Response(status=204)
    return _delete_one(request)