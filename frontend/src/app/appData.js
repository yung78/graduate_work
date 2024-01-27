// Подбор иконки для расширения файла
export const handleName = (fileName) => {
  const extension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
  if (extension === "") {
    return ('/img/file_icons/file.png');
  }

  if (appData.files.includes(extension)) {
    return (`/img/file_icons/${extension}.png`);
  }

  return ('/img/file_icons/unknown.png');
}


const appData = {
  files: [
    '7zip',
    'avi',
    'css',
    'csv',
    'doc',
    'docx',
    'dwg',
    'gif',
    'html',
    'jpg',
    'js',
    'json',
    'mp3',
    'mp4',
    'odt',
    'pdf',
    'png',
    'rar',
    'svg',
    'txt',
    'wav',
    'xls',
    'xml',
    'zip',
  ],
  cloudButtons: {
    'скачать': '/img/clouddown.png',
    'поделиться': '/img/cloudshare.png',
    'загрузить': '/img/cloudup.png',
    'удалить': '/img/clouddelete.png',
  },
  adminButtons: [
    'добавить',
    'удалить',
    'изменить',
  ]
};

export default appData;
