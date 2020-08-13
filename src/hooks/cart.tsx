import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productList = await AsyncStorage.getItem('@GoMarket:products');

      if (productList) {
        setProducts(JSON.parse(productList));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const checkProduct = products.find(value => value.id === product.id);

      if (checkProduct) {
        const increasedProducts = products.map(value => {
          if (value.id === checkProduct.id) {
            value.quantity += 1;
            return value;
          }
          return value;
        });

        await AsyncStorage.setItem(
          'GoMarket:products',
          JSON.stringify(increasedProducts),
        );

        setProducts(increasedProducts);
        return;
      }

      await AsyncStorage.setItem(
        'GoMarket:products',
        JSON.stringify([...products, { ...product, quantity: 1 }]),
      );
      setProducts(state => [...state, { ...product, quantity: 1 }]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const increasedProducts = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
          return product;
        }
        return product;
      });

      await AsyncStorage.setItem(
        'GoMarket:products',
        JSON.stringify(increasedProducts),
      );

      setProducts(increasedProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decreasedProducts = products.map(product => {
        if (product.id === id && product.quantity > 1) {
          product.quantity -= 1;
          return product;
        }
        return product;
      });

      await AsyncStorage.setItem(
        'GoMarket:products',
        JSON.stringify(decreasedProducts),
      );

      setProducts(decreasedProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
