import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  orderHistory: [],
  creatingOrder: false,
  createError: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Create order actions
    createOrderRequest: (state) => {
      state.creatingOrder = true;
      state.createError = null;
    },
    createOrderSuccess: (state, action) => {
      state.creatingOrder = false;
      const order = action.payload;
      state.orders.push(order);
      state.currentOrder = order;
      state.orderHistory.push(order);
    },
    createOrderFailure: (state, action) => {
      state.creatingOrder = false;
      state.createError = action.payload;
    },
    
    // Fetch orders actions
    fetchOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.orderHistory = action.payload;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Fetch order by ID actions
    fetchOrderByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    },
    fetchOrderByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    
    // Update order status
    updateOrderStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOrderStatusSuccess: (state, action) => {
      state.loading = false;
      const { orderId, status } = action.payload;
      
      // Update in orders array
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex >= 0) {
        state.orders[orderIndex].payload.orderStatus = status;
      }
      
      // Update in order history
      const historyIndex = state.orderHistory.findIndex(order => order.id === orderId);
      if (historyIndex >= 0) {
        state.orderHistory[historyIndex].payload.orderStatus = status;
      }
      
      // Update current order if it's the same
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.payload.orderStatus = status;
      }
    },
    updateOrderStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Cancel order
    cancelOrderRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    cancelOrderSuccess: (state, action) => {
      state.loading = false;
      const { orderId } = action.payload;
      state.orders = state.orders.filter(order => order.id !== orderId);
      state.orderHistory = state.orderHistory.filter(order => order.id !== orderId);
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder = null;
      }
    },
    cancelOrderFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear all data
    clearOrders: (state) => {
      state.orders = [];
      state.orderHistory = [];
      state.currentOrder = null;
    },
  },
});

export const {
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderByIdRequest,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  clearCurrentOrder,
  updateOrderStatusRequest,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  cancelOrderRequest,
  cancelOrderSuccess,
  cancelOrderFailure,
  clearOrders,
} = orderSlice.actions;

export default orderSlice.reducer;