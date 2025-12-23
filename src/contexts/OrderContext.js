import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    // Sample orders for testing
    {
      id: '1',
      trackingNumber: 'TRK123456',
      orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
      items: [
        {
          id: '1',
          name: 'Caterpillar Excavator 320',
          category: 'Heavy Machinery',
          hourlyRate: 125,
          dailyRate: 850,
          rentalType: 'daily',
          quantity: 1,
          rentalDuration: 3,
        }
      ],
      subtotal: 2550,
      deliveryFee: 0,
      tax: 204,
      total: 2754,
      paymentMethod: 'card',
      deliveryAddress: '123 Main St, City, Country',
      deliveryDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cardLastFour: '4242',
    },
    {
      id: '2',
      trackingNumber: 'TRK789012',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      items: [
        {
          id: '4',
          name: 'Skid Steer Loader',
          category: 'Compact Equipment',
          hourlyRate: 55,
          dailyRate: 350,
          rentalType: 'hourly',
          quantity: 2,
          rentalDuration: 8,
        }
      ],
      subtotal: 880,
      deliveryFee: 50,
      tax: 70.4,
      total: 1000.4,
      paymentMethod: 'cash',
      deliveryAddress: '456 Oak Ave, Town, Country',
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ]);

  const placeOrder = (orderData) => {
    const newOrder = {
      id: Date.now().toString(),
      ...orderData,
      orderDate: new Date().toISOString(),
      status: 'confirmed',
      trackingNumber: `TRK${Date.now().toString().slice(-6)}`,
    };
    
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const cancelOrder = (orderId) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{
      orders,
      placeOrder,
      getOrderById,
      cancelOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
};