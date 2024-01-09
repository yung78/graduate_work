import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../slices/appSlice';
import { loadPersonData, resetPersonData } from '../slices/userSlice';
import { addUserFiles, deleteFocusOnFile, hideDeleteConfirm, hideShareURL, resetCloud, saveDownloadURL } from '../slices/cloudSlice';
import { getDownloadURL } from './apiRequests';

//Хук загрузки данных в состояния при прохождении аутентификации(вход)
export function useLogin(data) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(login());
    dispatch(loadPersonData(data));
    dispatch(addUserFiles(data.files));
  },[]);
}

//Хук очистки данных состояний при обратной аутентификации(выход)
export function useLogout() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(logout());
    dispatch(resetPersonData());
    dispatch(resetCloud());
  },[]);
}

//Хук обработки кликов для снятия фокуса с файла
export function useOutsideFileClick() {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleOutsideFileClick = (e) => {
      if ((e.target.closest('.btn')) || (e.target.closest('.file')) || (e.target.closest('.modal'))) {
        return;
      }

      dispatch(deleteFocusOnFile());
      dispatch(hideShareURL());
      dispatch(hideDeleteConfirm());
      return;
    }

    document.addEventListener('click', handleOutsideFileClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideFileClick);
    }
  }, []);
}

export function useGetURL() {
  const dispatch = useDispatch();
  const cloudState = useSelector((state) => state.cloud);

  useEffect(() => {
    (async () => {
      const response = await getDownloadURL(cloudState.onFocus);
      dispatch(saveDownloadURL(response.url));
    })();
  }, []);
}

