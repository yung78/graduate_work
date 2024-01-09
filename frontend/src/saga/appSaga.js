import {  put, spawn, debounce } from 'redux-saga/effects';
import { hideMessage, showMessage } from '../slices/cloudSlice';

// Отображение сообщения "Вы не выбрали файл!" (watcher)
function* watchShowMessage() {
  yield debounce(3000, showMessage.type, handleShowMessage);
}

// Отображение сообщения "Вы не выбрали файл!" (worker)
function* handleShowMessage() {
  yield put(hideMessage());
}

export default function* saga() {
  yield spawn(watchShowMessage);
}
