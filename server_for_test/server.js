import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import uniqid from 'uniqid';
import customId from 'custom-id';
import fileUpload from 'express-fileupload';
import {unlink} from 'fs';

const app = express();

app.use(cors());

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
      files: [],
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
        'some very long name of photo.jpg': {
          name: 'some very long naim of photo.jpg',
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
    return res.status(409).json({ error: "Already exist" });
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

  return res.status(201).send({success: true});
});

//Вход в систему
app.post('/login', function (req, res) {
  let sessionToken = null;
  const {email, password} = req.body;
  users.forEach((user) => {
    if (user.user.email === email && user.password === password) {
      sessionToken = uniqid();
      user.sessionToken = sessionToken;
      user.user.lastVisit = Date.now();

      return;
    }
  });

  if (sessionToken) {
    return res.status(200).send({sessionToken});
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

  return res.status(403).send({error:'You are not authorized'});
});

//Изменение данных персоны
app.patch('/change_person_data', checkAuth, function (req, res) {
  console.log('change');
  let changedField = {};
  users.forEach((user) => {
    if (user.sessionToken === req.headers.authorization) {
      user.user[Object.keys(req.body)[0]] = req.body[Object.keys(req.body)[0]];
      changedField = req.body;

      return;
    }
  });

  if (changedField) {
    return res.status(201).send(changedField);
  }

  return res.status(403).send({error:'You are not authorized'});
});

//Загрузка файлов пользователя
app.post('/upload_files', checkAuth, function (req, res) {
  let userData;
  console.log('upload')
  console.log(req.checkAuth);

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({error: 'No files were uploaded.'});
  }

  users.forEach((user) => {
    if (user.sessionToken === req.headers.authorization) {
      userData = user.user;

      return;
    }
  });

  if (userData) {
    let errors = [];

    Object.keys(req.files).forEach((file) => {
      userData.files[file] = {
        name: file,
        size: req.files[file].size,
        created: Date.now(),
      };
      const uploadFile = req.files[file];
      const uploadPath = `./usersClouds/${userData.id}/${file}`;

      uploadFile.mv(uploadPath, function(err) {
        if (err) {
          return errors.push(err);
        }
      });
    });

    if (errors.length > 0) {
      return res.status(500).send({error: errors});
    }

    return res.status(201).send(userData.files);
  }

  return res.status(403).send({error:'You are not authorized'});
});

//Удалить файл пользователя
app.delete('/delete_file/:fileName', checkAuth, function (req, res) {
  console.log('delete')
  if (req.checkAuth) {
    console.log(req.params)
    const fileName = req.params.fileName;
    unlink(`./usersClouds/${req.checkAuth.id}/${fileName}`, (err) => {
      if (err) {
          throw err;
      }
    });
    res.status(204).send({ a: '123456'});
  }
});


const port = process.env.PORT || 7070;
app.listen(port, () =>
  console.log(`The server is running on http://localhost:${port}`)
);
