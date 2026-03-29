import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import { logout } from './authSlice';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { return await getWishlist(); } catch (e) { return rejectWithValue(e.message); }
});

export const addWishlistItem = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try { await addToWishlist(productId); return productId; } catch (e) { return rejectWithValue(e.message); }
});

export const removeWishlistItem = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try { await removeFromWishlist(productId); return productId; } catch (e) { return rejectWithValue(e.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        if (!state.items.find(i => i.productId === action.payload)) {
          state.items.push({ productId: action.payload });
        }
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.productId !== action.payload);
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some(i => i.productId === productId);

export const selectWishlistCount = (state) => state.wishlist.items.length;

export default wishlistSlice.reducer;
