import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ title, showDrawer = true, drawerRef }) => {
  const handleDrawerOpen = () => {
    if (drawerRef && drawerRef.current) {
      drawerRef.current.openDrawer();
    }
  };

  return (
    <View style={styles.header}>
      {showDrawer ? (
        <TouchableOpacity 
          onPress={handleDrawerOpen} 
          style={styles.menuButton}
        >
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.menuButton} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.menuButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});

export default Header;