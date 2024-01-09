import { useSelector } from 'react-redux';
import { redirect, useLoaderData } from 'react-router-dom';
import { useLogin } from '../app/customHooks';
import { changePersonData, getPerson } from '../app/apiRequests';
import PersonInfoField from '../components/PersonInfoField';

//загрузка данных персоны
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
  await changePersonData(data);

  return null;
}

//КОМПОНЕНТ(роут) СТРАНИЦЫ ЛИЧНЫХ ДАННЫХ ПЕРСОНЫ(юзера/админа)
export default function PersonInfo() {
  const personState = useSelector((state) => state.user);
  const { person } = useLoaderData();

  useLogin(person);
  
  return (
    <div
      className="w-full h-full flex flex-col items-center"
    >
      <span
        className="mt-[80px] mb-[40px]"
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
          <img src={personState.avatar} alt="ava" />
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
    </div>
  );
}
