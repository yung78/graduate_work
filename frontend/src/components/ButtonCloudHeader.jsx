import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUserFiles, showDeleteConfirm, showMessage, showShareURL,  } from '../slices/cloudSlice';
import { sendFiles, getFile } from '../app/apiRequests';
import { Form, useNavigate } from 'react-router-dom';

// КОМПОНЕНТ КНОПОК УПРАВЛЕНИЯ ФАЙЛАМИ ХРАНИЛИЩА
export default function ButtonCloudHeader({ btnName, src }) {
  const cloudState = useSelector((state) => state.cloud);
  const userState = useSelector((state) => state.user);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Обработчики кнопок управления
  const buttonHandlers = {
    'скачать': () => handleSaveFile(getFile),
    'поделиться': () => { cloudState.onFocus ? (dispatch(showShareURL())) : (dispatch(showMessage())) },
    'загрузить': () => { inputRef.current.click() },
    'удалить': () => { cloudState.onFocus ? (dispatch(showDeleteConfirm())) : (dispatch(showMessage())) },
  };

  // Обработчик нажатия кнопок
  const handleClick = (btnName) => {
    buttonHandlers[btnName]();
  };

  // Обработчик сохранения(скачки) файла на клиенте
  const handleSaveFile = async (f) => {
    if (cloudState.onFocus) {
      const response = await f(cloudState.onFocus);
      if (response){
        return navigate('/');
      }
    } else {
      (dispatch(showMessage()));
    }
    return;
  }

  // Обработчик изменения файлов input (отправка файлов на сервер)
  const handleFileChange = async (e) => {
    if (e.target.files) {
      const formData = new FormData();
      for (const file of e.target.files) {
        formData.append('file', file);
        // Проверка дублирования имен файлов
        if (cloudState.files.map((el) => el.name).includes(file.name)) {
          formData.append('name', file.name.replace(/^([^.]+)$|(\.[^.]+)$/i, '$1_copy_$2'))
        } else {
          formData.append('name', file.name);
        }
        formData.append('size', file.size);
        formData.append('user', userState.id);
      }
      const response = await sendFiles(formData);
      if (response.error) {
        e.target.value = "";
        return navigate('/');
      }
      e.target.value = "";
      return dispatch(addUserFiles(response.files));
    }
    return;
  }

  return (
    <div
      className="btn w-[6vh] h-[6vh] flex relative flex-col items-center justify-center cursor-pointer group"
      onClick={() => handleClick(btnName)}
      tabIndex={-1}
    >
      <div
        className=" w-[3vh] h-[2vh] bg-gray-200 absolute top-[1.1vh] left-[1.3vh] group-hover:bg-neutral-500 group-active:bg-black group-hover:shadow-[0_10px_30px_10px_rgba(255,255,255,0.7)]"
      >
      </div>
      <div
        className="w-[5vh] h-[5vh]"
      >
        <img src={src} alt="" className="relative" />
      </div>
      <span
        className="text-[11px] sm:text-xs xl:text-base"
      >
        {btnName}
      </span>
      <>
        {btnName === 'загрузить' ? (
          <Form
            method='post'
          >
            <input
              type="file"
              ref={inputRef}
              onChange={(e) => handleFileChange(e)}
              multiple
              hidden
            />
          </Form>
        ) : (
          null
        )}
      </>
    </div>
  );
}
