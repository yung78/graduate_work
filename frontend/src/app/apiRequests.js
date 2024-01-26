import localforage from 'localforage';
import { saveAs } from 'file-saver';
//ФУНКЦИИ ОТПРАВКИ ЗАПРОСОВ НА СЕРВЕР:

//Функция регистрации
export async function registration(data) {
  try {
    const response = await fetch(process.env.REACT_APP_REGISTRATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status !== 201 && response.status !== 409) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch(err) {
    throw new Error(err.message);
  }
}

// Функция аутентификации(вход)
export async function login(data) {
  try {
    const response = await fetch(process.env.REACT_APP_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.status !== 200 && response.status !== 404) {
      throw new Error(response.statusText);
    }

    const result = await response.json();

    // При успешной аутентификации получаем токен сессии и сохраняем в localforage, при не успешной - sessionToken: undefind
    await localforage.setItem('sessionToken', result.sessionToken);

    return result;
  } catch(err) {
    throw new Error(err.message);
  }
}

// Функция проверки на флаг администратора
export async function isAdmin() {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_ISADMIN_URL, {
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

// Функция запроса данных по персоне(админ/пользователь) которая уже прошла аутентификацию
export async function getPerson() {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_GET_AUTH_URL, {
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

// Функция отмены аутентификации(выход)
export async function logout() {
  const token = await localforage.getItem('sessionToken');
  await localforage.setItem('sessionToken', undefined);
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_LOGOUT_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    if (response.status !== 200 && response.status !== 403) {
      throw new Error(response.statusText);
    }
    

    return;
  } catch(err) {
    throw new Error(err.message);
  }
}

//Функция загрузки аватара
export async function loadAvatar(formData) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_CHANGE_PERSON_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': await localforage.getItem('sessionToken'),
      },
      body: formData,
    });
    
    if (response.status !== 201 && response.status !== 403) {
      throw new Error(response.statusText);
    }

    const result = await response.json();

    return result;
  } catch(err) {
    throw new Error(err.message);
  }
}


//Функция внесения изменений в личные данные
export async function changePersonData(data) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_CHANGE_PERSON_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await localforage.getItem('sessionToken'),
      },
      body: JSON.stringify(data),
    });
    
    if (response.status !== 201 && response.status !== 403 && response.status !== 400) {
      throw new Error(response.statusText);
    }

    const result = await response.json();
    return result;
  } catch(err) {
    throw new Error(err.message);
  }
}

//Функция отправки файлов на сервер
export async function sendFiles(formData) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': await localforage.getItem('sessionToken'),
      },
      body: formData,
    });

    if (response.status !== 201 && response.status !== 403) {
      throw new Error(response.statusText);
    }

    const result = await response.json();

    return result;
  } catch(err) {
    throw new Error(err.message);
  }
}

//Функция удаления файла из хранилища
export async function deleteFile(fileName) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_DELETE_URL + fileName, {
      method: 'DELETE',
      headers: {
        'Authorization': await localforage.getItem('sessionToken'),
      },
    });

    if (response.status !== 204 && response.status !== 403) {
      throw new Error(response.statusText);
    }
 
    return response;
  } catch(err) {
    throw new Error(err.message);
  }
}

//Функция сохранения(скачки) файла на клиенте
export async function getFile(fileName) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_DOWNLOAD_URL + fileName, {
      method: 'GET',
      headers: {
        'Authorization': await localforage.getItem('sessionToken'),
      },
    });

    if (response.status !== 200 && response.status !== 403) {
      throw new Error(response.statusText);
    }

    const blob = await response.blob();

    return saveAs(blob, fileName);
  } catch(err) {
    throw new Error(err.message);
  }
}

//Функция для получения ссылки сохранения(скачки) файла сторонним пользователем
export async function getDownloadURL(fileName) {
  try {
    // Запрос с использованием токена сеанса в заголовке
    const response = await fetch(process.env.REACT_APP_GET_FILE_URL + fileName, {
      method: 'GET',
      headers: {
        'Authorization': await localforage.getItem('sessionToken'),
      },
    });

    if (response.status !== 200 && response.status !== 403) {
      throw new Error(response.statusText);
    }

    const downloadUrl = await response.json();

    return downloadUrl;
  } catch(err) {
    throw new Error(err.message);
  }
}

//Функция для сохранения(скачки) файла сторонним пользователем
export async function getFileByLink(params) {
  try {
    const response = await fetch(process.env.REACT_APP_GET_FILE_BY_LINK + params);

    if ((response.status !== 200) && (response.status !== 404)) {
      throw new Error(response.statusText);
    }

    // Ошибка при вводе некорректной ссылки
    if (response.status === 404) {
      return { error: true };
    }

    //Получение оригинального имени файла из заголовка 'Content-Disposition'
    let fileName;
    if (decodeURIComponent(response.headers.get('Content-Disposition')).includes('filename*')) {
      fileName = decodeURIComponent(response.headers.get('Content-Disposition').split("''")[1]);
    } else {
      fileName = decodeURIComponent(response.headers.get('Content-Disposition')).split("=")[1].replaceAll('"', '');
    }

    const blob = await response.blob();

    return { [fileName]: blob };
  } catch(err) {
    throw new Error(err.message);
  }
}
