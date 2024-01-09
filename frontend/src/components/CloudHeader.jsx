import { useDispatch, useSelector } from 'react-redux';
import { changeView } from '../slices/cloudSlice';
import appData from '../app/appData';
import CloudHeaderButton from './CloudHeaderButton';

//ШАПКА ОКНА ХРАНИЛИЩА ФАЙЛОВ
export default function CloudHeader() {
  const dispatch = useDispatch();
  const cloudState = useSelector((state) => state.cloud);

  //Изменение вида отображения файлов в окне хранилища
  const handleClick = () => {
    dispatch(changeView());
  }

  return (

    <section
      className="w-full h-[7vh] bg-gray-200 rounded-t-xl flex justify-between items-center"
    >
      <div
        className="w-1/2 h-[6vh] ml-4 flex justify-around"
      >
        {Object.keys(appData.cloudButtons).map((btnName, index) => (
          <CloudHeaderButton
            key={index}
            btnName={btnName}
            src={appData.cloudButtons[btnName]}
          />
        ))}
      </div>
      <div
        className="w-[6vh] h-[6vh] mr-4 flex items-center justify-center"
      >

        <div
          className="w-[4vh] h-[4vh]"
          onClick={handleClick}
        >
          <img src={cloudState.view ? "/img/tile_view.png" : "/img/list_view.png"} alt="" />
        </div>
      </div>
    </section>
  );
}
