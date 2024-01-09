import { configureStore} from '@reduxjs/toolkit';
import appReducer from '../slices/appSlice';
import userReducer from '../slices/userSlice';
import cloudReducer from '../slices/cloudSlice';
import createSagaMiddleware from 'redux-saga';
import saga from '../saga/appSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    cloud: cloudReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware)
});

sagaMiddleware.run(saga);
