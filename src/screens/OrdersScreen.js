import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CustomDrawer from '../components/CustomDrawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import {
  fetchOrdersRequest,
  fetchOrderByIdRequest,
  cancelOrderRequest,
} from '../redux/slices/orderSlice';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const drawerRef = useRef();
  const { orders, loading, error } = useSelector(state => state.order);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchOrdersRequest());
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchOrdersRequest());
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['Placed', 'Processing', 'Shipped'].includes(order.status);
    if (filter === 'completed') return ['Delivered', 'Completed'].includes(order.status);
    if (filter === 'cancelled') return ['Cancelled', 'Refunded'].includes(order.status);
    return true;
  });

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

  const handleViewOrderDetails = (orderId) => {
    dispatch(fetchOrderByIdRequest({ orderId }));
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleCancelOrder = (orderId) => {
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
          }
        }
      ]
    );
  };

  const renderOrderItem = ({ item }) => {
    const itemCount = item.items ? item.items.length : 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleViewOrderDetails(item.id)}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item.trackingNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Icon
              name={getStatusIcon(item.status)}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>{itemCount} equipment{itemCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{item.total ? item.total.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text style={styles.detailValue}>
              {item.paymentMethod === 'card' ? 'Credit Card' :
                item.paymentMethod === 'upi' ? 'UPI' :
                  item.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleViewOrderDetails(item.id)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={20} color="#2563EB" />
          </TouchableOpacity>

          {item.status === 'Placed' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(item.id)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header
          title="Order History"
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

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          title="Order History"
          showDrawer={true}
          drawerRef={drawerRef}
        />
        <CustomDrawer ref={drawerRef} />
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchOrdersRequest())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Order History"
        showDrawer={true}
        drawerRef={drawerRef}
      />

      <CustomDrawer ref={drawerRef} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterTab,
                filter === filterItem.id && styles.activeFilterTab
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Text style={[
                styles.filterText,
                filter === filterItem.id && styles.activeFilterText
              ]}>
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-long" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? "You haven't placed any orders yet."
              : `No ${filter} orders found.`}
          </Text>
          {filter === 'all' && (
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.shopButtonText}>Browse Equipment</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text style={styles.orderCount}>
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </Text>
          }
        />
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
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeFilterTab: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
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
  orderCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginRight: 4,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  cancelText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default OrdersScreen;