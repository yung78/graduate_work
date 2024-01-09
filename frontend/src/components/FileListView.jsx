import dateFormat from 'dateformat';
import { getDownloadURL } from '../app/apiRequests';
import { useSelector } from 'react-redux';

//КОМПОНЕНТ ОТОБРАЖЕНИЯ ФАЙЛОВ ПОЛЬЗОВАТЕЛЯ СПИСКОМ
export default function FileListView({ src, fileName, size, created, focus }) { 
  const cloudState = useSelector((state) => state.cloud);

  const handleCopy = async () => {
    const downloadUrl = await getDownloadURL(cloudState.onFocus);
    navigator.clipboard.writeText(downloadUrl.url);
  }

  return (
    <div
      className="file w-full h-14 p-2 flex items-center hover:bg-blue-100 focus:bg-blue-100 focus:hover:bg-blue-200 outline-none rounded-md cursor-default"
      tabIndex={-1}
      name={fileName}
      onFocus={(e) => focus(e)}
    >
      <div
        className="w-12 h-12"
      >
        
        <img src={src} alt="" />
      </div>
      <div
        className="w-3/5 h-5 px-2 text-xs"
      >
        {fileName.length > 35 ? fileName.slice(0, 28) + ' ...' + fileName.slice(-7) : fileName}
      </div>
      <div
        className="w-[13%] h-5 text-xs"
      >
        {(size/1024).toFixed(1) < 1000 ? (size/1024).toFixed(1) + ' Kb' : ((size/1024)/1024).toFixed(1) + ' Mb'} 
      </div>
      <div
        className="w-[13%] h-5 text-xs"
      >
        {dateFormat(created, 'dd.mm.yyyy')}
      </div>
      <div
        className="w-[13%] h-5 flex justify-center"
      >
        <div
          className="w-5 h-5 hover:bg-gray-200 active:shadow-[0_0px_10px_4px_rgba(34,60,80,0.2)]"
          onClick={handleCopy}
        >
          <img src="/img/copylink.png" alt="copyLink" />
        </div>
      </div>
    </div>
  );
}