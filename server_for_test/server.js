import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import uniqid from 'uniqid';
import customId from 'custom-id';
import fileUpload from 'express-fileupload';
import {unlink} from 'fs';
import mime from 'mime';
import cryptoJs from 'crypto-js';

// Исправить позже(возможно уже в приложении django):
// 1)Вставить try-catch () во все middleware
// 2)Решить проблему с дублированием имен сохраняемых файлов
// 3)Сохранение аватара
// 4)Изменение пароля пользователя
// 5)Логирование? Как реализовать

const app = express();

app.use(cors({ exposedHeaders: ['Content-Disposition'] }));

app.use(
  bodyParser.json()
);

app.use(
  fileUpload({
    createParentPath: true,
    defCharset: 'utf8',
    defParamCharset: 'utf8'
  })
);

app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});

let users = [
  {
    password: 'admin',
    sessionToken: null,
    user: {
      id: 1,
      name: 'Alexey',
      lastName: 'Yung',
      created: 1700662349000,
      email: 'alexey@mail.ru',
      avatar: 'https://cdn2.thecatapi.com/images/MTY1ODc5MA.png',
      isAdmin: true,
      files: {},
      lastVisit: 1700662449000
    }
  },
  { 
    password: 'qwerty',
    sessionToken: null,
    user: {
      id: 123,
      name: 'Ivan',
      lastName: 'Ivanov',
      created: 1700662449000,
      email: 'vano@mail.ru',
      avatar: 'https://cdn2.thecatapi.com/images/daa.jpg',
      isAdmin: false,
      files: {
        'some very long name of photo made in last century.jpg': {
          name: 'some very long naim of photo made in last century.jpg',
          size: 11234,
          created: 1700962449000
        },
        'table.xls': {
          name: 'table.xls',
          size: 13934,
          created: 1700967449000
        },
        'map.pdf': {
          name: 'map.pdf',
          size: 9231234,
          created: 1701867449000
        },
        '.gitignore': {
          name: '.gitignore',
          size: 854,
          created: 1701897449000
       }
      },
      lastVisit: 1700662449000
    }
  },
];

//Функция проверки аутентификации токена
function checkAuth(req, res, next) {
  const user = users.find((user) => user.sessionToken === req.headers.authorization);
  if (user) {
    req.checkAuth = user.user;
    next();
  } else {
    res.status(403).send({error:'You are not authorized'});
  }
}

//Получение данных персоны
app.get('/authinfo', checkAuth, function (req, res) {
  res.status(200).send(req.checkAuth)
});

//Проверка авторизации (флага администратора)
app.get('/isadmin', checkAuth, function (req, res) {
  res.status(200).send({admin: req.checkAuth.isAdmin});
});

//Регистрация
app.post('/registration', function (req, res) {
  const {email, password, name, lastName} = req.body;
  let alreadyExist = false;
  users.forEach((user) => {
    if (user.user.email === req.body.email) {
      alreadyExist = true;

      return;
    }
  });

  if (alreadyExist) {
    return res.status(409).json({ error: "already exists" });
  }
 
  users.push({
    password: password,
    sessionToken: null,
    user: {
      id: customId(),
      name: name,
      lastName: lastName,
      created: Date.now(),
      email: email,
      avatar: '',
      isAdmin: false,
      files: {},
      lastVisit: null
    }
  });

  return res.status(201).send({ success: true });
});

//Вход в систему(авторизация)
app.post('/login', function (req, res) {
  let sessionToken = null;
  const { email, password } = req.body;
  users.forEach((user) => {
    if (user.user.email === email && user.password === password) {
      sessionToken = uniqid();
      user.sessionToken = sessionToken;
      user.user.lastVisit = Date.now();

      return;
    }
  });

  if (sessionToken) {
    return res.status(200).send({ sessionToken });
  }
  
  return res.status(401).json({ error: "Bad login or password" });
});

//Выход из системы
app.get('/logout', checkAuth, function (req, res) {
  let logout = false;

  users.forEach((user) => {
    if (user.sessionToken === req.headers.authorization) {
      user.sessionToken = null;
      user.user.lastVisit = Date.now();
      logout = true;

      return;
    }
  });

  if (logout) {
    return res.status(200).end();
  }

  return res.status(403).send({ error:'You are not authorized' });
});

