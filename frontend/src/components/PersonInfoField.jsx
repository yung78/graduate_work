import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'react-router-dom';
import { changeField } from '../slices/userSlice';

//КОМПОНЕНТ ИЗМЕНЯЕМЫХ ПОЛЕЙ ЛИЧНЫХ ДАННЫХ
export default function PersonInfoField({atribute, text}) {
  const dispatch = useDispatch();
  const personState = useSelector((state) => state.user);

  // Состояния 'флагов' для изменения полей личных данных этого компонента
  const [changeName, setChangeName] = useState(false);
  const [changeLastName, setChangeLastName] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const stateFields = {
    name: changeName,
    lastName: changeLastName,
    email: changeEmail,
    password: changePassword,
  }

  // Обработчики изменения 'флагов' состояния полей личных данных
  const handleChangeName = () => {
    setChangeName(true);
  }

  const handleChangeLastName = () => {
    setChangeLastName(true);
  }

  const handleChangeEmail = () => {
    setChangeEmail(true);
  }

  const handleChangePassword = () => {
    setChangePassword(true);
  }

  const handlers = {
    name: handleChangeName,
    lastName: handleChangeLastName,
    email: handleChangeEmail,
    password: handleChangePassword,
  }

  // Внесение изменений в состояние пользователя по атрибуту name полей личных данных(исключая пароль)
  const handleChangeField = (e) => {
    const key = e.target[atribute].name;
    const value = e.target[atribute].value;
    if (key === 'password') {
      return
    }
    dispatch(changeField([key, value]));
  }

  // Закрытие всех полей input и кнопок сохранить
  const handleCloseChangeFields = () => {
    setChangeName(false);
    setChangeLastName(false);
    setChangeEmail(false);
    setChangePassword(false);
  }

  return (
    <Form
      className="w-3/5 min-h-16 mb-4 flex flex-col justify-center items-center"
      method='POST'
      onSubmit={(e)=> {
        handleChangeField(e);
        handleCloseChangeFields();
      }}
    >
      {stateFields[atribute]? (
        <>
          {atribute === 'password' ? (
            <p
              className='text-xs'
            >
              старый пароль
            </p>
          ) : (
            <></>
          )}
          <input
            autoFocus
            type="text"
            name={atribute}
            className="w-full h-9 px-2 border-2 border-gray-300 bg-blue-100 rounded-md outline-none focus:border-gray-400"
            defaultValue={atribute === 'password' ? '' : personState[atribute]}
          />
          {atribute === 'password' ? (
            <>
              <p
                className='text-xs'
              >
                новый пароль
              </p>
              <input
                type="text"
                name="newPassword"
                className="w-full h-9 px-2 border-2 border-gray-300 bg-blue-100 rounded-md outline-none focus:border-gray-400"
                defaultValue=""
              />
            </>
          ) : (
            <></>
          )}
          <div>
            <button
              className="mx-5 text-center text-gray-800 font-bold cursor-pointer hover:text-black"
              type="submit"
            >
              сохранить
            </button>
            <button
              className="mx-5 text-center text-gray-800 font-bold cursor-pointer hover:text-black"
              type="button"
              onClick={handleCloseChangeFields}
            >
              отменить
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="w-full h-9 px-2 border-2 border-gray-300 bg-blue-100 rounded-md outline-none focus:border-gray-400 leading-8"
          >
            {text}&nbsp;&nbsp;
            <span>
              {atribute === 'password' ? '********' : personState[atribute] }
            </span>
          </div>
          <span
            className="mx-5 text-sm text-center text-gray-800 font-bold cursor-pointer hover:text-black"
            onClick={handlers[atribute]}
          >
            изменить
          </span>
        </>
      )}
    </Form>
  );
}
