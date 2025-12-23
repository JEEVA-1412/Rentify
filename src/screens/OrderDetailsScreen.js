import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { 
  fetchOrderByIdRequest, 
  cancelOrderRequest,
  clearCurrentOrder 
} from '../redux/slices/orderSlice';

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { orderId } = route.params;
  
  const { currentOrder, loading, error } = useSelector(state => state.order);

  useEffect(() => {
    dispatch(fetchOrderByIdRequest({ orderId }));
    
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            dispatch(cancelOrderRequest({ orderId }));
            Alert.alert(
              'Order Cancelled',
              'Your order has been cancelled successfully.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed': return '#2563EB';
      case 'Processing': return '#F59E0B';
      case 'Shipped': return '#8B5CF6';
      case 'Delivered': return '#10B981';
      case 'Completed': return '#10B981';
      case 'Cancelled': return '#EF4444';
      case 'Refunded': return '#EF4444';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Placed': return 'check-circle';
      case 'Processing': return 'pending';
      case 'Shipped': return 'local-shipping';
      case 'Delivered': return 'done-all';
      case 'Completed': return 'done-all';
      case 'Cancelled': return 'cancel';
      case 'Refunded': return 'money-off';
      default: return 'help';
    }
  };

  const getNextStep = (status) => {
    switch (status) {
      case 'Placed': return 'Processing';
      case 'Processing': return 'Shipping';
      case 'Shipped': return 'Delivery';
      case 'Delivered': return 'Completed';
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Order Details" showDrawer={false} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (error || !currentOrder) {
    return (
      <View style={styles.container}>
        <Header title="Order Not Found" showDrawer={false} />
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#EF4444" />
          <Text style={styles.errorText}>
            {error || 'Order not found'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Extract order data - check for payload structure
  const order = currentOrder.payload ? {
    ...currentOrder,
    status: currentOrder.payload.orderStatus,
    subtotal: currentOrder.payload.subtotal,
    deliveryFee: currentOrder.payload.deliveryFee,
    tax: currentOrder.payload.tax,
    total: currentOrder.payload.totalAmount,
    paymentMethod: currentOrder.payload.paymentMethod,
    deliveryAddress: currentOrder.payload.deliveryAddress,
    deliveryDate: currentOrder.payload.deliveryDate,
    items: currentOrder.payload.items || [],
  } : currentOrder;

  return (
    <View style={styles.container}>
      <Header title="Order Details" showDrawer={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{order.trackingNumber || `TRK${order.id}`}</Text>
            <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Icon
              name={getStatusIcon(order.status)}
              size={20}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* Order Progress */}
        {!['Cancelled', 'Refunded', 'Delivered', 'Completed'].includes(order.status) && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            <View style={styles.progressSteps}>
              {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                const stepOrder = ['Placed', 'Processing', 'Shipped', 'Delivered'];
                const isCompleted = stepOrder.indexOf(order.status) >= index;
                const isCurrent = order.status === step;
                
                return (
                  <View key={step} style={styles.stepContainer}>
                    <View style={styles.stepLine}>
                      {index > 0 && (
                        <View style={[
                          styles.line,
                          isCompleted ? styles.lineCompleted : styles.linePending
                        ]} />
                      )}
                    </View>
                    <View style={[
                      styles.stepCircle,
                      isCompleted ? styles.stepCompleted : styles.stepPending,
                      isCurrent && styles.stepCurrent,
                    ]}>
                      <Icon
                        name={getStatusIcon(step)}
                        size={16}
                        color={isCompleted ? '#fff' : '#666'}
                      />
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      isCompleted ? styles.stepLabelCompleted : styles.stepLabelPending
                    ]}>
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
            {getNextStep(order.status) && (
              <Text style={styles.nextStep}>
                Next: {getNextStep(order.status)}
              </Text>
            )}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const rate = item.rentalType === 'Hour' || item.rentType === 'Hour' ? 
                (item.hourlyRate || item.rentPerHour || 0) : 
                (item.dailyRate || item.rentPerDay || 0);
              const total = item.price || (rate * (item.quantity || 1) * (item.rentalDuration || 1));
              
              return (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemTotal}>₹{total.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.itemCategory}>{item.category || ''}</Text>
                  <View style={styles.itemDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rental Type:</Text>
                      <Text style={styles.detailValue}>
                        {(item.rentalType || item.rentType) === 'Hour' ? 'Hourly' : 'Daily'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quantity:</Text>
                      <Text style={styles.detailValue}>{item.quantity || 1}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>
                        {item.rentalDuration || 1} {(item.rentalType || item.rentType) === 'Hour' ? 'hours' : 'days'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rate:</Text>
                      <Text style={styles.detailValue}>
                        ₹{rate}/{(item.rentalType || item.rentType) === 'Hour' ? 'hour' : 'day'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noItemsText}>No items in this order</Text>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{order.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 0}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>₹{order.tax?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{order.total?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Address</Text>
                <Text style={styles.infoValue}>{order.deliveryAddress || 'Not specified'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="date-range" size={20} color="#666" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Date</Text>
                <Text style={styles.infoValue}>
                  {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Not scheduled'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="payment" size={20} color="#666" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod === 'upi' ? 'UPI' : 
                   order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   'Online Payment'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {order.status === 'Placed' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.cancelOrderButton}
            onPress={handleCancelOrder}
          >
            <Icon name="cancel" size={20} color="#EF4444" />
            <Text style={styles.cancelOrderText}>Cancel Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.contactSupportButton}
            onPress={() => Alert.alert('Contact Support', 'This would open support chat in a real app.')}
          >
            <Icon name="support-agent" size={20} color="#2563EB" />
            <Text style={styles.contactSupportText}>Contact Support</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderHeader: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepLine: {
    position: 'absolute',
    top: 12,
    left: -50,
    right: -50,
    height: 2,
    justifyContent: 'center',
  },
  line: {
    height: 2,
    flex: 1,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  linePending: {
    backgroundColor: '#E5E7EB',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  stepCompleted: {
    backgroundColor: '#10B981',
  },
  stepCurrent: {
    backgroundColor: '#2563EB',
    transform: [{ scale: 1.2 }],
  },
  stepPending: {
    backgroundColor: '#E5E7EB',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
  stepLabelPending: {
    color: '#666',
  },
  nextStep: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  orderItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
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
    fontWeight: '500',
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
  infoGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelOrderText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  contactSupportText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
});

export default OrderDetailsScreen;