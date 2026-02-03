"use client";
import { useState, useEffect } from "react";
import { ScanBarcode, Loader, ShoppingBag } from "lucide-react";
import Message from "../../../components/Message";
import ProductsList from "../../../components/CreateOrder/ProductsList";
import CategoriesSection from "../../../components/CreateOrder/CategoriesSection";
import PendingOrdersSection from "../../../components/CreateOrder/PendingOrdersSection";
import CartSection from "../../../components/CreateOrder/CartSection";
import axiosClient from "../../../lib/axios-client";
import { useDebounce } from "use-debounce";
import OrderReceiptDialog from "../../../components/Order/OrderReceiptDialog";

export default function CreateOrderPage() {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refetsh, setRefetsh] = useState(true);
  const [refetshPending, setRefetshPending] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [itemId, setItemId] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  // get pending Orders
  const [pendingOrders, setPendingOrders] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          status: "pending",
        };
        setIsLoading(true);
        const { data } = await axiosClient.get(`/orders`, { params });
        setPendingOrders(data.data);
      } catch (error) {
        console.log(error);
        if (error.response) {
          setMessage({ type: "error", message: error.response.data.message });
        } else {
          setMessage({ type: "error", message: error.message });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refetshPending]);
  // get products & categories
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchValue] = useDebounce(productSearch, 1000);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // customer data
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [discountValue, setDiscountValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCategoryLoading(true);
        const { data } = await axiosClient.get(`/categories`);

        setCategories(data.data);
      } catch (error) {
        console.log(error);
        if (error.response) {
          setMessage({ type: "error", message: error.response.data.message });
        } else {
          setMessage({ type: "error", message: error.message });
        }
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    setPage(1);
    setRefetsh(!refetsh);
  }, [limit, searchValue, selectedCategory]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: page,
          limit: limit,
          search: searchValue,
          categoryId: selectedCategory,
        };
        setProductsLoading(true);
        const { data } = await axiosClient.get(`/products`, { params });

        setProducts(data.data);
        setTotalPages(data?.pagination?.pages);
      } catch (error) {
        console.log(error);
        if (error.response) {
          setMessage({ type: "error", message: error.response.data.message });
        } else {
          setMessage({ type: "error", message: error.message });
        }
      } finally {
        setProductsLoading(false);
      }
    };
    fetchData();
  }, [page, refetsh]);

  ////////////////////////////////////////////////////////////////////////////

  const addToCart = (product) => {
    if (!product) return;
    if (product.stock == 0) {
      setMessage({
        type: "error",
        message: "هذا المنتج غير متاح .. انتهت الكمية المتاحة",
      });
      return;
    }

    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          _id: product._id,
          name: product.name,
          quantity: 1,
          salePrice: product.salePrice,
          regularPrice: product.regularPrice,
          stock: product.stock || 0,
          price:
            product.salePrice > 0 ? product.salePrice : product.regularPrice,
          product: product, // Keep full product reference
        },
      ]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const updateItemPrice = (productId, newPrice) => {
    setCart(
      cart.map((item) =>
        item._id === productId ? { ...item, price: newPrice } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice =
        item.price || (item.salePrice > 0 ? item.salePrice : item.regularPrice);
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  // Add these new state variables for receipt dialog
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const handleCreateOrder = async (suspend = false, orderData) => {
    if (cart.length === 0) {
      setMessage({ type: "error", message: "من فضلك أضف منتجات للعربة" });
      return;
    }
    // Validate all items have valid prices
    const hasInvalidPrice = cart.some((item) => !item.price || item.price <= 0);
    if (hasInvalidPrice) {
      setMessage({
        type: "error",
        message: "من فضلك تأكد من أسعار جميع المنتجات",
      });
      return;
    }
    const Order = {
      ...orderData,
      status: suspend ? "pending" : "completed",
    };
    try {
      setIsLoading(true);
      const { data } = await axiosClient.post(`/orders`, Order);

      setMessage({ type: "success", message: "تم أضافة طلب بنجاح" });
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDateOfBirth("");
      setDiscountValue("");
      setShippingCost("");
      // Store the created order and show receipt dialog
      setCreatedOrder(data.data); // Assuming API returns order in data.data
      setShowReceiptDialog(true);
      // Optional: Auto-print after 1 second
      // setTimeout(() => {
      //   document.getElementById('auto-print-btn')?.click();
      // }, 1000);
    } catch (error) {
      console.log(error);
      if (error.response) {
        setMessage({ type: "error", message: error.response.data.message });
      } else {
        setMessage({ type: "error", message: error.message });
      }
    } finally {
      setRefetshPending(!refetshPending);
      setRefetsh(!refetsh);
      setIsLoading(false);
    }
  };
  // Handler to close receipt dialog
  const handleCloseReceiptDialog = () => {
    setShowReceiptDialog(false);
    setCreatedOrder(null);
  };
  ////////////////////////////////////////////////////////////////////////////
  // add product to cart By scan
  useEffect(() => {
    if (!submittedId) return;
    const ScanedProduct = products?.find(
      (product) => product?._id == submittedId
    );

    if (!ScanedProduct) {
      setMessage({ type: "error", message: "هذا المنتج غير موجود" });
    } else {
      if (
        ScanedProduct?.stock ==
        cart?.find((item) => item._id === ScanedProduct._id)?.quantity
      ) {
        setMessage({ type: "error", message: "لا يوجد كمية كافية" });
      } else {
        addToCart(ScanedProduct);
        setItemId("");
      }
    }
  }, [submittedId]);

  return (
    <div className="space-y-4">
      <Message message={message} setMessage={setMessage} />

      {/* Add Receipt Dialog at the end */}
      <OrderReceiptDialog
        isOpen={showReceiptDialog}
        onClose={handleCloseReceiptDialog}
        orderData={createdOrder}
        autoPrint={true}
      />
      {/* search and header */}
      <div className="flex justify-between items-center space-x-4 bg-white shadow m-4 mx-auto p-2 rounded-2xl w-[90%]">
        {/* title */}
        <div className="flex items-center space-x-2">
          <span className="flex justify-center items-center bg-green-500 rounded-full size-8">
            <ShoppingBag className="size-5 text-white" />
          </span>
          <h1 className="font-bold text-gray-800 text-lg">سجل طلب</h1>
        </div>
        {/* search */}
        <div className="relative flex-1">
          <ScanBarcode className="top-1/2 left-2 absolute text-gray-900 -translate-y-1/2" />
          {isLoading && (
            <Loader className="top-3 right-8 absolute size-4 -translate-y-1/2 animate-spin" />
          )}
          <input
            autoFocus
            type="search"
            className="p-3 !pl-10 border-2 border-gray-200 rounded-2xl w-full"
            placeholder="إدخل كود المنتج ..."
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (itemId.trim()) {
                  setSubmittedId(itemId.trim());
                } else {
                  setMessage({ type: "error", message: "حدث خطأ" });
                }
              }
            }}
          />
        </div>
      </div>
      {/* body */}
      <div className="gap-4 grid grid-cols-1 lg:grid-cols-3 p-2 w-full min-h-[80vh]">
        {/* right section */}
        <div className="space-y-2 lg:col-span-2">
          {pendingOrders.length > 0 && (
            <PendingOrdersSection
              products={products}
              refetshPending={refetshPending}
              setRefetshPending={setRefetshPending}
              pendingOrders={pendingOrders}
              setMessage={setMessage}
            />
          )}
          <CategoriesSection
            categoryLoading={categoryLoading}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
            categories={categories}
          />
          <ProductsList
            cart={cart}
            productsLoading={productsLoading}
            products={products}
            addToCart={addToCart}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
          />
        </div>
        {/* left section - cart */}
        <CartSection
          setMessage={setMessage}
          cart={cart}
          handleCreateOrder={handleCreateOrder}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          updateItemPrice={updateItemPrice}
          calculateTotal={calculateTotal}
          clearCart={clearCart}
          isLoading={isLoading}
          customerName={customerName}
          setCustomerName={setCustomerName}
          setCustomerPhone={setCustomerPhone}
          customerPhone={customerPhone}
          setDateOfBirth={setDateOfBirth}
          dateOfBirth={dateOfBirth}
          setDiscountValue={setDiscountValue}
          discountValue={discountValue}
          shippingCost={shippingCost}
          setShippingCost={setShippingCost}
        />
      </div>
    </div>
  );
}
