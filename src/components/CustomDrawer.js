import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef,
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 280;

const CustomDrawer = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        closeDrawer();
        logout();
        navigation.navigate('Login');
    };

    const openDrawer = () => {
        setVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };

    const closeDrawer = () => {
        Animated.timing(slideAnim, {
            toValue: -DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    useImperativeHandle(ref, () => ({
        openDrawer,
        closeDrawer,
    }));
    const navigateTo = (screen) => {
        closeDrawer();
        setTimeout(() => {
            if (screen === 'Home') {
                navigation.navigate('MainTabs', { screen: 'HomeTab' });
            } else if (screen === 'Cart') {
                navigation.navigate('MainTabs', { screen: 'CartTab' });
            } else if (screen === 'Orders') {
                navigation.navigate('MainTabs', { screen: 'OrdersTab' });
            } else if (screen === 'Profile') {
                navigation.navigate('MainTabs', { screen: 'ProfileTab' });
            }
        }, 300);
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={closeDrawer} />

                <Animated.View
                    style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Rentify</Text>
                        <Text style={styles.subtitle}>Smart Equipment Rental</Text>
                        {user && (
                            <Text style={styles.userEmail}>Logged in as: {user.email}</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigateTo('Home')}
                    >
                        <Text style={styles.label}>🏠 Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigateTo('Cart')}
                    >
                        <Text style={styles.label}>🛒 Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigateTo('Orders')}
                    >
                        <Text style={styles.label}>📦 Order History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigateTo('Profile')}
                    >
                        <Text style={styles.label}>👤 Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item} onPress={handleLogout}>
                        <Text style={[styles.label, styles.logout]}>🚪 Logout</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
});

export default CustomDrawer;

const styles = StyleSheet.create({
    overlay: { flex: 1 },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
        width: DRAWER_WIDTH,
        backgroundColor: '#fff',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        padding: 20,
        backgroundColor: '#2563EB',
    },
    title: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        color: '#E0E7FF',
        fontSize: 14,
        marginBottom: 10,
    },
    userEmail: {
        color: '#fff',
        fontSize: 12,
        fontStyle: 'italic',
    },
    item: {
        padding: 18,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#374151',
    },
    logout: {
        color: '#EF4444',
    },
});