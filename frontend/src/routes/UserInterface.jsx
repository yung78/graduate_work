import { redirect, useLoaderData } from 'react-router-dom';
import { isAdmin, getPerson } from '../app/apiRequests';
import { useLogin, useOutsideFileClick } from '../app/customHooks';
import FileListView from '../components/FileListView';
import FileTileView from '../components/FileTileView';
import appData from '../app/appData';
import { useDispatch, useSelector } from 'react-redux';
import CloudHeader from '../components/CloudHeader';
import { focusOnFile } from '../slices/cloudSlice';
import ConfermDelete from '../components/ConfermDelete';
import ShareURL from '../components/ShareURL';

// При загрузке дополнительно проверяем авторизацию и получаем данные пользователя
export async function loader() {
  const check = await isAdmin();
  if (check.admin) {
    return redirect('/admin');
  }
  const person = await getPerson();

  if (person.error) {
    return redirect('/');
  }

  return { person };
}

//КОМПОНЕНТ(роут) СТРАНИЦЫ ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА
export default function UserInterface() {
  const cloudState = useSelector((state) => state.cloud);
  const { person } = useLoaderData();
  const dispatch = useDispatch();
  useLogin(person);
  useOutsideFileClick();

  // Записываем имя файла в состояние
  const handleFocus = (e) => {
    dispatch(focusOnFile(e.target.getAttribute('name')));
  }

  // Подбор иконки для расширения файла
  const handleName = (fileName) => {
    const extension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
    if (extension === "") {
      return ('/img/file_icons/file.png');
    }
  
    if (appData.files.includes(extension)) {
      return (`/img/file_icons/${extension}.png`);
    }

    return ('/img/file_icons/unknown.png');
  }

  return (
    <div
      className="w-full pt-[3%] min-h-full bg-blue-200"
    >
      <div
        className="w-[94%] mx-auto min-h-52 bg-white rounded-xl"
      >
        <CloudHeader />
        <section
          className="w-full p-5 rounded-b-xl"
        >
          {cloudState.message ? (
            <div
              className='mx-auto h-3 block text-center text-red-800'
            >
              <span
                className='text-xs'
              >
                Вы не выбрали файл!
              </span>
            </div>
          ) : (
            <div className='h-3'></div>
          )}
          <h1>Файлы:</h1>
          <div
            className="w-full flex justify-start flex-wrap gap-3"
          >
            {person.files.length === 0 ? (
              <div
                className="w-full flex justify-center"
              >
                <h2>Вы еще ничего не загрузили...</h2>
              </div>
            ) : (
              cloudState.view ? (
                <>
                  {Object.keys(cloudState.files).map((file, index) => {
                    return (
                      <FileListView
                        key={index}
                        src={handleName(file)}
                        fileName={file}
                        size={cloudState.files[file].size}
                        created={cloudState.files[file].created}
                        focus={handleFocus}
                      />
                    );
                  })}
                </>
              ) : (
                <>
                  {Object.keys(cloudState.files).map((file, index) => {
                    return (
                      <FileTileView
                        key={index}
                        src={handleName(file)}
                        fileName={file}
                        focus={handleFocus}
                      />
                    );
                  })}
                </>
              )
            )} 
            <>
              {cloudState.confirm ? (<ConfermDelete />) : (null)}
              {cloudState.share ? (<ShareURL />) : (null)}
            </>
          </div>
        </section>
      </div>
    </div>
  );
}


