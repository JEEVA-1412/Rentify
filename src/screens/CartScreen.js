import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import CustomDrawer from '../components/CustomDrawer'; // Add this import
import {
  removeFromCartRequest,
  updateCartItemLocally,
  clearCartRequest,
  fetchCartRequest,
} from '../redux/slices/cartSlice';

const CartScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const drawerRef = useRef(); // Add drawerRef
  
  const {
    cartItems,
    loading,
    cartTotal,
    itemCount,
  } = useSelector(state => state.cart);

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  const handleQuantityChange = (itemId, change) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1) {
        dispatch(updateCartItemLocally({ id: itemId, updates: { quantity: newQuantity } }));
      }
    }
  };

  const handleDurationChange = (itemId, change) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      const newDuration = item.rentalDuration + change;
      if (newDuration >= 1) {
        dispatch(updateCartItemLocally({ id: itemId, updates: { rentalDuration: newDuration } }));
      }
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => dispatch(removeFromCartRequest({ cartItemId: itemId })), style: 'destructive' }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => dispatch(clearCartRequest()), style: 'destructive' }
      ]
    );
  };

  const calculateItemTotal = (item) => {
    if (item.price) {
      return item.price * item.quantity;
    }
    const rate = item.rentalType === 'Hour' ? item.hourlyRate : item.dailyRate;
    return rate * item.quantity * item.rentalDuration;
  };

  const renderCartItem = ({ item }) => {
    const itemTotal = calculateItemTotal(item);
    
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category} • {item.rentalType}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
              <Icon name="close" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.controlsContainer}>
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Quantity</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleQuantityChange(item.id, -1)}
                >
                  <Icon name="remove" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Icon name="add" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>
                {item.rentalType === 'Hour' ? 'Hours' : 'Days'}
              </Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleDurationChange(item.id, -1)}
                >
                  <Icon name="remove" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{item.rentalDuration}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleDurationChange(item.id, 1)}
                >
                  <Icon name="add" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Total</Text>
              <Text style={styles.itemTotal}>₹{itemTotal}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Shopping Cart" 
          showDrawer={true} 
          drawerRef={drawerRef}
        />
        <CustomDrawer ref={drawerRef} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Header 
          title="Shopping Cart" 
          showDrawer={true} 
          drawerRef={drawerRef}
        />
        <CustomDrawer ref={drawerRef} />
        <View style={styles.emptyContainer}>
          <Icon name="remove-shopping-cart" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add equipment to your cart to get started
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.shopButtonText}>Browse Equipment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const deliveryFee = cartTotal > 5000 ? 0 : 200;
  const tax = cartTotal * 0.18; // 18% GST
  const totalAmount = cartTotal + deliveryFee + tax;

  return (
    <View style={styles.container}>
      <Header 
        title="Shopping Cart" 
        showDrawer={true} 
        drawerRef={drawerRef}
      />
      
      <CustomDrawer ref={drawerRef} />
      
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => `${item.id}-${item.rentalType}`}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.cartHeader}>
            <Text style={styles.itemCount}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </Text>
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearCart}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearCart: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  summary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  checkoutButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CartScreen;