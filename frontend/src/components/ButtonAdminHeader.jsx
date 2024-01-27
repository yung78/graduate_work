import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from '../slices/cloudSlice';
import { showAddModal } from '../slices/adminSlice';


// КОМПОНЕНТ КНОПОК УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ
export default function ButtonAdminHeader({ btnName }) {
  const adminState = useSelector((state) => state.admin);
  const dispatch = useDispatch()
  
  // Обработчики кнопок управления
  const buttonHandlers = {
    'добавить': () => { dispatch(showAddModal()) },
    'удалить': () => { adminState.onFocus ? console.log('del') : dispatch(showMessage()) },
    'изменить': () => { adminState.onFocus ? console.log('change') : dispatch(showMessage()) },
  };

  // Обработчик нажатия кнопок
  const handleButtonClick = (btnName) => {
    buttonHandlers[btnName]();
  }

  return (
    <button
      className="w-20 h-7 mx-auto border-2 rounded-md border-gray-300 bg-blue-400 hover:border-gray-400 text-xs text-center font-bold active:shadow-[0_0px_10px_4px_rgba(34,60,80,0.2)]"
      onClick={() => handleButtonClick(btnName)}
    >
      {btnName}
    </button>
  );
}
