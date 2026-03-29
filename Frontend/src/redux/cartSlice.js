import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await getCart();
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addItemToCart = createAsyncThunk('cart/addItemToCart', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const response = await addToCart(productId, quantity);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const response = await updateCartItem(itemId, quantity);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeItem = createAsyncThunk('cart/removeItem', async (itemId, { dispatch, rejectWithValue }) => {
  try {
    await removeCartItem(itemId);
    const cart = await getCart();
    return cart;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  loading: false,
  error: null,
};

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload || 'Failed to process cart';
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  const data = action.payload;
  // Backend returns { items, totalAmount, totalMRP, totalDiscount, itemCount }
  if (data?.items) {
    state.items = data.items;
    state.totalQuantity = data.itemCount || 0;
    state.totalAmount = data.totalAmount || 0;
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchCart
    builder.addCase(fetchCart.pending, handlePending)
           .addCase(fetchCart.fulfilled, handleFulfilled)
           .addCase(fetchCart.rejected, handleRejected);
           
    // addItemToCart
    builder.addCase(addItemToCart.pending, handlePending)
           .addCase(addItemToCart.fulfilled, handleFulfilled)
           .addCase(addItemToCart.rejected, handleRejected);
           
    // updateItem
    builder.addCase(updateItem.pending, handlePending)
           .addCase(updateItem.fulfilled, handleFulfilled)
           .addCase(updateItem.rejected, handleRejected);
           
    // removeItem
    builder.addCase(removeItem.pending, handlePending)
           .addCase(removeItem.fulfilled, handleFulfilled)
           .addCase(removeItem.rejected, handleRejected);
  },
});

export const selectCartCount = (state) => state.cart.totalQuantity;

export default cartSlice.reducer;
