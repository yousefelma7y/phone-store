import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import { Printer, X } from "lucide-react";
import Cookies from "js-cookie";

const OrderReceipt = ({ order, isGift, user }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    const formatCurrency = (amount) => {
        return Number(amount || 0).toFixed(2);
    };

    const calculateDiscount = (order) => {
        if (!order.discount) return 0;
        return order.discount.amount || 0;
    };

    return (
        <div className="mx-auto w-full max-w-[400px] space-y-3 rounded-lg border-2 border-dashed border-gray-400 p-6 text-gray-700 font-mono text-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-gray-400 pb-3">
                <h2 className="text-xl font-bold text-black capitalize">{user?.brandName}</h2>
                <p className="text-sm text-gray-600">
                    {user?.location || "العنوان"}
                </p>
                <p className="text-sm text-gray-600">
                    تليفون: {user?.phone || "0123456789"}
                </p>
            </div>

            {/* Date */}
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    {formatDate(order?.createdAt || new Date())}
                </p>
            </div>

            {/* Order Number */}
            <div className="relative !flex !flex-col items-center justify-center rounded-lg border-2 border-dashed border-black !p-3 !my-3">
                <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white px-4 text-sm font-semibold text-black">
                    رقم الطلب
                </p>
                <svg className="w-48 h-16 mb-1">
                    <rect x="2" y="0" width="2" height="60" fill="black" />
                    <rect x="6" y="0" width="4" height="60" fill="black" />
                    <rect x="12" y="0" width="2" height="60" fill="black" />
                    <rect x="16" y="0" width="6" height="60" fill="black" />
                    <rect x="24" y="0" width="2" height="60" fill="black" />
                    <rect x="28" y="0" width="4" height="60" fill="black" />
                    <rect x="34" y="0" width="2" height="60" fill="black" />
                    <rect x="38" y="0" width="6" height="60" fill="black" />
                    <rect x="46" y="0" width="4" height="60" fill="black" />
                    <rect x="52" y="0" width="2" height="60" fill="black" />
                    <rect x="56" y="0" width="6" height="60" fill="black" />
                    <rect x="64" y="0" width="2" height="60" fill="black" />
                    <rect x="68" y="0" width="4" height="60" fill="black" />
                    <rect x="74" y="0" width="6" height="60" fill="black" />
                    <rect x="82" y="0" width="2" height="60" fill="black" />
                    <rect x="86" y="0" width="4" height="60" fill="black" />
                    <rect x="92" y="0" width="2" height="60" fill="black" />
                    <rect x="96" y="0" width="6" height="60" fill="black" />
                    <rect x="104" y="0" width="4" height="60" fill="black" />
                    <rect x="110" y="0" width="2" height="60" fill="black" />
                    <rect x="114" y="0" width="6" height="60" fill="black" />
                    <rect x="122" y="0" width="2" height="60" fill="black" />
                    <rect x="126" y="0" width="4" height="60" fill="black" />
                    <rect x="132" y="0" width="2" height="60" fill="black" />
                    <rect x="136" y="0" width="6" height="60" fill="black" />
                    <rect x="144" y="0" width="4" height="60" fill="black" />
                    <rect x="150" y="0" width="2" height="60" fill="black" />
                    <rect x="154" y="0" width="6" height="60" fill="black" />
                    <rect x="162" y="0" width="2" height="60" fill="black" />
                    <rect x="166" y="0" width="4" height="60" fill="black" />
                    <rect x="172" y="0" width="6" height="60" fill="black" />
                    <rect x="180" y="0" width="2" height="60" fill="black" />
                    <rect x="184" y="0" width="4" height="60" fill="black" />
                </svg>
                <p className="text-xs font-bold text-black">
                    #{order?._id || "00000000"}
                </p>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 border-y-2 border-dashed border-gray-400 py-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">العميل:</span>
                    <span className="text-black font-medium">
                        {order?.customer?.name || "عميل"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="text-black font-medium" dir="ltr">
                        {order?.customer?.phone || "N/A"}
                    </span>
                </div>
                {order?.customer?.address && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">العنوان:</span>
                        <span className="text-black font-medium text-right max-w-[60%]">
                            {order?.customer?.address}
                        </span>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="space-y-2 py-2">
                <p className="font-bold text-black text-center mb-2">المنتجات</p>
                {order?.items?.map((item, index) => (
                    <div
                        key={item._id || index}
                        className="flex justify-between items-start py-1 border-b border-gray-200"
                    >
                        <div className="flex-1">
                            <p className="text-black font-medium">
                                {item?.product?.name || "منتج"}
                            </p>
                            {!isGift && (
                                <p className="text-xs text-gray-500">
                                    {item?.quantity} × {formatCurrency(item?.price)} EGP
                                </p>
                            )}
                            {isGift && (
                                <p className="text-xs text-gray-500">الكمية: {item?.quantity}</p>
                            )}
                        </div>
                        {!isGift && (
                            <span className="text-black font-bold">
                                {formatCurrency(item?.quantity * item?.price)} EGP
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Totals - Only for regular receipt */}
            {!isGift && (
                <div className="space-y-2 border-t-2 border-dashed border-gray-400 pt-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">المجموع الفرعي:</span>
                        <span className="text-black font-medium">
                            {formatCurrency(order?.subtotal)} EGP
                        </span>
                    </div>

                    {calculateDiscount(order) > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                الخصم {order?.discount?.type === "percentage" && `(${order?.discount?.value}%)`}:
                            </span>
                            <span className="text-red-600 font-medium">
                                -{formatCurrency(calculateDiscount(order))} EGP
                            </span>
                        </div>
                    )}

                    {order?.shipping > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">الشحن:</span>
                            <span className="text-black font-medium">
                                {formatCurrency(order?.shipping)} EGP
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-gray-400">
                        <span className="text-black">الإجمالي:</span>
                        <span className="text-black">
                            {formatCurrency(order?.total)} EGP
                        </span>
                    </div>
                </div>
            )}

            {/* Order Status */}
            {/* <div className="text-center border-t-2 border-dashed border-gray-400 pt-3">
                <p className="text-xs text-gray-500">
                    حالة الطلب:{" "}
                    <span
                        className={`font-bold ${order?.status === "completed"
                                ? "text-green-600"
                                : order?.status === "cancelled"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                            }`}
                    >
                        {order?.status === "completed"
                            ? "مكتمل"
                            : order?.status === "cancelled"
                                ? "ملغي"
                                : "معلق"}
                    </span>
                </p>
            </div> */}

            {/* Footer */}
            <div className="text-center pt-2">
                <p className="text-xs text-gray-500">شكراً لزيارتكم!</p>
                <p className="text-xs text-gray-400 mt-1">نتمنى لكم يوماً سعيداً</p>
            </div>
        </div>
    );
};

const OrderReceiptDialog = ({ isOpen, onClose, orderData, autoPrint = false }) => {
    const [activeTab, setActiveTab] = useState("receipt");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = Cookies.get("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Auto-print effect
    useEffect(() => {
        if (isOpen && autoPrint && orderData) {
            // Wait a bit for the dialog to render, then trigger print
            const timer = setTimeout(() => {
                handlePrint();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoPrint, orderData]);
    const handlePrint = () => {
        const printContent = document.getElementById("receipt-content");
        if (printContent) {
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>فاتورة الطلب</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px;
                  font-family: 'Arial', sans-serif;
                }
                 @media print {
                  body { margin: 0; padding: 10px; }
                  /* 80mm is the most common POS receipt paper size */
                  @page { 
                    size: 80mm auto; /* 80mm width, auto height for continuous paper */
                    margin: 0; 
                  }
                  /* Alternative sizes - uncomment the one you need:
                  @page { size: 58mm auto; margin: 0; } // For 58mm paper
                  @page { size: 57mm auto; margin: 0; } // For 57mm paper
                  */
                }
                /* Copy Tailwind styles inline */
                .mx-auto { margin-left: auto; margin-right: auto; }
                .w-full { width: 100%; }
                .max-w-\\[400px\\] { max-width: 400px; }
                .space-y-3 > * + * { margin-top: 0.75rem; }
                .rounded-lg { border-radius: 0.5rem; }
                .border-2 { border-width: 2px; }
                .border-dashed { border-style: dashed; }
                .border-gray-400 { border-color: #9ca3af; }
                .border-black { border-color: #000; }
                .p-6 { padding: 1.5rem; }
                .text-gray-700 { color: #374151; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-400 { color: #9ca3af; }
                .text-black { color: #000; }
                .text-red-600 { color: #dc2626; }
                .text-green-600 { color: #16a34a; }
                .text-yellow-600 { color: #ca8a04; }
                .font-mono { font-family: monospace; }
                .font-bold { font-weight: 700; }
                .font-medium { font-weight: 500; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .text-base { font-size: 1rem; }
                .text-lg { font-size: 1.125rem; }
                .text-xl { font-size: 1.25rem; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .pb-3 { padding-bottom: 0.75rem; }
                .pt-2 { padding-top: 0.5rem; }
                .pt-3 { padding-top: 0.75rem; }
                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
                .mt-1 { margin-top: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .items-center { align-items: center; }
                .items-start { align-items: flex-start; }
                .relative { position: relative; }
                .absolute { position: absolute; }
                .bg-white { background-color: #fff; }
                .px-4 { padding-left: 1rem; padding-right: 1rem; }
                .border-b { border-bottom-width: 1px; }
                .border-t-2 { border-top-width: 2px; }
                .border-b-2 { border-bottom-width: 2px; }
                .border-y-2 { border-top-width: 2px; border-bottom-width: 2px; }
                .border-gray-200 { border-color: #e5e7eb; }
                .flex-1 { flex: 1; }
                .max-w-\\[60\\%\\] { max-width: 60%; }
                .-top-3\\.5 { top: -0.875rem; }
                .left-1\\/2 { left: 50%; }
                .-translate-x-1\\/2 { transform: translateX(-50%); }
              </style>
            </head>
            <body dir="rtl">
              ${printContent.innerHTML}
            </body>
          </html>
        `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
    };

    if (!orderData) return null;

    return (
        <Modal
            bgWhite
            open={isOpen}
            setOpen={onClose}
        >
            <div className="max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">فاتورة الطلب</h2>
                    {/* <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button> */}
                </div>

                {/* Tab Switcher */}
                <div className="w-full mb-4">
                    <div className="mx-auto flex items-center justify-center rounded-lg bg-gray-200 p-1 font-medium">
                        <button
                            onClick={() => setActiveTab("receipt")}
                            className={`${activeTab === "receipt"
                                ? "rounded-lg bg-white shadow-md"
                                : "text-gray-600"
                                } w-1/2 cursor-pointer p-2 py-3 text-center transition-all`}
                        >
                            فاتورة كاملة
                        </button>
                        <button
                            onClick={() => setActiveTab("gift")}
                            className={`${activeTab === "gift"
                                ? "rounded-lg bg-white shadow-md"
                                : "text-gray-600"
                                } w-1/2 cursor-pointer p-2 py-3 text-center transition-all`}
                        >
                            فاتورة هدية
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div id="receipt-content">
                    <OrderReceipt user={user} order={orderData} isGift={activeTab === "gift"} />
                </div>

                {/* Print Button */}
                <div className="mt-6">
                    <Button
                        large
                        onClick={handlePrint}
                        label={
                            <span className="flex items-center justify-center gap-2">
                                <Printer size={18} />
                                {activeTab === "receipt" ? "طباعة الفاتورة" : "طباعة فاتورة الهدية"}
                            </span>
                        }
                        variant="filled"
                        rounded="xl"
                        fixedPadding="3"
                        className="w-full"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default OrderReceiptDialog;