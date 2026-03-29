import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts, getProductById, getCategories } from '../services/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await getProducts(params);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await getProductById(id);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await getCategories();
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  products: [],
  totalCount: 0,
  selectedProduct: null,
  categories: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload?.products || action.payload || [];
      state.totalCount = action.payload?.totalCount || state.products.length || 0;
    })
    .addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch products';
    });

    // fetchProductById
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
    })
    .addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch product';
    });

    // fetchCategories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload || [];
    })
    .addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch categories';
    });
  },
});

export default productSlice.reducer;
