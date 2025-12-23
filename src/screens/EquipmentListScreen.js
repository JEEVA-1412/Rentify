import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import EquipmentCard from '../components/EquipmentCard';
import {
  fetchEquipmentByCategoryRequest,
  clearSelectedEquipment,
} from '../redux/slices/equipmentSlice';

const { width } = Dimensions.get('window');

const EquipmentListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { category, subCategory } = route.params || {};
  const { equipmentByCategory, loading } = useSelector(state => state.equipment);
  
  const [selectedSubCategory, setSelectedSubCategory] = useState(subCategory || 'All');

  useEffect(() => {
    if (category) {
      dispatch(fetchEquipmentByCategoryRequest({ category }));
    }
  }, [dispatch, category]);

  const handleEquipmentPress = (equipment) => {
    dispatch(clearSelectedEquipment());
    navigation.navigate('EquipmentDetail', { equipmentId: equipment.id });
  };

  const getFilteredEquipment = () => {
    const equipment = equipmentByCategory[category] || [];
    if (selectedSubCategory === 'All') return equipment;
    
    return equipment.filter(item => {
      const itemSubCategory = item.subCategory || item.payload?.subCategory;
      return itemSubCategory === selectedSubCategory;
    });
  };

  // Render equipment item for grid layout
  const renderEquipmentItem = ({ item, index }) => (
    <View style={[
      styles.gridItem,
      index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight
    ]}>
      <EquipmentCard
        equipment={item}
        onPress={() => handleEquipmentPress(item)}
      />
    </View>
  );

  const subCategories = {
    Camera: ['All', 'DSLR', 'Mirrorless', 'Lens'],
    Drone: ['All', 'Mini Drone', 'Camera Drone', 'Professional Drone', 'Compact Drone', 'FPV Drone'],
    Gaming: ['All', 'Console'],
  };

  const renderSubCategoryChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subCategoryChip,
        selectedSubCategory === item && styles.selectedSubCategoryChip
      ]}
      onPress={() => setSelectedSubCategory(item)}
    >
      <Text style={[
        styles.subCategoryText,
        selectedSubCategory === item && styles.selectedSubCategoryText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={category || 'Equipment'} showDrawer={false} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  const filteredEquipment = getFilteredEquipment();

  return (
    <View style={styles.container}>
      <Header title={category || 'Equipment'} showDrawer={false} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sub Category Filters */}
        {category && subCategories[category] && (
          <View style={styles.filterSection}>
            <FlatList
              data={subCategories[category]}
              renderItem={renderSubCategoryChip}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subCategoriesList}
            />
          </View>
        )}
        
        {/* Equipment Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredEquipment.length} equipment found
          </Text>
        </View>
        
        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredEquipment.map((item, index) => (
              <View 
                key={item.id ? item.id.toString() : index.toString()}
                style={[
                  styles.gridItem,
                  index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight
                ]}
              >
                <EquipmentCard
                  equipment={item}
                  onPress={() => handleEquipmentPress(item)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="photo-camera" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No equipment found</Text>
            <Text style={styles.emptySubText}>
              Try selecting a different category or filter
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subCategoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subCategoryChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSubCategoryChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subCategoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedSubCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  gridItem: {
    width: '48%', // 2 cards per row with 4% space between
    marginBottom: 12,
  },
  gridItemLeft: {
    marginRight: '2%',
  },
  gridItemRight: {
    marginLeft: '2%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default EquipmentListScreen;