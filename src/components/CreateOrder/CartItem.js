import Button from "../Button";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { NumericFormat } from "react-number-format";

const CartItem = ({
    item,
    onQuantityIncrement,
    onQuantityDecrement,
    onPriceChange,
    onDelete,
}) => {
    // Get initial price - prioritize custom price, then sale price, then regular price
    const getInitialPrice = () => {
        if (item.price !== undefined && item.price !== null && item.price > 0) {
            return item.price;
        }
        if (item.salePrice > 0) {
            return item.salePrice;
        }
        return item.regularPrice || 0;
    };

    const [localPrice, setLocalPrice] = useState(getInitialPrice());
    const [priceError, setPriceError] = useState(false);

    // Update local price when item.price changes from parent
    useEffect(() => {
        if (item.price !== undefined && item.price !== null) {
            setLocalPrice(item.price);
            setPriceError(item.price <= 0);
        }
    }, [item.price]);

    const handlePriceChange = useCallback((e) => {
        const value = e.target.value;

        // Allow empty string for clearing
        if (value === "") {
            setLocalPrice("");
            setPriceError(true);
            return;
        }

        const numValue = parseFloat(value);

        // Update local state immediately for smooth UX
        setLocalPrice(value);

        // Check for valid price
        if (isNaN(numValue) || numValue < 0) {
            setPriceError(true);
        } else if (numValue === 0) {
            setPriceError(true);
            onPriceChange(item._id, 0);
        } else {
            setPriceError(false);
            onPriceChange(item._id, numValue);
        }
    }, [item._id, onPriceChange]);

    const handlePriceBlur = useCallback(() => {
        // On blur, if empty or invalid, reset to initial price
        if (localPrice === "" || isNaN(parseFloat(localPrice)) || parseFloat(localPrice) <= 0) {
            const initialPrice = getInitialPrice();
            setLocalPrice(initialPrice);
            onPriceChange(item._id, initialPrice);
            setPriceError(initialPrice <= 0);
        }
    }, [localPrice, item._id, onPriceChange]);

    // Calculate item total
    const itemTotal = (parseFloat(localPrice) || 0) * item.quantity;

    // Check if quantity is at limits
    const isAtMinQuantity = item.quantity <= 1;
    const isAtMaxQuantity = item.quantity >= (item.stock || 0);
    const isLowStock = item.stock && item.stock <= 5;

    return (
        <div className={`flex w-full gap-3 rounded-xl bg-gray-200 p-3 shadow-md border-2 transition-all hover:shadow-lg ${priceError ? 'border-red-300' : 'border-gray-100'
            }`}>
            {/* Left Section - Product Info */}
            <div className="flex flex-1 flex-col justify-between space-y-2">
                {/* Product Name */}
                <h1 className="line-clamp-2 font-bold text-gray-900 text-sm leading-tight capitalize">
                    {item.name}
                </h1>

                {/* Original price if there's a sale */}
                {item.salePrice > 0 && item.salePrice < item.regularPrice && (
                    <div className="flex items-center gap-2">
                        <NumericFormat
                            className="text-xs font-semibold line-through text-red-400"
                            displayType="text"
                            decimalScale={2}
                            value={item.regularPrice}
                            thousandSeparator
                            suffix=" EGP"
                        />
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                            خصم
                        </span>
                    </div>
                )}

                {/* Price input with validation */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="number"
                                className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-semibold focus:outline-none transition-all ${priceError
                                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50'
                                    : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                    }`}
                                value={localPrice}
                                onChange={handlePriceChange}
                                onBlur={handlePriceBlur}
                                min="0"
                                step="0.01"
                                placeholder="السعر"
                            />
                            {priceError && (
                                <AlertCircle className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500 size-4" />
                            )}
                        </div>
                        <span className="text-xs text-gray-700 font-bold whitespace-nowrap">
                            EGP
                        </span>
                    </div>
                    {priceError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            أدخل سعر صحيح
                        </p>
                    )}
                </div>

                {/* Item total */}
                <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">الإجمالي:</span>
                        <span className="text-sm font-bold text-green-700">
                            {itemTotal} EGP
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex flex-col justify-between items-end space-y-2 min-w-[90px]">
                {/* Quantity controls */}
                <div className="w-full">
                    <div className="flex items-center justify-center rounded-xl bg-green-50 border-2 border-green-200 px-2 py-1.5">
                        <Button
                            small
                            color="info"
                            disabled={isAtMinQuantity}
                            onClick={() => onQuantityDecrement(item._id)}
                            Icon={Minus} rounded={"full"}
                        />
                        <p className="flex-1 text-center font-bold text-green-800 text-base min-w-[30px]">
                            {item.quantity}
                        </p>

                        <Button
                            small
                            color="info"
                            disabled={isAtMaxQuantity}
                            onClick={() => onQuantityIncrement(item._id)}
                            Icon={Plus} rounded={"full"}
                        />
                    </div>
                </div>

                {/* Stock indicator */}
                {item.stock && (
                    <div className={`text-xs text-center px-2 py-1 rounded-lg font-semibold ${isLowStock
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                        متاح: {item.stock}
                    </div>
                )}

                {/* Delete button */}

                <Button
                    small
                    color="danger"
                    variant="filled"
                    disabled={isAtMaxQuantity}
                    onClick={() => {
                        onDelete(item._id);
                    }}
                    Icon={Trash2} rounded={"full"}
                />
            </div>
        </div >
    );
};

export default CartItem;