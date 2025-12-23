// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from './src/contexts/AuthContext';
// import { CartProvider } from './src/contexts/CartContext';
// import { OrderProvider } from './src/contexts/OrderContext';
// import AppNavigator from './src/navigation/AppNavigator';

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <AuthProvider>
//         <CartProvider>
//           <OrderProvider>
//             <NavigationContainer>
//               <AppNavigator />
//             </NavigationContainer>
//           </OrderProvider>
//         </CartProvider>
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }



import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </Provider>
  );
}