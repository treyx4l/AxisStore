import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  categories,
  type Product,
  type CategoryId,
  type ProductCondition,
} from "../data/products";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";
import { useProducts } from "../context/ProductsContext";
import {
  productsService,
  ordersService,
  statsService,
  bannersService,
  storeSettingsService,
  type Order,
  type Banner,
  type StoreSettings,
} from "../services/rtdbService";
import { rtdb } from "../FirebaseConfig";

export const AdminDashboard = () => {
  const { user, logout: firebaseLogout } = useFirebaseAuth();

  // User email logged for admin access
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { products, refreshProducts } = useProducts();
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    imageUrl: "",
    linkUrl: "",
    order: 0,
    active: true,
  });
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "AXIS STORE",
    storeEmail: "admin@axisstore.com",
    taxRate: 0,
    shippingCost: 15,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Load orders and stats
  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        setLoadingOrders(true);
        const [ordersData, statsData] = await Promise.all([
          ordersService.getAll(),
          statsService.get(),
        ]);
        setOrders(ordersData);
        setStats(statsData);

        // Update product count in background (don't block)
        statsService.updateProductCount(products.length).catch(() => {});
      } catch (error) {
        // Error loading admin data - handled silently
      } finally {
        setLoadingOrders(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribeOrders = ordersService.subscribe((ordersData) => {
      setOrders(ordersData);
      setLoadingOrders(false);
    });

    const unsubscribeStats = statsService.subscribe((statsData) => {
      setStats(statsData);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeStats();
    };
  }, [products.length]);

  // Load banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await bannersService.getAllForAdmin();
        setBanners(data);
      } catch (error) {
        // Error loading banners - handled silently
      }
    };

    loadBanners();
  }, []);

  // Load store settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await storeSettingsService.get();
        setStoreSettings(
          settings || {
            storeName: "AXIS STORE",
            storeEmail: "admin@axisstore.com",
            taxRate: 0,
            shippingCost: 15,
          }
        );
      } catch (error) {
        // Error loading store settings - handled silently
        // Set defaults on error
        setStoreSettings({
          storeName: "AXIS STORE",
          storeEmail: "admin@axisstore.com",
          taxRate: 0,
          shippingCost: 15,
        });
      }
    };

    loadSettings();

    // Subscribe to settings changes
    const unsubscribe = storeSettingsService.subscribe((settings) => {
      setStoreSettings(
        settings || {
          storeName: "AXIS STORE",
          storeEmail: "admin@axisstore.com",
          taxRate: 0,
          shippingCost: 15,
        }
      );
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      navigate("/admin/login");
    } catch (error) {
      // Error logging out - handled silently
      navigate("/admin/login");
    }
  };
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "laptops",
    image: "",
    images: [],
    isSoftware: false,
    stock: 0,
    condition: "brand-new",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [additionalImageUrl, setAdditionalImageUrl] = useState<string>("");

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "laptops",
      image: "",
      isSoftware: false,
      stock: 0,
      condition: "brand-new",
    });
    setImagePreview("");
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Separate primary image from additional images
    const primaryImage = product.image || "";
    const allImages = product.images || [];
    // Filter out the primary image from additional images array
    const additionalImages = allImages.filter((img) => img !== primaryImage);

    setFormData({
      ...product,
      image: primaryImage,
      images: additionalImages,
    });
    setImagePreview(primaryImage);
    setAdditionalImageUrl("");
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsService.delete(id);
        await refreshProducts();
        // Update product count
        const newCount = products.length - 1;
        await statsService.updateProductCount(newCount);
      } catch (error) {
        // Error deleting product - handled silently
        showNotification(
          "Failed to delete product. Please try again.",
          "error"
        );
      }
    }
  };

  const handleResetRevenue = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all statistics? This cannot be undone."
      )
    ) {
      try {
        await statsService.reset();
        showNotification("Statistics reset successfully!", "success");
      } catch (error) {
        // Error resetting stats - handled silently
        showNotification("Failed to reset statistics.", "error");
      }
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      showNotification(`Order status updated to ${newStatus}`, "success");
    } catch (error) {
      // Error updating order status - handled silently
      showNotification("Failed to update order status.", "error");
    }
  };

  const handleOpenTrackingDialog = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setTrackingUrl(order.trackingUrl || "");
    setTrackingCarrier(order.trackingCarrier || "");
    setTrackingDialogOpen(true);
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsDialogOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseTrackingDialog = () => {
    setTrackingDialogOpen(false);
    setSelectedOrder(null);
    setTrackingNumber("");
    setTrackingUrl("");
    setTrackingCarrier("");
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    try {
      await ordersService.updateTracking(selectedOrder.id, {
        trackingNumber: trackingNumber.trim() || undefined,
        trackingUrl: trackingUrl.trim() || undefined,
        trackingCarrier: trackingCarrier.trim() || undefined,
      });
      handleCloseTrackingDialog();
      showNotification("Tracking information updated successfully!", "success");
    } catch (error: any) {
      // Error updating tracking - handled silently
      if (error.code === "RATE_LIMIT_EXCEEDED") {
        showNotification(
          `Rate limit exceeded. Please wait ${
            error.retryAfter || 0
          } seconds before trying again.`,
          "warning"
        );
      } else {
        showNotification("Failed to update tracking information.", "error");
      }
    }
  };

  const handleSaveProduct = async () => {
    setUploading(true);
    try {
      // Check RTDB initialization
      if (!rtdb) {
        showNotification(
          "Realtime Database is not configured. Please check: 1. VITE_FIREBASE_DATABASE_URL is set in .env file 2. Database URL is correct (no trailing comma) 3. Realtime Database is enabled in Firebase Console 4. Restart dev server after updating .env",
          "error"
        );
        // RTDB is null - error notification shown above
        setUploading(false);
        return;
      }

      // Validate required fields
      if (
        !formData.name ||
        !formData.description ||
        formData.price === undefined ||
        formData.price <= 0
      ) {
        showNotification(
          "Please fill in all required fields (name, description, price)",
          "warning"
        );
        setUploading(false);
        return;
      }

      // Validate image URL
      if (!formData.image || !formData.image.trim()) {
        showNotification("Please provide a product image URL", "warning");
        setUploading(false);
        return;
      }

      // Basic URL validation
      try {
        new URL(formData.image.trim());
      } catch {
        showNotification(
          "Please provide a valid image URL (e.g., https://example.com/image.jpg)",
          "warning"
        );
        setUploading(false);
        return;
      }

      const imagePath = formData.image.trim();

      // Combine primary image with additional images, removing duplicates
      const allImages = [imagePath, ...(formData.images || [])].filter(
        (url, index, self) => url && url.trim() && self.indexOf(url) === index
      );

      const productData: Omit<Product, "id"> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category || "laptops",
        image: imagePath,
        images: allImages.length > 1 ? allImages : undefined,
        isSoftware: formData.isSoftware || false,
        stock: formData.stock !== undefined ? Number(formData.stock) : 0,
        condition: formData.condition || "brand-new",
      };

      if (editingProduct) {
        // Update in RTDB
        await productsService.update(editingProduct.id, productData);
      } else {
        // Add to RTDB
        await productsService.create(productData);

        // Update product count
        const currentCount = products.length;
        await statsService.updateProductCount(currentCount + 1);
      }

      // Refresh products list
      await refreshProducts();

      // Show success message
      showNotification(
        editingProduct
          ? "Product updated successfully!"
          : "Product added successfully!",
        "success"
      );

      setProductDialogOpen(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "laptops",
        image: "",
        images: [],
        isSoftware: false,
        stock: 0,
        condition: "brand-new",
      });
      setImagePreview("");
      setAdditionalImageUrl("");
    } catch (error: any) {
      if (error.code === "RATE_LIMIT_EXCEEDED") {
        showNotification(
          `Rate limit exceeded. Please wait ${
            error.retryAfter || 0
          } seconds before trying again.`,
          "warning"
        );
      } else {
        showNotification(
          "Something went wrong. Please try again later.",
          "error"
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const totalRevenue = stats.totalRevenue;
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            <Stack spacing={0.5}>
              <Typography variant="h4">Admin Dashboard</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage products, orders, and store settings
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalProducts || products.length}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Software Items
                  </Typography>
                  <Typography variant="h5">
                    {products.filter((p) => p.isSoftware).length}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalOrders || orders.length}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="overline" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleResetRevenue}
                      color="error"
                    >
                      Reset
                    </Button>
                  </Stack>
                  <Typography variant="h5">
                    GH₵
                    {totalRevenue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                icon={<InventoryIcon />}
                iconPosition="start"
                label="Products"
              />
              <Tab
                icon={<ShoppingBagIcon />}
                iconPosition="start"
                label="Orders"
              />
              <Tab
                icon={<SettingsIcon />}
                iconPosition="start"
                label="Settings"
              />
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">Product Catalog</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                    >
                      Add Product
                    </Button>
                  </Stack>
                  <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Category
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} hover>
                            <TableCell>
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#f5f5f5",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/assets/products/placeholder.jpg";
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {product.name}
                              </Typography>
                              {product.isSoftware && (
                                <Chip
                                  label="Software"
                                  size="small"
                                  color="secondary"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  categories.find(
                                    (c) => c.id === product.category
                                  )?.label
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                GH₵
                                {product.price.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {product.stock !== undefined
                                  ? product.stock
                                  : 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEditProduct(product)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              )}
              {tab === 1 && (
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">Recent Orders</Typography>
                    <Chip
                      label={`${pendingOrders} Pending`}
                      color="warning"
                      variant="outlined"
                    />
                  </Stack>
                  {loadingOrders ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Order #</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ py: 2 }}
                                >
                                  No orders yet
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>{order.orderNumber}</TableCell>
                                <TableCell>
                                  <Stack>
                                    <Typography variant="body2">
                                      {order.customerInfo.fullName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {order.customerInfo.email}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  {order.items.length} item(s)
                                </TableCell>
                                <TableCell>
                                  GH₵
                                  {order.total.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell>
                                  <FormControl
                                    size="small"
                                    sx={{ minWidth: 150 }}
                                  >
                                    <Select
                                      value={order.status}
                                      onChange={(e) => {
                                        handleUpdateOrderStatus(
                                          order.id,
                                          e.target.value as Order["status"]
                                        );
                                      }}
                                      sx={{
                                        borderRadius: 0,
                                        "& .MuiSelect-select": {
                                          py: 0.5,
                                        },
                                      }}
                                    >
                                      <MenuItem value="pending">
                                        Pending
                                      </MenuItem>
                                      <MenuItem value="processing">
                                        Processing
                                      </MenuItem>
                                      <MenuItem value="shipped">
                                        Shipped
                                      </MenuItem>
                                      <MenuItem value="delivered">
                                        Delivered
                                      </MenuItem>
                                      <MenuItem value="cancelled">
                                        Cancelled
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1}>
                                    {(order.status === "shipped" ||
                                      order.status === "processing") && (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() =>
                                          handleOpenTrackingDialog(order)
                                        }
                                      >
                                        {order.trackingNumber
                                          ? "Edit Tracking"
                                          : "Add Tracking"}
                                      </Button>
                                    )}
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        handleOpenOrderDetails(order)
                                      }
                                    >
                                      View Details
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              )}
              {tab === 2 && (
                <Stack spacing={3}>
                  <Typography variant="h6">Store Settings</Typography>

                  {/* Banner Management */}
                  <Paper sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Homepage Banners</Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setEditingBanner(null);
                            setBannerFormData({
                              imageUrl: "",
                              linkUrl: "",
                              order: banners.length,
                              active: true,
                            });
                            setBannerDialogOpen(true);
                          }}
                        >
                          Add Banner
                        </Button>
                      </Stack>
                      <Grid container spacing={2}>
                        {banners.map((banner) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={banner.id}>
                            <Card>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 150,
                                  overflow: "hidden",
                                  position: "relative",
                                }}
                              >
                                <img
                                  src={banner.imageUrl}
                                  alt={`Banner ${banner.order}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                                <Chip
                                  label={banner.active ? "Active" : "Inactive"}
                                  color={banner.active ? "success" : "default"}
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                  }}
                                />
                              </Box>
                              <CardContent>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Order: {banner.order}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingBanner(banner);
                                    setBannerFormData({
                                      imageUrl: banner.imageUrl,
                                      linkUrl: banner.linkUrl || "",
                                      order: banner.order,
                                      active: banner.active,
                                    });
                                    setBannerDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this banner?"
                                      )
                                    ) {
                                      try {
                                        await bannersService.delete(banner.id);
                                        const updated =
                                          await bannersService.getAllForAdmin();
                                        setBanners(updated);
                                      } catch (error) {
                                        showNotification(
                                          "Failed to delete banner",
                                          "error"
                                        );
                                      }
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                        {banners.length === 0 && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              textAlign="center"
                              sx={{ py: 4 }}
                            >
                              No banners yet. Add your first banner to get
                              started.
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Stack>
                  </Paper>

                  {/* Store Settings */}
                  <Paper
                    sx={{ p: 3, borderRadius: 0, border: "1px solid #e0e0e0" }}
                  >
                    <Stack spacing={3}>
                      <Typography variant="h6" fontWeight={700}>
                        Store Settings
                      </Typography>
                      <TextField
                        label="Store Name"
                        value={storeSettings.storeName || ""}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            storeName: e.target.value,
                          })
                        }
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                      />
                      <TextField
                        label="Store Email"
                        type="email"
                        value={storeSettings.storeEmail || ""}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            storeEmail: e.target.value,
                          })
                        }
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                      />
                      <TextField
                        label="Tax Rate (%)"
                        type="number"
                        value={storeSettings.taxRate || 0}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            taxRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                        helperText="Tax rate as a percentage (e.g., 8.5 for 8.5%)"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                      />
                      <TextField
                        label="Shipping Cost (GH₵)"
                        type="number"
                        value={storeSettings.shippingCost || 0}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            shippingCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        helperText="Standard shipping cost for all orders"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                      />
                      <Button
                        variant="contained"
                        onClick={async () => {
                          setSavingSettings(true);
                          try {
                            await storeSettingsService.update(storeSettings);
                            showNotification(
                              "Store settings saved successfully!",
                              "success"
                            );
                          } catch (error) {
                            showNotification(
                              "Failed to save store settings.",
                              "error"
                            );
                          } finally {
                            setSavingSettings(false);
                          }
                        }}
                        disabled={savingSettings}
                        sx={{ alignSelf: "flex-start", borderRadius: 0 }}
                      >
                        {savingSettings ? "Saving..." : "Save Settings"}
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              )}
            </Box>
          </Paper>
        </Stack>
      </Container>

      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Product Image URL"
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                setImagePreview(e.target.value);
              }}
              fullWidth
              required
              placeholder="https://example.com/product-image.jpg"
              helperText="Enter a valid image URL"
            />
            {imagePreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  style={{
                    maxWidth: "50%",
                    maxHeight: 200,
                    borderRadius: 4,
                    objectFit: "contain",
                    border: "1px solid #e0e0e0",
                  }}
                />
              </Box>
            )}

            {/* Additional Images Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Additional Images (for product modal)
              </Typography>
              <Stack spacing={1}>
                {(formData.images || []).map((imgUrl, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      border: "1px solid #e0e0e0",
                      borderRadius: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={imgUrl}
                      alt={`Additional ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                        bgcolor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {imgUrl}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newImages = (formData.images || []).filter(
                          (_, i) => i !== index
                        );
                        setFormData({ ...formData, images: newImages });
                      }}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Add Image URL"
                    value={additionalImageUrl}
                    onChange={(e) => setAdditionalImageUrl(e.target.value)}
                    placeholder="https://example.com/additional-image.jpg"
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      if (additionalImageUrl.trim()) {
                        try {
                          new URL(additionalImageUrl.trim());
                          setFormData({
                            ...formData,
                            images: [
                              ...(formData.images || []),
                              additionalImageUrl.trim(),
                            ],
                          });
                          setAdditionalImageUrl("");
                        } catch {
                          showNotification(
                            "Please enter a valid image URL",
                            "warning"
                          );
                        }
                      }
                    }}
                    disabled={!additionalImageUrl.trim()}
                    sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                  >
                    Add
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as CategoryId,
                })
              }
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </TextField>
            <TextField
              label="Stock Quantity"
              type="number"
              value={formData.stock || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
              inputProps={{ min: 0 }}
              helperText="Number of items in stock"
            />
            <TextField
              select
              label="Condition"
              value={formData.condition || "brand-new"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as ProductCondition,
                })
              }
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="brand-new">Brand New</option>
              <option value="refurbished">Refurbished</option>
            </TextField>
            <Box>
              <input
                type="checkbox"
                id="isSoftware"
                checked={formData.isSoftware || false}
                onChange={(e) =>
                  setFormData({ ...formData, isSoftware: e.target.checked })
                }
              />
              <label htmlFor="isSoftware" style={{ marginLeft: 8 }}>
                This is a software product
              </label>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.description ||
              !formData.price ||
              formData.price <= 0 ||
              !formData.image ||
              uploading
            }
          >
            {uploading ? "Saving..." : editingProduct ? "Update" : "Add"}{" "}
            Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tracking Information Dialog */}
      <Dialog
        open={trackingDialogOpen}
        onClose={handleCloseTrackingDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Tracking Information</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              fullWidth
              placeholder="e.g., 1Z999AA10123456784"
            />
            <TextField
              label="Carrier"
              value={trackingCarrier}
              onChange={(e) => setTrackingCarrier(e.target.value)}
              fullWidth
              placeholder="e.g., DHL, FedEx, UPS"
            />
            <TextField
              label="Tracking URL"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              fullWidth
              placeholder="https://..."
              helperText="Optional: Direct link to track the package"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrackingDialog}>Cancel</Button>
          <Button onClick={handleSaveTracking} variant="contained">
            Save Tracking Info
          </Button>
        </DialogActions>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog
        open={bannerDialogOpen}
        onClose={() => setBannerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingBanner ? "Edit Banner" : "Add New Banner"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Banner Image URL"
              value={bannerFormData.imageUrl}
              onChange={(e) =>
                setBannerFormData({
                  ...bannerFormData,
                  imageUrl: e.target.value,
                })
              }
              fullWidth
              required
              placeholder="https://example.com/banner-image.jpg"
              helperText="Enter a valid image URL"
            />
            {bannerFormData.imageUrl && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={bannerFormData.imageUrl}
                  alt="Banner preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 0,
                    objectFit: "contain",
                    border: "1px solid #e0e0e0",
                  }}
                />
              </Box>
            )}
            <TextField
              label="Link URL (Optional)"
              value={bannerFormData.linkUrl}
              onChange={(e) =>
                setBannerFormData({
                  ...bannerFormData,
                  linkUrl: e.target.value,
                })
              }
              fullWidth
              placeholder="https://example.com or /category/laptops"
              helperText="Leave empty for no link. Use full URL for external links or /path for internal routes"
            />
            <TextField
              label="Display Order"
              type="number"
              value={bannerFormData.order}
              onChange={(e) =>
                setBannerFormData({
                  ...bannerFormData,
                  order: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
              required
              helperText="Lower numbers appear first"
            />
            <Box>
              <Button
                variant={bannerFormData.active ? "contained" : "outlined"}
                onClick={() =>
                  setBannerFormData({
                    ...bannerFormData,
                    active: !bannerFormData.active,
                  })
                }
                fullWidth
              >
                {bannerFormData.active ? "Active" : "Inactive"}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBannerDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!bannerFormData.imageUrl.trim()) {
                showNotification(
                  "Please provide a banner image URL",
                  "warning"
                );
                return;
              }

              // Check if user is authenticated
              if (!user || !user.email) {
                showNotification(
                  "You must be logged in to save banners",
                  "warning"
                );
                return;
              }

              // Attempting to save banner

              // Verify Firebase Auth is connected
              if (!user) {
                showNotification(
                  "You must be logged in with Firebase Auth to save banners",
                  "warning"
                );
                return;
              }

              try {
                // Validate URL
                try {
                  new URL(bannerFormData.imageUrl.trim());
                } catch {
                  showNotification(
                    "Please provide a valid image URL",
                    "warning"
                  );
                  return;
                }

                if (editingBanner) {
                  await bannersService.update(editingBanner.id, {
                    imageUrl: bannerFormData.imageUrl.trim(),
                    linkUrl: bannerFormData.linkUrl.trim() || undefined,
                    order: Number(bannerFormData.order) || 0,
                    active: Boolean(bannerFormData.active),
                  });
                } else {
                  await bannersService.create({
                    imageUrl: bannerFormData.imageUrl.trim(),
                    linkUrl: bannerFormData.linkUrl.trim() || undefined,
                    order: Number(bannerFormData.order) || 0,
                    active: Boolean(bannerFormData.active),
                  });
                }

                const updated = await bannersService.getAllForAdmin();
                setBanners(updated);
                setBannerDialogOpen(false);
                setBannerFormData({
                  imageUrl: "",
                  linkUrl: "",
                  order: banners.length,
                  active: true,
                });
                setEditingBanner(null);
                showNotification(
                  editingBanner
                    ? "Banner updated successfully!"
                    : "Banner added successfully!",
                  "success"
                );
              } catch (error: any) {
                const errorMessage =
                  error?.message || error?.code || "Unknown error";

                if (error?.code === "PERMISSION_DENIED") {
                  showNotification(
                    `Permission denied. Your email (${user?.email}) may not be authorized. Please check: 1. Your email is exactly 'tredway4k@gmail.com' in the RTDB security rules 2. Security rules are deployed to Firebase 3. You're logged in with the correct account (tredway4k@gmail.com). Current allowed email: tredway4k@gmail.com`,
                    "error"
                  );
                } else {
                  showNotification(
                    `Failed to save banner: ${errorMessage}. Please check your Firebase permissions and RTDB security rules.`,
                    "error"
                  );
                }
              }
            }}
          >
            {editingBanner ? "Update" : "Add"} Banner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsDialogOpen}
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Order Details</Typography>
            <IconButton onClick={handleCloseOrderDetails} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={3}>
              {/* Order Info */}
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Order Number
                </Typography>
                <Typography variant="h6">
                  {selectedOrder.orderNumber}
                </Typography>
              </Box>

              <Divider />

              {/* Customer Info */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Customer Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedOrder.customerInfo.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedOrder.customerInfo.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedOrder.customerInfo.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong>{" "}
                    {selectedOrder.customerInfo.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Region:</strong> {selectedOrder.customerInfo.region}
                  </Typography>
                  {selectedOrder.customerInfo.gpsCode && (
                    <Typography variant="body2">
                      <strong>GPS Code:</strong>{" "}
                      {selectedOrder.customerInfo.gpsCode}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* Order Items */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Order Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            GH₵
                            {item.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            GH₵
                            {(item.price * item.quantity).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider />

              {/* Order Summary */}
              <Box>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">
                      GH₵
                      {selectedOrder.subtotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Shipping</Typography>
                    <Typography variant="body2">
                      GH₵
                      {selectedOrder.shipping.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary">
                      GH₵
                      {selectedOrder.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Order Status & Dates */}
              <Box>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status) as any}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      <strong>Payment Status:</strong>
                    </Typography>
                    <Chip
                      label={selectedOrder.paymentStatus || "pending"}
                      color={
                        selectedOrder.paymentStatus === "paid"
                          ? "success"
                          : "warning"
                      }
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2">
                    <strong>Order Date:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Typography>
                  {selectedOrder.updatedAt && (
                    <Typography variant="body2">
                      <strong>Last Updated:</strong>{" "}
                      {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Tracking Info */}
              {(selectedOrder.trackingNumber || selectedOrder.trackingUrl) && (
                <>
                  <Divider />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      Tracking Information
                    </Typography>
                    <Stack spacing={1}>
                      {selectedOrder.trackingNumber && (
                        <Typography variant="body2">
                          <strong>Tracking Number:</strong>{" "}
                          {selectedOrder.trackingNumber}
                        </Typography>
                      )}
                      {selectedOrder.trackingCarrier && (
                        <Typography variant="body2">
                          <strong>Carrier:</strong>{" "}
                          {selectedOrder.trackingCarrier}
                        </Typography>
                      )}
                      {selectedOrder.trackingUrl && (
                        <Typography variant="body2">
                          <strong>Tracking URL:</strong>{" "}
                          <a
                            href={selectedOrder.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "inherit" }}
                          >
                            {selectedOrder.trackingUrl}
                          </a>
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetails}>Close</Button>
          {selectedOrder &&
            (selectedOrder.status === "shipped" ||
              selectedOrder.status === "processing") && (
              <Button
                variant="contained"
                onClick={() => {
                  handleCloseOrderDetails();
                  handleOpenTrackingDialog(selectedOrder);
                }}
              >
                {selectedOrder.trackingNumber
                  ? "Edit Tracking"
                  : "Add Tracking"}
              </Button>
            )}
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
