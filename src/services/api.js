import axios from 'axios';

const API_BASE_URL = 'https://69462d90ed253f51719d3cf2.mockapi.io';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get current user ID (you'll need to implement user auth)
const getUserId = () => {
  // For now, return a demo user ID
  // In a real app, get this from your auth context/store
  return 'u101';
};

// Equipment API
export const equipmentApi = {
  getEquipment: (category = null) => {
    const url = category ? `/equipment?category=${category}` : '/equipment';
    return api.get(url);
  },
  
  getEquipmentById: (id) => {
    return api.get(`/equipment/${id}`);
  },
  
  getEquipmentByCategory: (category) => {
    return api.get(`/equipment?category=${category}`);
  },
};

// Cart API - Uses type="cart"
export const cartApi = {
  // Get cart items for user
  getCart: () => {
    const userId = getUserId();
    return api.get(`/cart?type=cart&userId=${userId}`);
  },
  
  // Add item to cart
  addToCart: (cartItem) => {
    const userId = getUserId();
    const formattedItem = {
      type: 'cart',
      userId: userId,
      payload: {
        itemId: cartItem.id,
        name: cartItem.name,
        category: cartItem.category,
        subCategory: cartItem.subCategory,
        rentType: cartItem.rentalType,
        price: cartItem.price,
        quantity: cartItem.quantity,
        image: cartItem.image,
        rentalDuration: cartItem.rentalDuration,
        rentPerHour: cartItem.hourlyRate,
        rentPerDay: cartItem.dailyRate,
      },
      createdAt: new Date().toISOString(),
    };
    return api.post('/cart', formattedItem);
  },
  
  // Remove item from cart
  removeFromCart: (id) => {
    return api.delete(`/cart/${id}`);
  },
  
  // Clear all cart items for user
  clearCart: () => {
    const userId = getUserId();
    return api.get(`/cart?type=cart&userId=${userId}`);
  },
};

// Orders API - Uses type="order"
export const ordersApi = {
  // Create order (place order)
  createOrder: (orderData) => {
    const userId = getUserId();
    const formattedOrder = {
      type: 'order',
      userId: userId,
      payload: {
        items: orderData.items,
        totalAmount: orderData.total,
        paymentMethod: orderData.paymentMethod,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDate: orderData.deliveryDate,
        orderStatus: 'Placed',
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        tax: orderData.tax,
      },
      createdAt: new Date().toISOString(),
    };
    return api.post('/cart', formattedOrder);
  },
  
  // Get user orders
  getOrders: () => {
    const userId = getUserId();
    return api.get(`/cart?type=order&userId=${userId}`);
  },
  
  // Get order by ID
  getOrderById: (id) => {
    return api.get(`/cart/${id}`);
  },
  
  // Update order status
  updateOrder: (id, updates) => {
    return api.put(`/cart/${id}`, updates);
  },
  
  // Cancel order
  cancelOrder: (id) => {
    return api.delete(`/cart/${id}`);
  },
};