import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function useCartCotext() {
  const cartContext = useContext(CartContext);
  return cartContext;
}
