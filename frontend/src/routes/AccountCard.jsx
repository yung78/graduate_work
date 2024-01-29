import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { changeAvatar, getUser } from '../app/adminApiRequests';
import ButtonBack from '../components/ButtonBack';
import dateFormat from "dateformat";
import FileListView from '../components/FileListView';
import ButtonChange from '../components/ButtonChange';
import { useDispatch, useSelector } from 'react-redux';
import { addDataToCard, cangeDataCard, showChangeModal } from '../slices/adminSlice';
import ModalAddChangeUser from '../components/ModalAddChangeUser';
import { useEffect, useRef, useState } from 'react';
import { showMsg, fileSize, handleName } from '../app/helpers';


// Загрузка данных персоны(пользователя/администратора)
export async function loader({params}) {
  const data = await getUser(params.params);
  if (data.error) {
    return redirect('/');
  }
  return { data };
}

// КОМПОНЕНТ(роут) КАРТОЧКИ АККАУНТА
export default function AccountCard() {
  const navigate = useNavigate()
  const { data } = useLoaderData();
  const adminState = useSelector((state) => state.admin);
  const [message, setMessage] = useState(false)
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const size = data.files.reduce((acc, val) => (acc + Number(val.size)), 0);

  useEffect(() => {
    dispatch(addDataToCard(data));
  }, [dispatch, data]);

  const handleChangeAvatar = () => {
    inputRef.current.click();
  }

  const handleAvatarChange = async (e) => {
    if (e.target.files) {
      const formData = new FormData();
      if (e.target.files.length > 1 || !e.target.files[0].type.includes('image')) {
        e.target.value = "";
        return showMsg({ error: 'ЗАГРУЖАЙТЕ КАРТИНКУ!'}, 3000, setMessage);
      }

      formData.append('avatar', e.target.files[0]);
      formData.append('id', data.id);
      const response = await changeAvatar(formData);
      if (response.error) {
        e.target.value = "";
        return navigate('/');
      }

      e.target.value = "";
      showMsg({success: 'УСПЕШНО!'}, 3000, setMessage);
      return dispatch(cangeDataCard(response));
    }
  }

  return (
    <section
      className="w-full p-6"
    >
      {adminState.changeModal ? <ModalAddChangeUser data={adminState.card} /> : <></>}
      <h1
        className="mb-4 text-lg text-center font-bold"
      >
        Данные {adminState.card.isAdmin ? 'администратора:' : 'пользователя:'}
      </h1>
      <div
        className={(adminState.card.isAdmin ? "bg-emerald-700" : "bg-sky-700") + " w-full h-3 bg mb-4"}
      >
      </div>
      <div 
        className="flex min-h-60"
      >
        <div
          className="w-[20%] min-w-36"
        >
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => handleAvatarChange(e)}
            multiple
            hidden
          />
          <img
            className="w-full"
            src={adminState.card.avatar ? adminState.card.avatar : '/img/unknown_user.png'}
            alt="ava" 
          />
          <ButtonChange handler={handleChangeAvatar}/>
        </div>
        <div
          className="flex flex-col px-4 lg:px-10 text-sm md:text-base xl:text-lg"
        >
          <span>Id:&nbsp;&nbsp;<strong>{adminState.card.id}</strong></span>
          <span>Почта:&nbsp;&nbsp;<strong>{adminState.card.email}</strong></span>
          <span>Имя/фамилия:&nbsp;&nbsp;<strong>{adminState.card.name} {adminState.card.lastName}</strong></span>
          <span>Права:&nbsp;&nbsp;<strong>{adminState.card.isAdmin ? 'администратор' : 'пользователь'}</strong></span>
          <span>Последнее посещение:&nbsp;&nbsp;<strong>{dateFormat(adminState.card.lastVisit, "HH:mm dd.mm.yy.")}</strong></span>
          <span>Загруженных файлов:&nbsp;&nbsp;<strong>{adminState.card.files?.length}</strong></span>
          <span>Общий объем файлов:&nbsp;&nbsp;
            <strong>
              {fileSize(size)}
            </strong>
          </span>
          <ButtonChange handler={() => dispatch(showChangeModal())} />
        </div>
      </div>
      <p
        className={`${message.error ? 'text-red-700' : 'text-black' } h-4 mb-5 mt-5 text-center text-sm font-bold`}
      >
        {message.error ? message.error : message.success ? message.success : ''}
      </p>
      <h2
        className="text-center"
      >
        Список файлов:
      </h2>
      <div
        className="w-full min-h-[34vh] p-5 mb-10 flex flex-col rounded-md bg-blue-200"
      >
        {adminState.card.files?.map((f, index) => {
          return (
            <div
              className="bg-slate-50 my-1 rounded-md"
              key={index}
            >
              <FileListView
                src={handleName(f.name)}
                fileName={f.name}
                name={f.name}
                size={f.size}
                focus={(e) => null}
              />
            </div>
          )
        }) }
      </div>
      <ButtonBack />
    </section>
  );
}