//Изменение данных персоны
app.patch('/change_person_data', checkAuth, function (req, res) {
  if (req.checkAuth) {
    req.checkAuth[Object.keys(req.body)[0]] = req.body[Object.keys(req.body)[0]];
    return res.status(201).send(req.body);
  }

  return res.status(403).send({error:'You are not authorized'});
});

//Загрузка файлов в облачное хранилище пользователя
app.post('/upload_files', checkAuth, function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ error: 'No files were uploaded.' });
  }

  if (req.checkAuth) {
    let errors = [];

    Object.keys(req.files).forEach((file) => {
      req.checkAuth.files[file] = {
        name: file,
        size: req.files[file].size,
        created: Date.now(),
      };
      const uploadFile = req.files[file];
      const uploadPath = `./usersClouds/${ req.checkAuth.id }/${ file }`;

      uploadFile.mv(uploadPath, function(err) {
        if (err) {
          errors.push(err);
        }
      });
    });

    if (errors.length > 0) {
      return res.status(500).send({ error: err });
    }
    return res.status(201).send(req.checkAuth.files);
  } else {
    return res.status(403).send({ error:'You are not authorized' });
  }
});

//Удаление файла из облачного хранилища пользователя
app.delete('/delete_file/:fileName', checkAuth, function (req, res) {
  console.log('delete')
  const deleteError = {}
  if (req.checkAuth) {
    const fileName = req.params.fileName;
    unlink(`./usersClouds/${ req.checkAuth.id }/${ fileName }`, (err) => {
      if (err) {
        deleteError['error'] = err;

        return res.status(500).send(deleteError); 
      }

      delete req.checkAuth.files[fileName];

      return res.status(204).send();
    });
  } else {
    return res.status(403).send({ error:'You are not authorized' });
  }
});

//Отправка файла для сохранения(скачки) на стороне клиента
app.get('/download_file/:fileName', checkAuth, function (req, res) {
  if (req.checkAuth) {
    const fileName = req.params.fileName;
    const mimeType = mime.getType(fileName);

    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('Content-type', mimeType);
    res.download(`./usersClouds/${ req.checkAuth.id }/${ fileName }`, function (err) {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send({ error: err });
      } else {
        return res.end();
      }
    });
  } else {
    return res.status(403).send({ error:'You are not authorized' });
  }
});

//Отправка криптоссылки для сохранения(скачки) файла сторонним пользователем
app.get('/get_file_url/:fileName', checkAuth, function (req, res) {
  if (req.checkAuth) {
    const fileName = req.params.fileName;
    // Шифруем путь к файлу на сервере и отправляем в качестве параметра URL ссылки на файл
    const urlParamsEncrypt = cryptoJs.AES.encrypt(`${ req.checkAuth.id }/${ fileName }`, 'cript').toString().replaceAll('/', 'slash');
    return res.status(200).send({ url: `http://localhost:3000/download/${urlParamsEncrypt}` });
    
  } else {
    return res.status(403).send({ error:'You are not authorized' });
  }
});

//Отправка файла для сохранения(скачки)сторонним пользователем по криптоссылке
app.get('/download_file_by_link/:path', function (req, res) {
  try {
    // Расшифровываем путь к файлу на сервере из параметра URL ссылки
    const params = req.params.path.replaceAll('slash', '/');
    const urlParamsDecrypt = cryptoJs.AES.decrypt(params, 'cript').toString(cryptoJs.enc.Utf8);
    const mimeType = mime.getType(urlParamsDecrypt);
    // Получаем оригинальное имя файла и кодируем его (URI) для передачи в заголовках
    const fileName = encodeURIComponent(urlParamsDecrypt.replace(/^.*[\\/]/, ''));

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}; filename=${fileName}`);
    res.setHeader('Content-Type', mimeType);
    res.download(`./usersClouds/${urlParamsDecrypt}`, function (err) {
      if (err) {
        return res.status(404).end();
      } else {
        return res.status(200).end();
      }
    });
    
  } catch (err) {
    return res.status(500);
  }
});

const port = process.env.PORT || 7070;
app.listen(port, () =>
  console.log(`The server is running on http://localhost:${port}`)
);
