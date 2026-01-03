import { Box, Button, Typography, Badge, Chip } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export const ProductCard = ({
  product,
  onAddToCart,
  onProductClick,
}: ProductCardProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "400px",
        minHeight: "400px",
        maxHeight: "400px",
        border: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxSizing: "border-box",
        cursor: onProductClick ? "pointer" : "default",
        "&:hover": onProductClick ? {
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        } : {},
      }}
      onClick={() => onProductClick && onProductClick(product)}
    >
      {/* Image Container - Fixed 200px */}
      <Box
        sx={{
          width: "100%",
          height: "200px",
          minHeight: "200px",
          maxHeight: "200px",
          overflow: "hidden",
          bgcolor: "#f5f5f5",
          flexShrink: 0,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/products/placeholder.jpg";
          }}
        />
        {/* Out of Stock Badge - Top Right */}
        {(product.stock === undefined || product.stock === 0) && (
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
            }}
          />
        )}
      </Box>

      {/* Content - Fixed 120px */}
      <Box
        sx={{
          width: "100%",
          height: "120px",
          minHeight: "120px",
          maxHeight: "120px",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexShrink: 0,
          boxSizing: "border-box",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 600,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              maxHeight: "2.8em",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 0.5,
              color: "text.secondary",
            }}
          >
            Stock: {product.stock !== undefined ? product.stock : 0}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "primary.main",
            textAlign: "center",
            lineHeight: 1.2,
            flexShrink: 0,
          }}
        >
          GH₵{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Box>

      {/* Actions - Fixed 80px */}
      <Box
        sx={{
          width: "100%",
          height: "80px",
          minHeight: "80px",
          maxHeight: "80px",
          p: 1,
          display: "flex",
          gap: 0.5,
          flexShrink: 0,
          boxSizing: "border-box",
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === undefined || product.stock === 0}
          sx={{
            fontSize: "0.7rem",
            flex: "1 1 100%",
          }}
        >
          Add to cart
        </Button>
      </Box>
    </Box>
  );
};

