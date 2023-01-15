import { createContext, ReactNode, useState } from "react";

interface CartContextData {
  cartItems: Product[];
  handleAddNewProduct: (product: Product) => void;
  handleRemoveProduct: (productId: string) => void;
}

export const CartContext = createContext({} as CartContextData);

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  priceFormatted: string;
  description: string;
  defaultPriceId: string;
}

interface CartContextProviderProps {
  children: ReactNode;
}

export function CartContextProvider({ children }: CartContextProviderProps) {
  const [cartItems, setCartItems] = useState<Product[]>([]);

  function handleAddNewProduct(product: Product) {
    const productAlreadyExistsInCart = cartItems.find(
      (item) => item.id === product.id
    );
    if (productAlreadyExistsInCart) {
      return;
    }
    setCartItems((prevState) => [...prevState, product]);
  }

  function handleRemoveProduct(productId: string) {
    setCartItems((prevState) =>
      prevState.filter((item) => item.id !== productId)
    );
  }

  return (
    <CartContext.Provider
      value={{ cartItems, handleAddNewProduct, handleRemoveProduct }}
    >
      {children}
    </CartContext.Provider>
  );
}
