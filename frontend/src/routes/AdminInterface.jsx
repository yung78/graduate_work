import { redirect, useLoaderData } from 'react-router-dom';
import { isAdmin, getPerson } from '../app/apiRequests';
import { useLogin, useOutsideFileClick } from '../app/customHooks';
import { useSelector } from 'react-redux';
import { getUsersData } from '../app/adminApiRequests';
import UsersList from '../components/UsersList';
import HeaderAdmin from '../components/HeaderAdmin';
import ModalAddUser from '../components/ModalAddChangeUser';

// При загрузке дополнительно проверяем авторизацию и получаем данные админа и всех пользователей
export async function loader() {
  const check = await isAdmin();
  if (!check.admin) {
    return redirect('/user');
  }

  const person = await getPerson();
  const data = await getUsersData();

  if (person.error || data.error) {
    return redirect('/');
  }
  return { person, data };
}

//КОМПОНЕНТ(роут) ИНТЕРФЕЙСА АДМИНИСТРАТОРА
export default function AdminInterface() {
  const cloudState = useSelector((state) => state.cloud)
  const adminState = useSelector((state) => state.admin)
  const { person, data } = useLoaderData();

  useLogin(person);
  useOutsideFileClick();


  return (
    <div
      className="w-full min-h-full bg-blue-200"
    >
      <>
        {adminState.addModal ? (<ModalAddUser />):(<></>)}
      </>
      <HeaderAdmin />
      <>
        {cloudState.message ? (
          <div
            className="mx-auto h-4 block font-bold text-center text-red-800"
          >
            <span
              className="text-xs"
            >
              Вы не выбрали пользователя!
            </span>
          </div>
        ) : (
          <div className="h-4"></div>
        )}
      </>
      <section
        className="w-full flex flex-col"
      >      
        {Object.keys(data).map((user) => (
          <UsersList 
            user={data[user]}
            key={user}
          />
        ))}
      </section>
    </div>
  );
}
