import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import equipmentReducer from './slices/equipmentSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import rootSaga from './sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    equipment: equipmentReducer,
    cart: cartReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;