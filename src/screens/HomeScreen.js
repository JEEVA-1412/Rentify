
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomDrawer from '../components/CustomDrawer';
import Header from '../components/Header';
import EquipmentCard from '../components/EquipmentCard';
import {
  fetchEquipmentByCategoryRequest,
  clearSelectedEquipment,
} from '../redux/slices/equipmentSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // 16 padding left + 16 padding right + 8 margin between = 40

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const drawerRef = useRef();

  const {
    equipmentByCategory,
    categories,
    subCategories,
    loading
  } = useSelector(state => state.equipment);

  const { itemCount } = useSelector(state => state.cart);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Camera');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  // Fetch data on component mount
  useEffect(() => {
    // Load initial category data
    if (categories && categories.length > 0) {
      const firstCategory = categories[0].id;
      setSelectedCategory(firstCategory);
      dispatch(fetchEquipmentByCategoryRequest({ category: firstCategory }));
    }
  }, [dispatch, categories]);

  // Refresh function
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchEquipmentByCategoryRequest({ category: selectedCategory }));
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [dispatch, selectedCategory]);

  // Handle category selection
  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('All');
    dispatch(fetchEquipmentByCategoryRequest({ category: categoryId }));
  };

  // Handle sub-category selection
  const handleSubCategoryPress = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  // Handle equipment item press
  const handleEquipmentPress = (equipment) => {
    dispatch(clearSelectedEquipment());
    navigation.navigate('EquipmentDetail', { equipmentId: equipment.id });
  };

  // Get filtered equipment based on selected category and sub-category
  const getFilteredEquipment = () => {
    const equipment = equipmentByCategory[selectedCategory] || [];
    if (selectedSubCategory === 'All') return equipment;
    
    return equipment.filter(item => {
      const itemSubCategory = item.subCategory || item.payload?.subCategory;
      return itemSubCategory === selectedSubCategory;
    });
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <View style={[
        styles.categoryIcon,
        selectedCategory === item.id && styles.selectedCategoryIcon
      ]}>
        <Icon
          name={item.icon}
          size={24}
          color={selectedCategory === item.id ? '#fff' : '#2563EB'}
        />
      </View>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.selectedCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render sub-category item
  const renderSubCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subCategoryChip,
        selectedSubCategory === item && styles.selectedSubCategoryChip
      ]}
      onPress={() => handleSubCategoryPress(item)}
    >
      <Text style={[
        styles.subCategoryText,
        selectedSubCategory === item && styles.selectedSubCategoryText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Render equipment item
  const renderEquipmentItem = ({ item }) => (
    <View style={[styles.equipmentCardContainer, { width: CARD_WIDTH }]}>
      <EquipmentCard
        equipment={item}
        onPress={() => handleEquipmentPress(item)}
      />
    </View>
  );

  const filteredEquipment = getFilteredEquipment();

  return (
    <View style={styles.container}>
      <Header
        title="Rentify"
        showDrawer={true}
        drawerRef={drawerRef}
      />

      <CustomDrawer ref={drawerRef} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          {categories && categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          ) : (
            <ActivityIndicator size="small" color="#2563EB" />
          )}
        </View>

        {/* Sub Categories */}
        {selectedCategory && subCategories[selectedCategory] && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter by Type</Text>
            <FlatList
              data={['All', ...subCategories[selectedCategory]]}
              renderItem={renderSubCategoryItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subCategoriesList}
            />
          </View>
        )}

        {/* Equipment List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory} {selectedSubCategory !== 'All' ? `- ${selectedSubCategory}` : ''}
            </Text>
            {filteredEquipment.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('EquipmentList', {
                category: selectedCategory,
                subCategory: selectedSubCategory
              })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : filteredEquipment.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredEquipment.slice(0, 4).map((item, index) => (
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
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Rentify</Text>
          <View style={styles.statsContainer}>
            {[
              { icon: 'inventory', label: 'Premium', sublabel: 'Equipment' },
              { icon: 'verified', label: 'Quality', sublabel: 'Assured' },
              { icon: 'local-shipping', label: 'Free', sublabel: 'Delivery' },
              { icon: 'support-agent', label: '24/7', sublabel: 'Support' },
            ].map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Icon name={stat.icon} size={24} color="#2563EB" />
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statSubLabel}>{stat.sublabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            {[
              { icon: 'search', title: 'Browse', desc: 'Find perfect equipment' },
              { icon: 'add-shopping-cart', title: 'Add to Cart', desc: 'Select rental duration' },
              { icon: 'payment', title: 'Checkout', desc: 'Secure payment' },
              { icon: 'local-shipping', title: 'Delivery', desc: 'Get equipment delivered' },
            ].map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Icon name={step.icon} size={24} color="#2563EB" />
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Cart Floating Button */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartTab')}
        >
          <Icon name="shopping-cart" size={24} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
        </TouchableOpacity>
      )}
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  categoriesList: {
    paddingVertical: 4,
  },
  categoryCard: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    width: 100,
  },
  selectedCategoryCard: {
    backgroundColor: '#2563EB',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCategoryIcon: {
    backgroundColor: '#fff',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#fff',
    fontWeight: '600',
  },
  subCategoriesList: {
    paddingVertical: 4,
  },
  subCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  selectedSubCategoryChip: {
    backgroundColor: '#2563EB',
  },
  subCategoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedSubCategoryText: {
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  equipmentCardContainer: {
    width: '100%',
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    padding: 8,
    width: '48%',
    marginBottom: 12,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  step: {
    alignItems: 'center',
    padding: 8,
    width: '48%',
    marginBottom: 16,
  },
  stepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#2563EB',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563EB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
