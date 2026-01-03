import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Grid,
} from "@mui/material";
import { categories } from "../data/products";
import type { CategoryId, Product } from "../data/products";
import { BannerSlider } from "../components/BannerSlider";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { AuthDialog } from "../components/AuthDialog";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface CategorySectionProps {
  category: { id: CategoryId; label: string };
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  isSoftware?: boolean;
}

const ProductImageWithName = ({ product }: { product: Product }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.8,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: { xs: "100px", md: "120px" },
          minHeight: { xs: "100px", md: "120px" },
          maxHeight: { xs: "100px", md: "120px" },
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          border: "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/products/placeholder.jpg";
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: { xs: 0.5, md: 1 },
          textAlign: "center",
          fontWeight: 500,
          fontSize: { xs: "0.75rem", md: "0.85rem" },
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          width: "100%",
        }}
      >
        {product.name}
      </Typography>
    </Box>
  );
};

const CategorySection = ({
  category,
  products,
  onAddToCart: _onAddToCart,
  onProductClick,
  isSoftware = false,
}: CategorySectionProps) => {
  const displayProducts = products.slice(0, isSoftware ? 6 : 4);

  if (isSoftware) {
    return (
      <Box sx={{ width: { xs: "100%", md: "90%" }, mx: "auto", mb: { xs: 2, md: 4 } }}>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            border: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mb: 2, height: { xs: "auto", md: "40px" }, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
          >
            {category.label}
          </Typography>
          {displayProducts.length > 0 ? (
            <Grid container spacing={2}>
              {displayProducts.map((product) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={product.id}>
                  <Box
                    onClick={() => onProductClick && onProductClick(product)}
                    sx={{ cursor: onProductClick ? 'pointer' : 'default' }}
                  >
                    <ProductImageWithName product={product} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              No products in this category yet
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              height: { xs: "auto", md: "40px" },
            }}
          >
            <Button
              component={Link}
              to={`/category/${category.id}`}
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 0, height: "100%", width: { xs: "100%", md: "auto" } }}
            >
              Discover More
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        width: "100%",
        height: { xs: "auto", md: "500px" },
        minHeight: { xs: "400px", md: "500px" },
        p: { xs: 1.5, md: 2 },
        border: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight={700} 
        sx={{ 
          mb: 2, 
          height: { xs: "auto", md: "32px" },
          fontSize: { xs: "1rem", md: "1.25rem" }
        }}
      >
        {category.label}
      </Typography>
      <Grid container spacing={1.5} sx={{ flex: 1, overflow: "hidden" }}>
        {displayProducts.map((product) => (
          <Grid size={{ xs: 6 }} key={product.id} sx={{ height: { xs: "auto", md: "50%" } }}>
            <ProductImageWithName product={product} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2, height: { xs: "auto", md: "40px" } }}>
        <Button
          component={Link}
          to={`/category/${category.id}`}
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          fullWidth
          sx={{ borderRadius: 0, height: "100%" }}
        >
          Discover More
        </Button>
      </Box>
    </Paper>
  );
};

export const StoreHome = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const { user } = useFirebaseAuth();
  const { addToCart } = useCart();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const categoryProducts = useMemo(() => {
    const result: Record<CategoryId, Product[]> = {
      laptops: [],
      desktops: [],
      "all-in-one": [],
      others: [],
      softwares: [],
    };

    products.forEach((product) => {
      if (result[product.category]) {
        result[product.category].push(product);
      }
    });

    return result;
  }, [products]);

  const regularCategories = categories.filter((c) => c.id !== "softwares");
  const softwareCategory = categories.find((c) => c.id === "softwares");

  return (
    <Box>
      <BannerSlider />

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        {productsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {productsError}
          </Alert>
        )}

        {productsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <Typography>Loading products...</Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Regular Category Sections - 4 in a row on desktop, 2 in a row on tablet, 1 on mobile */}
            <Grid container spacing={2}>
              {regularCategories.map((category) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.id}>
                  <CategorySection
                    category={category}
                    products={categoryProducts[category.id]}
                    onProductClick={(product) => {
                      setSelectedProduct(product);
                      setProductModalOpen(true);
                    }}
                    onAddToCart={(product) => {
                      if (!user) {
                        setAuthDialogOpen(true);
                        return;
                      }
                      addToCart(product);
                      setShowCartSuccess(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Software Category - Landscape, 90% width */}
            {softwareCategory && (
              <CategorySection
                category={softwareCategory}
                products={categoryProducts.softwares}
                onProductClick={(product) => {
                  setSelectedProduct(product);
                  setProductModalOpen(true);
                }}
                onAddToCart={(product) => {
                  if (!user) {
                    setAuthDialogOpen(true);
                    return;
                  }
                  addToCart(product);
                  setShowCartSuccess(true);
                }}
                isSoftware
              />
            )}
          </Stack>
        )}
      </Container>

      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode="signup"
      />

      <Snackbar
        open={showCartSuccess}
        autoHideDuration={3000}
        onClose={() => setShowCartSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowCartSuccess(false)}>
          Item added to cart!
        </Alert>
      </Snackbar>

      <ProductDetailModal
        open={productModalOpen}
        product={selectedProduct}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(product, quantity) => {
          if (!user) {
            setAuthDialogOpen(true);
            setProductModalOpen(false);
            return;
          }
          addToCart(product, quantity);
          setShowCartSuccess(true);
        }}
      />
    </Box>
  );
};
