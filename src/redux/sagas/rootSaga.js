import { all } from 'redux-saga/effects';
import { watchEquipmentSaga } from './equipmentSaga';
import { watchCartSaga } from './cartSaga';
import { watchOrderSaga } from './orderSaga';

export default function* rootSaga() {
  yield all([
    watchEquipmentSaga(),
    watchCartSaga(),
    watchOrderSaga(),
  ]);
}