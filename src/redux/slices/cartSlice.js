import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  cartItemsFromApi: [],
  loading: false,
  error: null,
  cartTotal: 0,
  itemCount: 0,
  isSynced: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Cart actions
    addToCartRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addToCartSuccess: (state, action) => {
      state.loading = false;
      const cartItem = action.payload;
      
      // Map API response to local cart item format
      const localCartItem = {
        id: cartItem.id || Date.now().toString(),
        itemId: cartItem.itemId,
        name: cartItem.name,
        rentalType: cartItem.rentType,
        price: cartItem.price,
        quantity: cartItem.quantity,
        image: cartItem.image,
        rentalDuration: cartItem.rentalDuration || 1,
        hourlyRate: cartItem.hourlyRate,
        dailyRate: cartItem.dailyRate,
      };
      
      const existingItemIndex = state.cartItems.findIndex(
        item => item.itemId === cartItem.itemId && item.rentalType === cartItem.rentType
      );
      
      if (existingItemIndex >= 0) {
        state.cartItems[existingItemIndex] = {
          ...state.cartItems[existingItemIndex],
          quantity: state.cartItems[existingItemIndex].quantity + cartItem.quantity,
        };
      } else {
        state.cartItems.push(localCartItem);
      }
      
      // Update totals
      state.itemCount = state.cartItems.length;
      state.cartTotal = calculateCartTotal(state.cartItems);
    },
    addToCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Get cart items from API
    fetchCartRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCartSuccess: (state, action) => {
      state.loading = false;
      state.cartItemsFromApi = action.payload;
      
      // Map API cart items to local format
      const localCartItems = action.payload.map(item => ({
        id: item.id,
        itemId: item.itemId,
        name: item.name,
        rentalType: item.rentType,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        rentalDuration: item.rentalDuration || 1,
        hourlyRate: item.hourlyRate,
        dailyRate: item.dailyRate,
      }));
      
      state.cartItems = localCartItems;
      state.itemCount = localCartItems.length;
      state.cartTotal = calculateCartTotal(localCartItems);
      state.isSynced = true;
    },
    fetchCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Remove from cart
    removeFromCartRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeFromCartSuccess: (state, action) => {
      state.loading = false;
      const { cartItemId } = action.payload;
      state.cartItems = state.cartItems.filter(item => item.id !== cartItemId);
      state.itemCount = state.cartItems.length;
      state.cartTotal = calculateCartTotal(state.cartItems);
    },
    removeFromCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Update cart item locally
    updateCartItemLocally: (state, action) => {
      const { id, updates } = action.payload;
      const itemIndex = state.cartItems.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        state.cartItems[itemIndex] = { ...state.cartItems[itemIndex], ...updates };
        state.cartTotal = calculateCartTotal(state.cartItems);
      }
    },
    
    // Clear cart
    clearCartRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    clearCartSuccess: (state) => {
      state.loading = false;
      state.cartItems = [];
      state.cartItemsFromApi = [];
      state.itemCount = 0;
      state.cartTotal = 0;
      state.isSynced = false;
    },
    clearCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Sync cart with API
    syncCartRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    syncCartSuccess: (state) => {
      state.loading = false;
      state.isSynced = true;
    },
    syncCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Helper function to calculate cart total based on your data structure
const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    if (item.price) {
      return total + (item.price * item.quantity);
    }
    // Calculate based on rental type and duration
    const rate = item.rentalType === 'Hour' ? item.hourlyRate : item.dailyRate;
    return total + (rate * item.quantity * (item.rentalDuration || 1));
  }, 0);
};

export const {
  addToCartRequest,
  addToCartSuccess,
  addToCartFailure,
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFailure,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFailure,
  updateCartItemLocally,
  clearCartRequest,
  clearCartSuccess,
  clearCartFailure,
  syncCartRequest,
  syncCartSuccess,
  syncCartFailure,
} = cartSlice.actions;

export default cartSlice.reducer;