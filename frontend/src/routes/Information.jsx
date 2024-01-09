import { Link } from 'react-router-dom';

//КОМПОНЕНТ(роут) С ИНФОРМАЦИЕЙ О ПРОЕКТЕ
export default function Information() {
  return (
    <div
      className="p-10"
    >
      <h1
        className="my-8 w-full text-center font-bold text-sm"
      >
        ИНФОРМАЦИЯ:
      </h1>
      <p
        className="indent-5"
      >
        Все, используемые в проекте, изображения/иконки/значки найдены на бесплатном ресурсе &nbsp;
        <Link
          to="https://icon-icons.com/"
          className="underline"
          target="_blank"
        >
          https://icon-icons.com/
        </Link>
        &nbsp;, некоторые из них изменены с помощью графического редактора &nbsp;
        <Link
          to="https://lazpaint.github.io/"
          className="underline"
          target="_blank"
        >
          "LazPaint"
        </Link>
        .
      </p>
    </div>
  );
}