import { ShoppingCart, User, Phone, Calendar, Percent, DollarSign, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../Button";
import NoData from "../NoData";
import CartItem from "./CartItem";
import axiosClient from "../../lib/axios-client";
import { useDebounce } from "use-debounce";

const CartSection = ({
    cart = [],
    handleCreateOrder,
    removeFromCart,
    updateQuantity,
    updateItemPrice,
    calculateTotal,
    clearCart,
    isLoading = false,
    setMessage,
    customerName,
    setCustomerName,
    setCustomerPhone,
    customerPhone,
    setDateOfBirth,
    dateOfBirth,
    setDiscountValue,
    discountValue,
    shippingCost,
    setShippingCost
}) => {

    // Customer data state
    const [customerSection, setCustomerSection] = useState(true);

    const [customerPhoneRed] = useDebounce(customerPhone, 500);

    const [oldCustormer, setOldCustormer] = useState(null);

    const dateInputRef = useRef(null);

    // Discount state
    const [discountSection, setDiscountSection] = useState(false);
    const [discountType, setDiscountType] = useState("percentage"); // "percentage" or "fixed"


    // Shipping state
    const [shippingSection, setShippingSection] = useState(false);


    // check if customer is exist
    useEffect(() => {
        if (!customerPhoneRed) return
        const fetchData = async () => {
            try {
                // setCategoryLoading(true);
                const { data } = await axiosClient.get(`/customers/phone/${customerPhoneRed}`);
                setCustomerName(data?.data?.name)
                setDateOfBirth(data?.data?.birthdayDate.split("T", 1))
                setOldCustormer(data?.data)
              
            } catch (error) {
                setCustomerName("")
                setDateOfBirth("")
                setOldCustormer(null)
                console.log(error);
                if (error.response) {
                    // setMessage({ type: "error", message: error.response.data.message });
                } else {
                    // setMessage({ type: "error", message: error.message });
                }
            } finally {
                // setCategoryLoading(false);
            }
        };
        fetchData();
    }, [customerPhoneRed])



    // Calculate subtotal and validate cart items
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => {
            const itemPrice = item.price ||
                (item.salePrice > 0 ? item.salePrice : item.regularPrice);
            return acc + itemPrice * item.quantity;
        }, 0);
    }, [cart]);

    // Calculate discount amount
    const discountAmount = useMemo(() => {
        if (!discountValue || discountValue <= 0) return 0;

        if (discountType === "percentage") {
            return subtotal * (parseFloat(discountValue) / 100);
        } else {
            return parseFloat(discountValue);
        }
    }, [discountType, discountValue, subtotal]);

    // Calculate shipping
    const shipping = useMemo(() => {
        return parseFloat(shippingCost) || 0;
    }, [shippingCost]);

    // Calculate final total
    const finalTotal = useMemo(() => {
        return subtotal - discountAmount + shipping;
    }, [subtotal, discountAmount, shipping]);

    // Check if all items have valid prices
    const hasValidPrices = useMemo(() => {
        return cart.every(item => {
            const price = item.price || item.salePrice || item.regularPrice;
            return price > 0;
        });
    }, [cart]);

    // Check if customer data is valid
    const hasValidCustomerData = useMemo(() => {
        return customerName.trim() !== "" && customerPhone.trim() !== "";
    }, [customerName, customerPhone]);

    // Total items count
    const totalItems = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const handleQuantityIncrement = (_id) => {
        const item = cart.find(item => item._id === _id);
        if (item && item.quantity < item.stock) {
            updateQuantity(_id, item.quantity + 1);
        }
    };

    const handleQuantityDecrement = (_id) => {
        const item = cart.find(item => item._id === _id);
        if (item && item.quantity > 1) {
            updateQuantity(_id, item.quantity - 1);
        }
    };

    const handlePriceChange = (_id, newPrice) => {
        updateItemPrice(_id, newPrice);
    };

    const handleDelete = (_id) => {
        removeFromCart(_id);
    };

    const handleClearCart = () => {
        // if (window.confirm("هل أنت متأكد من حذف جميع المنتجات من العربة؟")) {
        clearCart();
        // Reset all fields
        setCustomerName("");
        setCustomerPhone("");
        setDateOfBirth("");
        setDiscountValue("");
        setShippingCost("");
        // }
    };

    const handleSuspendOrder = () => {
        if (!hasValidPrices) {
            alert("من فضلك تأكد من أسعار جميع المنتجات");
            return;
        }
        if (!hasValidCustomerData) {
            alert("من فضلك أدخل بيانات العميل (الاسم والهاتف)");
            return;
        }

        const orderData = {
            items: cart,
            customer: {
                name: customerName,
                phone: customerPhone,
                dateOfBirth: dateOfBirth || null
            },
            discount: discountValue ? {
                type: discountType,
                value: parseFloat(discountValue),
                amount: discountAmount
            } : null,
            shipping: shipping > 0 ? shipping : 0,
            subtotal,
            total: finalTotal
        };

        handleCreateOrder(true, orderData);
    };

    const handleConfirmOrder = () => {
        if (!hasValidPrices) {
            alert("من فضلك تأكد من أسعار جميع المنتجات");
            return;
        }
        if (!hasValidCustomerData) {
            alert("من فضلك أدخل بيانات العميل (الاسم والهاتف)");
            return;
        }

        const orderData = {
            items: cart,
            customer: oldCustormer ? oldCustormer : {
                name: customerName,
                phone: customerPhone,
                dateOfBirth: dateOfBirth || null
            },
            discount: discountValue ? {
                type: discountType,
                value: parseFloat(discountValue),
                amount: discountAmount
            } : null,
            shipping: shipping > 0 ? shipping : 0,
            subtotal,
            total: finalTotal
        };
        // console.log(orderData)
        handleCreateOrder(false, orderData);
    };

    return (
        <div className="flex flex-col justify-start lg:col-span-1 bg-white shadow-sm p-4 rounded-xl max-h-[100vh] min-h-[88vh] overflow-hidden space-y-3">
            {/* Header Section */}
            <div className='flex lg:block space-y-0 lg:space-y-2 xl:space-y-0  xl:flex justify-between items-center gap-2 w-full mb-3'>
                <div className="flex items-center justify-start space-x-2">
                    <ShoppingCart size={24} className="text-green-500" />
                    <h2 className="font-semibold text-gray-900 text-xl">عربة التسوق</h2>
                    {cart.length > 0 && (
                        <span className='text-red-500 text-lg font-bold'>
                            ({totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'})
                        </span>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="flex justify-end items-center">
                        <Button
                            label={"حذف الكل"}
                            variant='filled'
                            color='danger'
                            rounded={"lg"}
                            onClick={handleClearCart}
                            disabled={isLoading}
                            className="text-xs px-3 py-1"
                        />
                    </div>
                )}
            </div>

            {/* Customer Data Section */}
            {!customerSection ?
                <div
                    onClick={() => setCustomerSection(true)}
                    className="flex items-center gap-2 mb-1 bg-blue-50 rounded-full p-1 border-2 border-blue-200 cursor-pointer w-full justify-center">
                    <User size={18} className="text-blue-600" />
                    <h3 className="font-bold text-blue-900 text-sm">بيانات العميل</h3>
                </div>
                :
                <div
                    className="bg-blue-50 rounded-xl p-3 border-2 border-blue-200 space-y-2">
                    <div
                        onClick={() => setCustomerSection(false)}
                        className="flex items-center gap-2 mb-2 cursor-pointer">
                        <User size={18} className="text-blue-600" />
                        <h3 className="font-bold text-blue-900 text-sm">بيانات العميل</h3>
                    </div>
                    {/* Customer Phone */}
                    <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            dir="rtl"
                            type="tel"
                            placeholder="رقم الهاتف *"
                            value={customerPhone}
                            onChange={(e) => {
                                // allow only digits
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                setCustomerPhone(value);
                            }}
                            inputMode="numeric" // ensures numeric keypad on mobile
                            pattern="[0-9]*" // restricts to digits for validation
                            className="w-full pr-10 pl-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>
                    {/* Customer Name */}
                    <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            disabled={oldCustormer}
                            dir="rtl"
                            type="text"
                            placeholder="اسم العميل *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full pr-10 pl-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>
                    {/* Date of Birth */}
                    <div className="relative">
                        <Calendar
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            size={16}
                            onClick={() => dateInputRef.current?.showPicker()}
                        />
                        <input
                            disabled={oldCustormer}
                            ref={dateInputRef}
                            type="date"
                            placeholder="تاريخ الميلاد"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            onClick={() => dateInputRef.current?.showPicker()} // opens picker on click
                            className="w-full pr-10 pl-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
                        />
                        {/* <input
                            type="text"
                            placeholder="تاريخ الميلاد"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => (e.target.type = "date")}
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full pr-10 pl-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        /> */}
                    </div>
                </div>
            }
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 " style={{ maxHeight: 'calc(88vh - 200px)' }}>
                {/* Cart Items Section */}
                {cart.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[100px]">
                        <NoData cart data={"العربة فارغة أضف منتجات"} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item) => (
                            <CartItem
                                key={item._id}
                                item={item}
                                onDelete={handleDelete}
                                onQuantityDecrement={handleQuantityDecrement}
                                onQuantityIncrement={handleQuantityIncrement}
                                onPriceChange={handlePriceChange}
                            />
                        ))}
                    </div>
                )}


            </div>

            {/* Discount Section */}
            {cart.length > 0 && (!discountSection ?
                <div
                    onClick={() => setDiscountSection(true)}
                    className="bg-purple-50 rounded-full p-1 border-2 border-purple-200 cursor-pointer w-full justify-center flex items-center gap-2 mb-1">
                    <Percent size={18} className="text-purple-600" />
                    <h3 className="font-bold text-purple-900 text-sm">الخصم</h3>
                </div>
                :
                <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200 space-y-2">
                    <div
                        onClick={() => setDiscountSection(false)}
                        className="flex items-center gap-2 mb-2 cursor-pointer">
                        <Percent size={18} className="text-purple-600" />
                        <h3 className="font-bold text-purple-900 text-sm">الخصم</h3>
                    </div>

                    {/* Discount Type Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDiscountType("percentage")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${discountType === "percentage"
                                ? "bg-purple-500 text-white"
                                : "bg-white text-purple-500 border-2 border-purple-300"
                                }`}
                        >
                            نسبة مئوية %
                        </button>
                        <button
                            onClick={() => setDiscountType("fixed")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${discountType === "fixed"
                                ? "bg-purple-500 text-white"
                                : "bg-white text-purple-500 border-2 border-purple-300"
                                }`}
                        >
                            مبلغ ثابت EGP
                        </button>
                    </div>

                    {/* Discount Value Input */}
                    <div className="relative">
                        {discountType === "percentage" ? (
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        ) : (
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        )}
                        <input
                            type="number"
                            placeholder={discountType === "percentage" ? "النسبة المئوية" : "قيمة الخصم"}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            min="0"
                            max={discountType === "percentage" ? "100" : undefined}
                            step="0.01"
                            className="w-full pr-10 pl-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                    </div>

                    {/* Discount Amount Display */}
                    {discountAmount > 0 && (
                        <div className="bg-white rounded-lg p-2 border border-purple-300">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">مبلغ الخصم:</span>
                                <span className="font-bold text-purple-600">
                                    -{discountAmount} EGP
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Shipping Section */}
            {cart.length > 0 && (!shippingSection ?
                <div
                    onClick={() => setShippingSection(true)}
                    className="bg-orange-50 rounded-full p-1 border-2 border-orange-200 cursor-pointer w-full flex items-center gap-2 mb-1 justify-center">
                    <Truck size={18} className="text-orange-600" />
                    <h3 className="font-bold text-orange-900 text-sm">الشحن</h3>
                </div>

                :
                <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-200 space-y-2">
                    <div
                        onClick={() => setShippingSection(false)}
                        className="flex items-center gap-2 mb-2 cursor-pointer">
                        <Truck size={18} className="text-orange-600" />
                        <h3 className="font-bold text-orange-900 text-sm">الشحن</h3>
                    </div>

                    <div className="relative">
                        <Truck className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="number"
                            placeholder="تكلفة الشحن (اختياري)"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full pr-10 pl-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                    </div>
                </div>
            )}
            {/* Footer Section */}

            <div className='space-y-2 w-full mt-1 pt-1 border-t-2 border-gray-200'>
                {/* Price Breakdown */}
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>المجموع الفرعي:</span>
                        <span className="font-semibold">{subtotal} EGP</span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-purple-600">
                            <span>الخصم:</span>
                            <span className="font-semibold">-{discountAmount} EGP</span>
                        </div>
                    )}

                    {shipping > 0 && (
                        <div className="flex justify-between items-center text-orange-600">
                            <span>الشحن:</span>
                            <span className="font-semibold">+{shipping} EGP</span>
                        </div>
                    )}
                </div>

                {/* Total Section */}
                <div className="w-full bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border-2 border-green-200">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-base">الإجمالي النهائي:</span>
                        <span className="text-green-600 font-bold text-xl">
                            {finalTotal} EGP
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div dir="ltr" className="flex justify-between items-center gap-2 w-full">
                    <Button
                        large
                        onClick={handleSuspendOrder}
                        color="yellow"
                        label={"تعليق الطلب"}
                        rounded={"lg"}
                        disabled={isLoading || cart.length == 0 || !hasValidPrices || !hasValidCustomerData}
                        className="flex-1"
                    />
                    <Button
                        large
                        onClick={handleConfirmOrder}
                        color="green"
                        label={"أكد الطلب"}
                        rounded={"lg"}
                        variant="filled"
                        disabled={isLoading || cart.length == 0 || !hasValidPrices || !hasValidCustomerData}
                        className="flex-1"
                    />
                </div>

                {/* Validation Warnings */}
                {(!hasValidPrices || !hasValidCustomerData) && (
                    <div className="space-y-1">
                        {!hasValidPrices && (
                            <p className="text-xs text-red-500 text-center">
                                • تأكد من إدخال أسعار صحيحة لجميع المنتجات
                            </p>
                        )}
                        {!hasValidCustomerData && (
                            <p className="text-xs text-red-500 text-center">
                                • من فضلك أدخل اسم العميل ورقم الهاتف
                            </p>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default CartSection;