import { useDispatch, useSelector } from 'react-redux';
import { redirect, useActionData, useLoaderData, useNavigate } from 'react-router-dom';
import { useLogin } from '../app/customHooks';
import { changePersonData, getPerson, loadAvatar } from '../app/apiRequests';
import PersonInfoField from '../components/PersonInfoField';
import { useRef } from 'react';
import { changeField } from '../slices/userSlice';
import BackButton from '../components/BackButton';

//Загрузка данных персоны
export async function loader() {
  const person = await getPerson();

  if (person.error) {
    return redirect('/');
  }

  return { person };
}

// Отправка изменений поля на сервер
export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Простая валидация изменения адреса почты/пароля
  if (data.newPassword && data.newPassword.trim().length < 5) {
    return {error: 'ПАРОЛЬ МИНИМУМ 6 СИМВОЛОВ!'}
  }

  if (data.email && (!data.email.includes('@') || data.email.trim() === '')) {
    return {error: 'НЕКОРРЕКТНАЯ ПОЧТА!'}
  }

  // Если изменяемые поля валидны - отправляем запрос
  const response = await changePersonData(data);
  
  // Обработчики ответа
  if (response.error === 'not authorized') {
    return redirect('/');
  }

  if (response.error === 'wrong password') {
    return {error: 'НЕ ВЕРНЫЙ ПАРОЛЬ!'}
  }

  return {message: 'УСПЕШНО!'};
}

//КОМПОНЕНТ(роут) СТРАНИЦЫ ЛИЧНЫХ ДАННЫХ ПЕРСОНЫ(юзера/админа)
export default function PersonInfo() {
  const personState = useSelector((state) => state.user);
  const { person } = useLoaderData();
  const message = useActionData();
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Обработчик нажатия кнопки изменения аватара
  const handleLoadAvatar = () => {
    inputRef.current.click();
  }

  // Обработчик изменения файла input (отправка изображения на сервер)
  const handleAvatarChange = async (e) => {
    if (e.target.files) {
      const formData = new FormData();
      console.log(e.target.files[0].type)
      if (e.target.files.length > 1 || !e.target.files[0].type.includes('image')) {
        e.target.value = "";
        return console.log('BAD'); // !!!!!!! validatiom message
      }

      formData.append('avatar', e.target.files[0]);
      const response = await loadAvatar(formData);
      if (response.error) {
        e.target.value = "";
        return navigate('/');
      }
      e.target.value = "";
      return dispatch(changeField(['avatar', response.avatar]));
    }
  }

  useLogin(person);
  
  return (
    <div
      className="w-full h-full flex flex-col items-center"
    >
      <span
        className="mt-[40px] mb-[40px]"
      >
        <h1
          className="text-xl font-sans font-bold text-gray-800"
        >
          ВАШИ ДАННЫЕ
        </h1>
      </span>
      <div>
        <div
          className="w-52 mb-10"
        >
          <img
            src={personState.avatar}
            alt="ava"
            className="mx-auto"
          />
          <input
              type="file"
              ref={inputRef}
              onChange={(e) => handleAvatarChange(e)}
              multiple
              hidden
            />
          <p
          className="mx-5 text-sm text-center text-gray-800 font-bold cursor-pointer hover:text-black"
          onClick={handleLoadAvatar}
        >
          изменить
        </p>
        </div>
        
      </div>
      <PersonInfoField
        atribute={"name"}
        text={"Имя:"}
      />
      <PersonInfoField
        atribute={"lastName"}
        text={"Фамилия:"}
      />
      <PersonInfoField
        atribute={"email"}
        text={"E-mail:"}
      />
      <PersonInfoField
        atribute={"password"}
        text={"Пароль:"}
      />
      <>
        {message ? (
          message.error ? (
            <p
              className="text-lg text-red-700 font-bold text-centerxt"
            >
              {message.error}
            </p>
          ) : (
            <p
              className="text-lg text-centerxt"
            >
              {message.message}
            </p>
          )
        ) : (
          <></>
        )}
      </>
      <BackButton />
    </div>
  );
}
