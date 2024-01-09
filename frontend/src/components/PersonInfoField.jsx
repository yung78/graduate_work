import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'react-router-dom';
import { changeField } from '../slices/userSlice';

//КОМПОНЕНТ ИЗМЕНЯЕМЫХ ПОЛЕЙ ЛИЧНЫХ ДАННЫХ
export default function PersonInfoField({atribute, text}) {
  const dispatch = useDispatch();
  const personState = useSelector((state) => state.user);

  // Состояния для изменения полей личных данных этого компонента
  const [changeName, setChangeName] = useState(false);
  const [changeLastName, setChangeLastName] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);

  const stateFields = {
    name: changeName,
    lastName: changeLastName,
    email: changeEmail,
  }

  // Обработчики изменения состояния полей личных данных
  const handleChangeName = () => {
    setChangeName(true);
  }

  const handleChangeLastName = () => {
    setChangeLastName(true);
  }

  const handleChangeEmail = () => {
    setChangeEmail(true);
  }

  const handlers = {
    name: handleChangeName,
    lastName: handleChangeLastName,
    email: handleChangeEmail,
  }

  // Внесение изменений в состояние по атрибуту name полей личных данных
  const handleChangeField = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    
    dispatch(changeField([key, value]));
  }

  // Закрытие всех полей input и кнопок сохранить
  const handleSave = () => {
    setChangeName(false);
    setChangeLastName(false);
    setChangeEmail(false);
  }

  return (
    <Form
      className="w-3/5 h-16 mb-4 flex flex-col justify-center items-center"
      method='POST'
      onSubmit={handleSave}
    >
      {stateFields[atribute]? (
        <>
          <input
            autoFocus
            type="text"
            name={atribute}
            className="w-full h-9 px-2 border-2 border-gray-300 bg-blue-100 rounded-md outline-none focus:border-gray-400"
            defaultValue={personState[atribute]}
            onChange={(e) => handleChangeField(e)}
          />
          <button
            className="text-xs text-center underline cursor-pointer"
            type="submit"
          >
            СОХРАНИТЬ
          </button>
        </>
      ) : (
        <>
          <div
            className="w-full h-9 px-2 border-2 border-gray-300 bg-blue-100 rounded-md outline-none focus:border-gray-400 leading-8"
          >
            {text}&nbsp; <span>{personState[atribute]}</span>
          </div>
          <span
            className="text-xs text-center underline cursor-pointer"
            onClick={handlers[atribute]}
          >
            ИЗМЕНИТЬ
          </span>
        </>
      )}
    </Form>
  );
}
