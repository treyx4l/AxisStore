import { Box, Grid } from "@mui/material";
import { ProductCard } from "./ProductCard";
import type { Product } from "../data/products";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export const ProductGrid = ({
  products,
  onAddToCart,
  onProductClick,
}: ProductGridProps) => {
  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid size={{ xs: 6, md: 3 }} key={product.id} sx={{ display: "flex" }}>
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};

