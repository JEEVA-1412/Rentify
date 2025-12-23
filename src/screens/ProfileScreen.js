import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import CustomDrawer from '../components/CustomDrawer';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const drawerRef = useRef();
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'history',
      title: 'Order History',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'favorite-border',
      title: 'Favorites',
      onPress: () => Alert.alert('Favorites', 'Coming soon!'),
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      onPress: () => Alert.alert('Notifications', 'Coming soon!'),
    },
    {
      icon: 'security',
      title: 'Privacy & Security',
      onPress: () => Alert.alert('Privacy', 'Coming soon!'),
    },
    {
      icon: 'help',
      title: 'Help & Support',
      onPress: () => Alert.alert('Support', 'Coming soon!'),
    },
    {
      icon: 'info',
      title: 'About Rentify',
      onPress: () => Alert.alert('About', 'Rentify v1.0.0\nSmart Equipment Rental App'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Pass drawerRef to Header */}
      <Header 
        title="Profile" 
        showDrawer={true} 
        drawerRef={drawerRef}
      />
      
      {/* Add CustomDrawer component */}
      <CustomDrawer ref={drawerRef} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => Alert.alert('Edit Avatar', 'This feature is coming soon!')}
            >
              <Icon name="edit" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Full Name"
              />
            ) : (
              <Text style={styles.profileName}>{user?.name}</Text>
            )}
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Icon
              name={isEditing ? 'save' : 'edit'}
              size={20}
              color="#2563EB"
            />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color="#666" style={styles.infoIcon} />
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Email"
                  keyboardType="email-address"
                />
              ) : (
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#666" style={styles.infoIcon} />
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                />
              ) : (
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user?.phone}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" style={styles.infoIcon} />
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Address"
                  multiline
                />
              ) : (
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{user?.address}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Icon name={item.icon} size={24} color="#2563EB" />
                <Text style={styles.menuText}>{item.title}</Text>
                <Icon name="chevron-right" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="shopping-cart" size={24} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                <Icon name="check-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF2F2' }]}>
                <Icon name="cancel" size={24} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Rentify v1.0.0</Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  editInput: {
    fontSize: 16,
    color: '#333',
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
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
  infoGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoIcon: {
    width: 40,
  },
  infoContent: {
    flex: 1,
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
  menuGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default ProfileScreen;