import { call, put, takeLatest, select } from 'redux-saga/effects';
import { ordersApi } from '../../services/api';
import { clearCartRequest } from '../slices/cartSlice';
import {
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderByIdRequest,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  updateOrderStatusRequest,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  cancelOrderRequest,
  cancelOrderSuccess,
  cancelOrderFailure,
} from '../slices/orderSlice';

// Worker saga for creating order
function* createOrderSaga(action) {
  try {
    const orderData = action.payload;
    
    // Call API to create order
    const response = yield call(ordersApi.createOrder, orderData);
    
    // Transform the response to match our app structure
    const transformedOrder = {
      id: response.data.id,
      trackingNumber: `TRK${response.data.id}`,
      orderDate: response.data.createdAt,
      status: response.data.payload.orderStatus,
      items: response.data.payload.items,
      subtotal: response.data.payload.subtotal,
      deliveryFee: response.data.payload.deliveryFee,
      tax: response.data.payload.tax,
      total: response.data.payload.totalAmount,
      paymentMethod: response.data.payload.paymentMethod,
      deliveryAddress: response.data.payload.deliveryAddress,
      deliveryDate: response.data.payload.deliveryDate,
    };
    
    yield put(createOrderSuccess(transformedOrder));
    
    // Clear cart after successful order
    yield put(clearCartRequest());
    
  } catch (error) {
    yield put(createOrderFailure(error.message));
  }
}

// Worker saga for fetching orders
function* fetchOrdersSaga() {
  try {
    const response = yield call(ordersApi.getOrders);
    
    // Transform API response to match our app structure
    const transformedOrders = response.data.map(order => ({
      id: order.id,
      trackingNumber: `TRK${order.id}`,
      orderDate: order.createdAt,
      status: order.payload.orderStatus,
      items: order.payload.items,
      subtotal: order.payload.subtotal,
      deliveryFee: order.payload.deliveryFee,
      tax: order.payload.tax,
      total: order.payload.totalAmount,
      paymentMethod: order.payload.paymentMethod,
      deliveryAddress: order.payload.deliveryAddress,
      deliveryDate: order.payload.deliveryDate,
    }));
    
    yield put(fetchOrdersSuccess(transformedOrders));
  } catch (error) {
    yield put(fetchOrdersFailure(error.message));
  }
}

// Worker saga for fetching order by ID
function* fetchOrderByIdSaga(action) {
  try {
    const { orderId } = action.payload;
    const response = yield call(ordersApi.getOrderById, orderId);
    
    // Transform API response
    const transformedOrder = {
      id: response.data.id,
      trackingNumber: `TRK${response.data.id}`,
      orderDate: response.data.createdAt,
      status: response.data.payload.orderStatus,
      items: response.data.payload.items,
      subtotal: response.data.payload.subtotal,
      deliveryFee: response.data.payload.deliveryFee,
      tax: response.data.payload.tax,
      total: response.data.payload.totalAmount,
      paymentMethod: response.data.payload.paymentMethod,
      deliveryAddress: response.data.payload.deliveryAddress,
      deliveryDate: response.data.payload.deliveryDate,
    };
    
    yield put(fetchOrderByIdSuccess(transformedOrder));
  } catch (error) {
    yield put(fetchOrderByIdFailure(error.message));
  }
}

// Worker saga for updating order status
function* updateOrderStatusSaga(action) {
  try {
    const { orderId, status } = action.payload;
    
    // Update in API
    const updates = {
      payload: {
        orderStatus: status,
      }
    };
    yield call(ordersApi.updateOrder, orderId, updates);
    
    // Update local state
    yield put(updateOrderStatusSuccess({ orderId, status }));
  } catch (error) {
    yield put(updateOrderStatusFailure(error.message));
  }
}

// Worker saga for canceling order
function* cancelOrderSaga(action) {
  try {
    const { orderId } = action.payload;
    
    // Cancel in API
    yield call(ordersApi.cancelOrder, orderId);
    
    // Update local state
    yield put(cancelOrderSuccess({ orderId }));
  } catch (error) {
    yield put(cancelOrderFailure(error.message));
  }
}

// Watcher saga
export function* watchOrderSaga() {
  yield takeLatest(createOrderRequest.type, createOrderSaga);
  yield takeLatest(fetchOrdersRequest.type, fetchOrdersSaga);
  yield takeLatest(fetchOrderByIdRequest.type, fetchOrderByIdSaga);
  yield takeLatest(updateOrderStatusRequest.type, updateOrderStatusSaga);
  yield takeLatest(cancelOrderRequest.type, cancelOrderSaga);
}