import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
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
  fetchEquipmentByIdRequest,
  clearSelectedEquipment,
} from '../redux/slices/equipmentSlice';
import { addToCartRequest } from '../redux/slices/cartSlice';

const EquipmentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { equipmentId } = route.params;

  const { selectedEquipment, loading } = useSelector(state => state.equipment);
  const [selectedRentalType, setSelectedRentalType] = useState('Hour');
  const [quantity, setQuantity] = useState(1);
  const [rentalDuration, setRentalDuration] = useState(1);

  useEffect(() => {
    dispatch(fetchEquipmentByIdRequest({ id: equipmentId }));

    return () => {
      dispatch(clearSelectedEquipment());
    };
  }, [dispatch, equipmentId]);

  // Helper function to get equipment data from API response
  const getEquipmentData = () => {
    if (!selectedEquipment) return null;

    // Check if data is in payload or direct properties
    if (selectedEquipment.payload) {
      return {
        id: selectedEquipment.id,
        name: selectedEquipment.payload.name || 'Unknown Equipment',
        category: selectedEquipment.payload.category || '',
        subCategory: selectedEquipment.payload.subCategory || '',
        image: selectedEquipment.payload.image || 'https://via.placeholder.com/300',
        rentPerHour: selectedEquipment.payload.rentPerHour || selectedEquipment.payload.rentPerHour || 0,
        rentPerDay: selectedEquipment.payload.rentPerDay || selectedEquipment.payload.rentPerDay || 0,
        rating: selectedEquipment.payload.rating || 4.5,
        available: selectedEquipment.payload.available !== false,
      };
    }

    // Direct properties
    return {
      id: selectedEquipment.id,
      name: selectedEquipment.name || 'Unknown Equipment',
      category: selectedEquipment.category || '',
      subCategory: selectedEquipment.subCategory || '',
      image: selectedEquipment.image || 'https://via.placeholder.com/300',
      rentPerHour: selectedEquipment.rentPerHour || selectedEquipment.rentPerHour || 0,
      rentPerDay: selectedEquipment.rentPerDay || selectedEquipment.rentPerDay || 0,
      rating: selectedEquipment.rating || 4.5,
      available: selectedEquipment.available !== false,
    };
  };

  const handleAddToCart = () => {
    const equipmentData = getEquipmentData();
    if (!equipmentData) return;

    const cartItem = {
      id: equipmentData.id,
      name: equipmentData.name,
      category: equipmentData.category,
      subCategory: equipmentData.subCategory,
      image: equipmentData.image,
      rentalType: selectedRentalType,
      quantity,
      rentalDuration,
      hourlyRate: equipmentData.rentPerHour,
      dailyRate: equipmentData.rentPerDay,
      price: selectedRentalType === 'Hour'
        ? equipmentData.rentPerHour * rentalDuration
        : equipmentData.rentPerDay * rentalDuration,
      addedAt: new Date().toISOString(),
    };

    dispatch(addToCartRequest(cartItem));

    Alert.alert(
      'Added to Cart',
      `${equipmentData.name} has been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') }
      ]
    );
  };

  const handleRentNow = () => {
    handleAddToCart();
    navigation.navigate('Checkout', { directCheckout: true });
  };

  const calculateTotal = () => {
    const equipmentData = getEquipmentData();
    if (!equipmentData) return 0;
    const rate = selectedRentalType === 'Hour' ? equipmentData.rentPerHour : equipmentData.rentPerDay;
    return rate * quantity * rentalDuration;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Equipment Details" showDrawer={false} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  const equipmentData = getEquipmentData();

  if (!equipmentData) {
    return (
      <View style={styles.container}>
        <Header title="Equipment Not Found" showDrawer={false} />
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#EF4444" />
          <Text style={styles.errorText}>Equipment not found</Text>
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

  return (
    <View style={styles.container}>
      <Header title="Equipment Details" showDrawer={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: equipmentData.image }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.name}>{equipmentData.name}</Text>

          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{equipmentData.category}</Text>
            </View>
            <View style={styles.subCategoryBadge}>
              <Text style={styles.subCategoryText}>{equipmentData.subCategory}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{equipmentData.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.availability}>
              <Icon
                name="circle"
                size={12}
                color={equipmentData.available ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.availabilityText}>
                {equipmentData.available ? 'Available' : 'Not Available'}
              </Text>
            </View>
          </View>

          {/* Rental Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Type</Text>
            <View style={styles.rentalTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  selectedRentalType === 'Hour' && styles.selectedRentalType
                ]}
                onPress={() => {
                  setSelectedRentalType('Hour');
                  setRentalDuration(1);
                }}
              >
                <Icon name="schedule" size={20} color={selectedRentalType === 'Hour' ? '#2563EB' : '#666'} />
                <Text style={[
                  styles.rentalTypeText,
                  selectedRentalType === 'Hour' && styles.selectedRentalTypeText
                ]}>
                  Hourly
                </Text>
                <Text style={styles.rentalRate}>
                  ₹{equipmentData.rentPerHour}/hour
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  selectedRentalType === 'Day' && styles.selectedRentalType
                ]}
                onPress={() => {
                  setSelectedRentalType('Day');
                  setRentalDuration(1);
                }}
              >
                <Icon name="calendar-today" size={20} color={selectedRentalType === 'Day' ? '#2563EB' : '#666'} />
                <Text style={[
                  styles.rentalTypeText,
                  selectedRentalType === 'Day' && styles.selectedRentalTypeText
                ]}>
                  Daily
                </Text>
                <Text style={styles.rentalRate}>
                  ₹{equipmentData.rentPerDay}/day
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Duration & Quantity Selection */}
          <View style={styles.selectionContainer}>
            <View style={styles.selection}>
              <Text style={styles.selectionLabel}>
                {selectedRentalType === 'Hour' ? 'Hours' : 'Days'}
              </Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setRentalDuration(Math.max(1, rentalDuration - 1))}
                  disabled={!equipmentData.available}
                >
                  <Icon name="remove" size={20} color={equipmentData.available ? '#666' : '#D1D5DB'} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{rentalDuration}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setRentalDuration(rentalDuration + 1)}
                  disabled={!equipmentData.available}
                >
                  <Icon name="add" size={20} color={equipmentData.available ? '#666' : '#D1D5DB'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.selection}>
              <Text style={styles.selectionLabel}>Quantity</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!equipmentData.available}
                >
                  <Icon name="remove" size={20} color={equipmentData.available ? '#666' : '#D1D5DB'} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setQuantity(quantity + 1)}
                  disabled={!equipmentData.available}
                >
                  <Icon name="add" size={20} color={equipmentData.available ? '#666' : '#D1D5DB'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Equipment Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="category" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{equipmentData.category}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="details" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{equipmentData.subCategory}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="star" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Rating</Text>
                <Text style={styles.infoValue}>{equipmentData.rating.toFixed(1)}/5.0</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[
                  styles.infoValue,
                  { color: equipmentData.available ? '#10B981' : '#EF4444' }
                ]}>
                  {equipmentData.available ? 'Available for Rent' : 'Currently Booked'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{calculateTotal()}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !equipmentData.available && styles.disabledAddToCartButton
            ]}
            onPress={handleAddToCart}
            disabled={!equipmentData.available}
          >
            <Icon
              name="add-shopping-cart"
              size={18}
              color={equipmentData.available ? '#2563EB' : '#9CA3AF'}
            />
            <Text style={[
              styles.addToCartText,
              !equipmentData.available && styles.disabledAddToCartText
            ]}>
              Add to Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rentNowButton,
              !equipmentData.available && styles.disabledButton
            ]}
            onPress={handleRentNow}
            disabled={!equipmentData.available}
          >
            <Text style={styles.rentNowText}>
              {equipmentData.available ? 'Rent Now' : 'Not Available'}
            </Text>
          </TouchableOpacity>
        </View>
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
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  subCategoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subCategoryText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rentalTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rentalTypeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRentalType: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  rentalTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedRentalTypeText: {
    color: '#2563EB',
  },
  rentalRate: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  selection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 2, // Takes 2/5 of the width
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  buttonContainer: {
    flex: 3, // Takes 3/5 of the width
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    flex: 1, // Takes half of buttonContainer space
  },
  disabledAddToCartButton: {
    backgroundColor: '#F3F4F6',
  },
  addToCartText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  rentNowButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 2, // Takes double the space of addToCartButton
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  rentNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EquipmentDetailScreen;