import localforage from 'localforage';


// Функция запроса данных по всем пользователям
export async function getUsersData() {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_ADMIN_GET_ALL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await localforage.getItem('sessionToken'),
      },
    });

    if (response.status !== 200 && response.status !== 403) {
      throw new Error(response.statusText);
    }

    const result = await response.json();

    return result;
  } catch(err) {
    throw new Error(err.message);
  }
}

// 
export async function getUser(id) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_ADMIN_GET_ONE + id, {
      method: 'GET',
      headers: {
        'Authorization': await localforage.getItem('sessionToken'),
      },
    });

    if (response.status !== 200 && response.status !== 403) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    return data;
  } catch(err) {
    throw new Error(err.message);
  }
}
