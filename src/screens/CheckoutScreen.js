import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { clearCartRequest } from '../redux/slices/cartSlice';
import { createOrderRequest } from '../redux/slices/orderSlice';
import { useAuth } from '../contexts/AuthContext';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const { cartItems, cartTotal } = useSelector(state => state.cart);
  const { creatingOrder } = useSelector(state => state.order);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address || '123 Main St, Mumbai, Maharashtra, India'
  );
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [cardholderName, setCardholderName] = useState(user?.name || 'Demo User');

  const deliveryFee = cartTotal > 5000 ? 0 : 200;
  const tax = cartTotal * 0.18; // 18% GST
  const totalAmount = cartTotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!deliveryDate) {
      Alert.alert('Error', 'Please select a delivery date');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    const orderData = {
      items: cartItems.map(item => ({
        itemId: item.itemId || item.id,
        name: item.name,
        rentType: item.rentalType,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        rentalDuration: item.rentalDuration,
      })),
      subtotal: cartTotal,
      deliveryFee,
      tax,
      total: totalAmount,
      paymentMethod,
      deliveryAddress,
      deliveryDate,
    };

    // Dispatch order creation
    dispatch(createOrderRequest(orderData));
  };

  const renderCartSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      {cartItems.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        
        return (
          <View key={index} style={styles.summaryItem}>
            <Text style={styles.summaryItemName} numberOfLines={1}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.summaryItemPrice}>₹{itemTotal}</Text>
          </View>
        );
      })}
      
      <View style={styles.divider} />
      
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
  );

  const renderDeliveryInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Information</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Delivery Address</Text>
        <TextInput
          style={styles.textInput}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Delivery Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            // In a real app, show a date picker
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDeliveryDate(tomorrow.toISOString().split('T')[0]);
          }}
        >
          <Text style={deliveryDate ? styles.dateText : styles.placeholderText}>
            {deliveryDate || 'Select delivery date'}
          </Text>
          <Icon name="calendar-today" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Contact Information</Text>
        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>Name: {user?.name || 'Demo User'}</Text>
          <Text style={styles.contactText}>Email: {user?.email || 'demo@rentify.com'}</Text>
          <Text style={styles.contactText}>Phone: {user?.phone || '+91 98765 43210'}</Text>
        </View>
      </View>
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'card' && styles.selectedPaymentOption
        ]}
        onPress={() => setPaymentMethod('card')}
      >
        <Icon
          name={paymentMethod === 'card' ? 'radio-button-checked' : 'radio-button-unchecked'}
          size={24}
          color={paymentMethod === 'card' ? '#2563EB' : '#666'}
        />
        <View style={styles.paymentOptionContent}>
          <Text style={styles.paymentOptionTitle}>Credit/Debit Card</Text>
          <Text style={styles.paymentOptionDesc}>Pay with Visa, MasterCard, or Rupay</Text>
        </View>
        <Icon name="credit-card" size={24} color="#666" />
      </TouchableOpacity>
      
      {paymentMethod === 'card' && (
        <View style={styles.cardForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              placeholder="1234 5678 9012 3456"
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.textInput}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.textInput}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                placeholder="123"
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.textInput}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="John Doe"
            />
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'upi' && styles.selectedPaymentOption,
          { marginTop: 16 }
        ]}
        onPress={() => setPaymentMethod('upi')}
      >
        <Icon
          name={paymentMethod === 'upi' ? 'radio-button-checked' : 'radio-button-unchecked'}
          size={24}
          color={paymentMethod === 'upi' ? '#2563EB' : '#666'}
        />
        <View style={styles.paymentOptionContent}>
          <Text style={styles.paymentOptionTitle}>UPI</Text>
          <Text style={styles.paymentOptionDesc}>Pay with Google Pay, PhonePe, Paytm</Text>
        </View>
        <Icon name="payments" size={24} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'cod' && styles.selectedPaymentOption,
          { marginTop: 16 }
        ]}
        onPress={() => setPaymentMethod('cod')}
      >
        <Icon
          name={paymentMethod === 'cod' ? 'radio-button-checked' : 'radio-button-unchecked'}
          size={24}
          color={paymentMethod === 'cod' ? '#2563EB' : '#666'}
        />
        <View style={styles.paymentOptionContent}>
          <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
          <Text style={styles.paymentOptionDesc}>Pay when equipment is delivered</Text>
        </View>
        <Icon name="attach-money" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Checkout" showDrawer={false} />
      
      {creatingOrder ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Processing your order...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderCartSummary()}
          {renderDeliveryInfo()}
          {renderPaymentMethod()}
          
          <View style={styles.termsContainer}>
            <Icon name="info" size={20} color="#2563EB" />
            <Text style={styles.termsText}>
              By placing your order, you agree to our Terms of Service and Rental Agreement.
              Delivery times may vary based on equipment availability.
            </Text>
          </View>
        </ScrollView>
      )}
      
      {!creatingOrder && (
        <View style={styles.footer}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>Total Amount</Text>
            <Text style={styles.footerTotalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            disabled={cartItems.length === 0}
          >
            <Icon name="lock" size={20} color="#fff" />
            <Text style={styles.placeOrderText}>
              {cartItems.length === 0 ? 'Cart is Empty' : 'Place Order Securely'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  contactInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedPaymentOption: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  cardForm: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  termsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#2563EB',
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  placeOrderButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    flex: 1,
    opacity: 1,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CheckoutScreen;