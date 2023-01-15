import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X } from "phosphor-react";
import { useCartCotext } from "../../hooks/useDrawerContext";
import { CartButton } from "../CartButton";
import {
  CartClose,
  CartContent,
  CartFinalization,
  CartProduct,
  CartProductDetails,
  CartProductImage,
  FinalizationDetails,
} from "./styles";
import axios from "axios";

export function Cart() {
  const { cartItems, handleRemoveProduct } = useCartCotext();
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false);

  const totalItems = cartItems.length;
  const totalCost = cartItems.reduce((acc, item) => {
    return acc + item.price;
  }, 0);
  const totalCostFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalCost);

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);

      const line_items = cartItems.map((item) => {
        return {
          price: item.defaultPriceId,
          quantity: 1,
        };
      });

      const response = await axios.post("/api/checkout", {
        line_items,
      });

      const { checkoutUrl } = response.data;
      window.location.href = checkoutUrl;
    } catch (err) {
      setIsCreatingCheckoutSession(false);
      alert("Falha ao redirecionar ao checkout!");
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <CartButton />
      </Dialog.Trigger>
      <Dialog.Portal>
        <CartContent>
          <CartClose>
            <X size={24} weight="bold" />
          </CartClose>

          <h2>Sacola de Compras</h2>
          {totalItems <= 0 && <p>Seu carrinho está vazio</p>}
          <section>
            {cartItems.map((item) => {
              return (
                <section key={item.id}>
                  {/* <p>Parece que seu carrinho está vazio :(</p> */}
                  <CartProduct>
                    <CartProductImage>
                      <Image
                        width={100}
                        height={93}
                        alt=""
                        src={item.imageUrl}
                      />
                    </CartProductImage>
                    <CartProductDetails>
                      <p>{item.name}</p>
                      <strong>{item.priceFormatted}</strong>
                      <button onClick={() => handleRemoveProduct(item.id)}>
                        Remover
                      </button>
                    </CartProductDetails>
                  </CartProduct>
                </section>
              );
            })}
          </section>

          <CartFinalization>
            <FinalizationDetails>
              <div>
                <span>Quantidade</span>
                <p>{totalItems} itens</p>
              </div>
              <div>
                <span>Valor Total</span>
                <p>{totalCostFormatted}</p>
              </div>
            </FinalizationDetails>
            <button
              disabled={isCreatingCheckoutSession}
              onClick={handleBuyProduct}
            >
              Finalizar Compra
            </button>
          </CartFinalization>
        </CartContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
