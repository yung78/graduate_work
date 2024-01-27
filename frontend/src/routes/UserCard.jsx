import { redirect, useLoaderData } from 'react-router-dom';
import { getUser } from '../app/adminApiRequests';
import ButtonBack from '../components/ButtonBack';
import dateFormat from "dateformat";
import FileListView from '../components/FileListView';
import { handleName } from '../app/appData';
import ButtonChange from '../components/ButtonChange';

export async function loader({params}) {
  const data = await getUser(params.params);
  
  console.log(data);
  if (data.error) {
    return redirect('/');
  }
  return { data };
}

// КОМПОНЕНТ(роут) КАРТОЧКИ ПОЛЬЗОВАТЕЛЯ
export default function UserCard() {
  const { data } = useLoaderData();
  const size = data.files.reduce((acc, val) => (acc + Number(val.size)), 0);

  return (
    <section
      className="w-full p-6"
    >
      <h1
        className="mb-4 text-lg text-center font-bold"
      >
        Данные {data.isAdmin ? 'администратора:' : 'пользователя:'}
      </h1>
      <div
        className={(data.isAdmin ? "bg-emerald-700" : "bg-sky-700") + " w-full h-3 bg mb-4"}
      >
      </div>
      <div 
        className="flex"
      >
        <div
          className="w-[20%]"
        >
          <img
            className="w-full"
            src={data.avatar ? data.avatar : '/img/unknown_user.png'}
            alt="ava" 
          />
          <ButtonChange />
        </div>
        <div
          className="flex flex-col px-10 text-sm md:text-base"
        >
          <span>Id:  <strong>{data.id}</strong></span>
          <span>Почта:  <strong>{data.email}</strong></span>
          <span>Имя/фамилия:  <strong>{data.name} {data.lastName}</strong></span>
          <span>Права:  <strong>{data.isAdmin ? 'администратор' : 'пользователь'}</strong></span>
          <span>Последнее посещение:  <strong>{dateFormat(data.lastVisit, "HH:mm dd.mm.yy.")}</strong></span>
          <span>Загруженных файлов:  <strong>{data.files.length}</strong></span>
          <span>Общий объем файлов:  
            <strong>
              {(size/1024).toFixed(1) < 1000 ? (size/1024).toFixed(1) + ' Kb' : ((size/1024)/1024).toFixed(1) + ' Mb'}
            </strong>
          </span>
          <ButtonChange />
        </div>

      </div>
        <h2
          className="mt-10 text-center"
        >
          Список файлов:
        </h2>
      <div
        className="w-full min-h-[40vh] p-5 mb-10 flex flex-col rounded-md bg-blue-200"
      >
        {data.files.map((f, index) => {
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
