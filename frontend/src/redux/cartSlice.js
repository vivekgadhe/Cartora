import { createSlice } from '@reduxjs/toolkit';

const getStoredCartItems = () => {
  try {
    const storedItems = localStorage.getItem('cartItems');

    if (!storedItems) {
      return [];
    }

    const parsedItems = JSON.parse(storedItems);

    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    localStorage.removeItem('cartItems');
    return [];
  }
};

const initialState = {
  cartItems: getStoredCartItems(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existingItem = state.cartItems.find(
        (x) => x.productId === item.productId
      );

      if (existingItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.productId === item.productId ? item : x
        );
      } else {
        state.cartItems.push(item);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.productId !== action.payload
      );

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;