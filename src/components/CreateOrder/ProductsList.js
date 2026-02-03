import React from "react";
import { ShoppingBag, Search } from "lucide-react";
import Button from "../Button";
import NoData from "../NoData";

const ProductsList = ({
    setProductSearch,
    productSearch,
    productsLoading = true,
    products = [],
    addToCart,
    cart = []
}) => {

    return (
        <div className="space-y-4 lg:col-span-2 bg-white shadow-sm p-6 rounded-xl">
            {/* Header and Search */}
            <div className="md:flex md:justify-between md:items-center md:space-x-4 space-y-2 md:space-y-0 w-full">
                <div className="flex justify-start items-center space-x-3 w-full md:w-1/2">
                    <ShoppingBag className="text-green-500" />
                    <h1 className="w-fit font-bold text-gray-900 text-2xl">جميع المنتجات</h1>
                </div>
                <div className="relative w-full md:w-1/3">
                    <Search className="top-1/2 left-2 absolute text-gray-500 -translate-y-1/2" />
                    <input
                        type="search"
                        placeholder="أبحث عن المنتج ..."
                        className="p-3 !pl-10 border-2 border-gray-200 rounded-2xl w-full"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Products or Skeleton */}
            {productsLoading ? (
                // 🟢 Skeleton Loading
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg animate-pulse space-y-4"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="flex justify-between items-start">
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                            <div className="flex space-x-2 items-center">
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-full mt-3" />
                        </div>
                    ))}
                </div>
            ) : products && products.length > 0 ? (
                // 🟢 Product Cards
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className={`p-4 ${product.stock == 0
                                ? "border border-red-200 hover:border-red-400"
                                : "border border-gray-200 hover:border-indigo-300"
                                } rounded-lg transition`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900 capitalize">
                                    {product.name}
                                </h3>

                            </div>
                            <div className="flex justify-start items-center space-x-1 text-lg font-semibold">
                                <p className=" text-green-600 text-sm">سعر البيع :</p>
                                <p className=" text-green-600 ">{product.salePrice}ج</p>
                            </div>
                            <div className="flex justify-start items-center space-x-1 text-lg font-semibold">
                                <p className=" text-red-600 text-sm">السعر الأصلي :</p>
                                <p className=" text-red-600 ">{product.regularPrice}ج</p>
                            </div>
                            <div className="flex justify-start items-center space-x-1">
                                <p className="mb-3 text-gray-600 text-sm">متاح :</p>
                                <p className="mb-3 text-gray-600 text-sm">{product.stock}</p>
                                <p className="mb-3 text-gray-600 text-sm">قطعة</p>
                            </div>
                            <div className="flex justify-start items-center space-x-1">
                                <p className="mb-3 text-gray-600 text-sm">اللون :</p>
                                <p className="mb-3 text-gray-600 text-sm">{product.color}</p>
                            </div>
                            <div className="flex justify-start items-center space-x-1">
                                <p className="mb-3 text-gray-600 text-sm">المقاس :</p>
                                <p className="mb-3 text-gray-600 text-sm">{product.size}</p>
                            </div>

                            <Button
                                large
                                disabled={product.stock === 0 || product?.stock == cart?.find((item) => item._id === product._id)?.quantity}
                                onClick={() => addToCart(product)}
                                color={product.stock === 0 ? "danger" : "babyBlue"}
                                label={"أضف للطلب"}
                                rounded={"lg"}
                                variant="filled"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                // 🟢 No Data
                <div>
                    <NoData data="منتجات" />
                </div>
            )}
        </div>
    );
};

export default ProductsList;
