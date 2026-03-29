import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import productReducer from './productSlice';
import authReducer, { persistAuthState } from './authSlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
  },
});

store.subscribe(() => {
  persistAuthState(store.getState().auth);
});

export default store;
