import { call, put, takeLatest } from 'redux-saga/effects';
import { equipmentApi } from '../../services/api';
import {
  fetchEquipmentRequest,
  fetchEquipmentSuccess,
  fetchEquipmentFailure,
  fetchEquipmentByCategoryRequest,
  fetchEquipmentByCategorySuccess,
  fetchEquipmentByCategoryFailure,
  fetchEquipmentByIdRequest,
  fetchEquipmentByIdSuccess,
  fetchEquipmentByIdFailure,
} from '../slices/equipmentSlice';

// Worker saga for fetching all equipment
function* fetchEquipmentSaga() {
  try {
    const response = yield call(equipmentApi.getEquipment);
    yield put(fetchEquipmentSuccess(response.data));
  } catch (error) {
    yield put(fetchEquipmentFailure(error.message));
  }
}

// Worker saga for fetching equipment by category
function* fetchEquipmentByCategorySaga(action) {
  try {
    const { category } = action.payload;
    const response = yield call(equipmentApi.getEquipmentByCategory, category);
    yield put(fetchEquipmentByCategorySuccess({ category, data: response.data }));
  } catch (error) {
    yield put(fetchEquipmentByCategoryFailure(error.message));
  }
}

// Worker saga for fetching equipment by ID
function* fetchEquipmentByIdSaga(action) {
  try {
    const { id } = action.payload;
    const response = yield call(equipmentApi.getEquipmentById, id);
    yield put(fetchEquipmentByIdSuccess(response.data));
  } catch (error) {
    yield put(fetchEquipmentByIdFailure(error.message));
  }
}

// Watcher saga
export function* watchEquipmentSaga() {
  yield takeLatest(fetchEquipmentRequest.type, fetchEquipmentSaga);
  yield takeLatest(fetchEquipmentByCategoryRequest.type, fetchEquipmentByCategorySaga);
  yield takeLatest(fetchEquipmentByIdRequest.type, fetchEquipmentByIdSaga);
}