import { useDispatch, useSelector } from 'react-redux';
import { hideAddModal } from '../slices/adminSlice';



export default function ModalAddChangeUser() {
  const cloudState = useSelector((state) => state.cloud);
  const dispatch = useDispatch();

  //Обработчик нажатия кнопки "Добавить"/"Изменить"
  const handleApply = async () => {
    dispatch(hideAddModal());
  };
  
  //Обработчик нажатия кнопки "Отмена"
  const handleCancel = () => {
    dispatch(hideAddModal());
  };

  return (
    <div 
      className="fixed w-full h-full left-0 top-0 bg-black bg-opacity-70 flex justify-center items-center z-10 overflow-x-hidden"
    >
      <div 
        className="modal w-[300px] p-4 relative rounded-md bg-white box-border z-20 flex flex-col flex-wrap items-center text-center"
      >
        <p>
        </p>
        <div
          className='w-full mt-4 flex justify-around'
        >
          <button
            type='button'
            className="w-20 h-9  border-2 rounded-md border-gray-300 bg-blue-400 hover:border-gray-400 text-xs text-center font-bold"
            onClick={handleApply}
          >
            Добавить
          </button>
          <button
            type='button'
            className="w-20 h-9  border-2 rounded-md border-gray-300 bg-blue-400 hover:border-gray-400 text-xs text-center font-bold"
            onClick={handleCancel}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
