
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EquipmentCard = ({ equipment, onPress }) => {
  // Use the correct property names from your API
  const name = equipment.name || equipment.payload?.name || 'Equipment';
  const category = equipment.category || equipment.payload?.category || '';
  const subCategory = equipment.subCategory || equipment.payload?.subCategory || '';
  const image = equipment.image || equipment.payload?.image || 'https://via.placeholder.com/300';
  const rentPerHour = equipment.rentPerHour || equipment.payload?.rentPerHour || equipment.payload?.rentPerHour || 0;
  const rentPerDay = equipment.rentPerDay || equipment.payload?.rentPerDay || equipment.payload?.rentPerDay || 0;
  const rating = equipment.rating || equipment.payload?.rating || 4.5;
  const available = equipment.available || equipment.payload?.available || true;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{category}</Text>
          {subCategory && (
            <Text style={styles.subCategory}>{subCategory}</Text>
          )}
        </View>
        
        {/* Updated Price Container - Vertical Layout */}
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Icon name="schedule" size={14} color="#666" />
            <Text style={styles.priceText}>₹{rentPerHour}/hour</Text>
          </View>
          <View style={styles.priceRow}>
            <Icon name="calendar-today" size={14} color="#666" />
            <Text style={styles.priceText}>₹{rentPerDay}/day</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
          <View style={styles.availability}>
            <Icon 
              name="circle" 
              size={10} 
              color={available ? '#10B981' : '#EF4444'} 
            />
            <Text style={styles.availabilityText}>
              {available ? 'Available' : 'Booked'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 4,
    marginVertical: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  category: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  subCategory: {
    fontSize: 10,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  // Updated Price Container styles
  priceContainer: {
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#666',
  },
});

export default EquipmentCard;
