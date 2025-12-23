import { call, put, takeLatest, select } from 'redux-saga/effects';
import { cartApi } from '../../services/api';
import {
  addToCartRequest,
  addToCartSuccess,
  addToCartFailure,
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFailure,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFailure,
  clearCartRequest,
  clearCartSuccess,
  clearCartFailure,
  syncCartRequest,
  syncCartSuccess,
  syncCartFailure,
  updateCartItemLocally,
} from '../slices/cartSlice';

// Selector to get cart items from state
const getCartItems = (state) => state.cart.cartItems;

// Worker saga for adding item to cart
function* addToCartSaga(action) {
  try {
    const cartItem = action.payload;
    
    // Calculate price based on rental type
    const price = cartItem.rentalType === 'Hour' 
      ? cartItem.hourlyRate * cartItem.rentalDuration
      : cartItem.dailyRate * cartItem.rentalDuration;
    
    const itemToSend = {
      ...cartItem,
      price: price,
    };
    
    // Send to API
    const response = yield call(cartApi.addToCart, itemToSend);
    
    // Update local state with API response
    yield put(addToCartSuccess(response.data));
    
  } catch (error) {
    yield put(addToCartFailure(error.message));
  }
}

// Worker saga for fetching cart items
function* fetchCartSaga() {
  try {
    const response = yield call(cartApi.getCart);
    yield put(fetchCartSuccess(response.data));
  } catch (error) {
    yield put(fetchCartFailure(error.message));
  }
}

// Worker saga for removing item from cart
function* removeFromCartSaga(action) {
  try {
    const { cartItemId } = action.payload;
    
    // Delete from API
    yield call(cartApi.removeFromCart, cartItemId);
    
    // Update local state
    yield put(removeFromCartSuccess({ cartItemId }));
    
  } catch (error) {
    yield put(removeFromCartFailure(error.message));
  }
}

// Worker saga for clearing cart
function* clearCartSaga() {
  try {
    // Get current cart items
    const cartItems = yield select(getCartItems);
    
    // Delete each item from API one by one
    for (const item of cartItems) {
      if (item.id) {
        yield call(cartApi.removeFromCart, item.id);
      }
    }
    
    // Clear local state
    yield put(clearCartSuccess());
    
  } catch (error) {
    yield put(clearCartFailure(error.message));
  }
}

// Worker saga for syncing cart
function* syncCartSaga() {
  try {
    // Fetch latest from API
    yield put(fetchCartRequest());
    yield put(syncCartSuccess());
  } catch (error) {
    yield put(syncCartFailure(error.message));
  }
}

// Watcher saga
export function* watchCartSaga() {
  yield takeLatest(addToCartRequest.type, addToCartSaga);
  yield takeLatest(fetchCartRequest.type, fetchCartSaga);
  yield takeLatest(removeFromCartRequest.type, removeFromCartSaga);
  yield takeLatest(clearCartRequest.type, clearCartSaga);
  yield takeLatest(syncCartRequest.type, syncCartSaga);
}