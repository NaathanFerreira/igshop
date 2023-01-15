import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Stripe from "stripe";
import { useCartCotext } from "../../hooks/useDrawerContext";
import { stripe } from "../../lib/stripe";
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "../../styles/pages/product";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    priceFormatted: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false);

  const { handleAddNewProduct } = useCartCotext();

  // getStaticPaths fallback
  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.priceFormatted}</span>

          <p>{product.description}</p>

          <button
            onClick={() => handleAddNewProduct(product)}
            disabled={isCreatingCheckoutSession}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

// necessário para casos de geração de página estática, no qual possui um parametro dinamico (nesse caso o id)
// no momento da build do projeto, o next não saberá da onde vem o id, por usamos getStaticPaths
// ao rodar a build, o next gera uma página estática com o id passado no paths

// fallback false: ao tentar acessar um produto que o id não foi passado no paths, ele retornará 404 na página
// fallback true: ao tentar acessar um produto que o id não foi passado no paths, ele executa denovo a função getStaticProps para tentar gerar uma página estática desse produto
// porém, ele irá mostrar o html primeiro, e ira rodar o getStaticProps por baixo dos panos, então o produto vai ser null na primeira renderização
// para saber se ele está em loading, usa-se o isLoading do useRouter();
// fallback blocking: não mostrará nada na página é terminar de carregar o getStaticProps, não é necessário usar algum tipo de loading

// casos de uso recomendados
// Para um e-commerce, passar no params os produtos mais vendidos / masi acessados, para ele já gerar uma página estática desses produtos

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: "prod_N4sSrphP4sjlls" } }],
    fallback: true,
  };
};

// GetStaticProps<any, { id: string }> : primeiro parametro (any) é a tipagem do retorno da função, o segundo parametro é a tipagem do params
export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: price.unit_amount / 100,
        priceFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount! / 100),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
