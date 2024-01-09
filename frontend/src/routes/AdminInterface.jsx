import { redirect, useLoaderData } from 'react-router-dom';
import { isAdmin, getPerson } from '../app/apiRequests';
import { useLogin } from '../app/customHooks';
import { useSelector } from 'react-redux';

// При загрузке дополнительно проверяем авторизацию и получаем данные админа
export async function loader() {
  const check = await isAdmin();
  if (!check.admin) {
    return redirect('/user');
  }
  const person = await getPerson();

  if (person.error) {
    return redirect('/');
  }

  return { person };
}

//КОМПОНЕНТ(роут) ИНТЕРФЕЙСА АДМИНИСТРАТОРА
export default function AdminInterface() {
  const { person } = useLoaderData()
  const state = useSelector(state => state.user)
  console.log(state);
  useLogin(person);
  
  return (
    <div>АДМИН</div>
  );
}
