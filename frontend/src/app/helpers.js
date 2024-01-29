import appData from './appData';

//Показ сообщений ошибок/успеха
export const showMsg = (data, timer, setMessage) => {
  setMessage(data);
  setTimeout(() => setMessage(false), timer);
};

// Перевод размера файла в читабильный вид
export const fileSize = (size) => {
  return ((size/1024).toFixed(1) < 1000 ? (size/1024).toFixed(1) + ' Kb' : ((size/1024)/1024).toFixed(1) + ' Mb');
};

// Подборка иконки файла
export const handleName = (fileName) => {
  const extension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
  if (extension === "") {
    return ('/img/file_icons/file.png');
  }
  if (appData.files.includes(extension)) {
    return (`/img/file_icons/${extension}.png`);
  }
  return ('/img/file_icons/unknown.png');
};


