import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";

const EditOrderModal = ({
    showModal,
    setShowModal,
    editingOrder,
    handleSubmit,
    setEditingOrder,
    products = [], // Pass available products as prop
    loadingBtn = false
}) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (showModal) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [showModal]);

    return (
        <Modal
            bgWhite
            open={open}
            setOpen={(val) => {
                if (!val) setShowModal(null);
            }}
        >
            <div>
                <div className="font-bold text-gray-900 text-2xl">تعديل الطلب</div>
                <div className="text-gray-500">
                    قم بتعديل تفاصيل الطلب أدناه ثم اضغط حفظ.
                </div>
            </div>

            <Formik
                initialValues={{
                    items: editingOrder?.items?.map(item => ({
                        product: item.product?._id || item.product,
                        productName: item.product?.name || '',
                        quantity: item.quantity || 1,
                        price: item.price || 0,
                    })) || [],
                    discount: editingOrder?.discount?.value || 0,
                    discountType: editingOrder?.discount?.type || "percentage",
                    shipping: editingOrder?.shipping || 0,
                    status: editingOrder?.status || "pending",
                }}
                validationSchema={Yup.object({
                    items: Yup.array()
                        .of(
                            Yup.object({
                                product: Yup.string().required("المنتج مطلوب"),
                                quantity: Yup.number()
                                    .min(1, "الكمية يجب أن تكون 1 على الأقل")
                                    .required("الكمية مطلوبة"),
                                price: Yup.number()
                                    .min(0, "السعر يجب أن يكون صفر أو أكبر")
                                    .required("السعر مطلوب"),
                            })
                        )
                        .min(1, "يجب إضافة منتج واحد على الأقل"),
                    discount: Yup.number().min(0, "الخصم يجب أن يكون صفر أو أكبر"),
                    shipping: Yup.number().min(0, "الشحن يجب أن يكون صفر أو أكبر"),
                    status: Yup.string().required("حالة الطلب مطلوبة"),
                })}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, setFieldValue }) => {
                    // Calculate subtotal
                    const subtotal = values.items.reduce((sum, item) => {
                        return sum + (Number(item.price) * Number(item.quantity));
                    }, 0);

                    // Calculate discount amount
                    const discountAmount =
                        values.discountType === "percentage"
                            ? (subtotal * values.discount) / 100
                            : values.discount;

                    // Calculate total
                    const total = Math.max(0, subtotal - discountAmount + Number(values.shipping));

                    return (
                        <Form className="space-y-4 ">
                            <div className="space-y-4 mt-4 px-1 max-h-[75vh] overflow-y-auto">
                                {/* Read-only Customer Info */}
                                <div className="space-y-2 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                                    <h3 className="mb-3 font-semibold text-gray-900 text-lg">
                                        معلومات العميل
                                    </h3>
                                    <div className="gap-3 grid grid-cols-2">
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-600 text-xs">
                                                اسم العميل
                                            </label>
                                            <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700">
                                                {editingOrder?.customer?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-600 text-xs">
                                                رقم الهاتف
                                            </label>
                                            <div
                                                className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700"
                                                dir="ltr"
                                            >
                                                {editingOrder?.customer?.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Items Section */}
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    المنتجات
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        push({
                                                            product: "",
                                                            productName: "",
                                                            quantity: 1,
                                                            price: 0,
                                                        })
                                                    }
                                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-white text-sm transition-colors"
                                                >
                                                    <Plus size={16} />
                                                    إضافة منتج جديد
                                                </button>
                                            </div>

                                            {values.items.length === 0 ? (
                                                <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
                                                    <p className="text-gray-500">
                                                        لا توجد منتجات في هذا الطلب
                                                    </p>
                                                    <p className="mt-1 text-gray-400 text-sm">
                                                        اضغط على "إضافة منتج جديد" لإضافة منتج
                                                    </p>
                                                </div>
                                            ) : (
                                                values.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="space-y-3 bg-white p-4 border border-gray-200 rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-gray-700">
                                                                منتج {index + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                                <span className="text-sm">حذف</span>
                                                            </button>
                                                        </div>

                                                        <div className="gap-3 grid grid-cols-1">
                                                            {/* Product Selector */}
                                                            <div>
                                                                <label className="block mb-1 text-gray-700 text-sm font-medium">
                                                                    المنتج *
                                                                </label>
                                                                <Field
                                                                    as="select"
                                                                    name={`items.${index}.product`}
                                                                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                                                    onChange={(e) => {
                                                                        const selectedProduct = products.find(
                                                                            (p) => p._id === e.target.value
                                                                        );
                                                                        setFieldValue(`items.${index}.product`, e.target.value);
                                                                        if (selectedProduct) {
                                                                            setFieldValue(`items.${index}.productName`, selectedProduct.name);
                                                                            setFieldValue(`items.${index}.price`, selectedProduct.salePrice || 0);
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">اختر منتج</option>
                                                                    {products.map((product) => (
                                                                        <option key={product._id} value={product._id}>
                                                                            {product.name} - {product.salePrice} EGP
                                                                        </option>
                                                                    ))}
                                                                </Field>
                                                                {errors?.items?.[index]?.product && touched?.items?.[index]?.product && (
                                                                    <div className="mt-1 text-red-500 text-xs">
                                                                        {errors.items[index].product}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="gap-3 grid grid-cols-2">
                                                                {/* Quantity */}
                                                                <div>
                                                                    <label className="block mb-1 text-gray-700 text-sm font-medium">
                                                                        الكمية *
                                                                    </label>
                                                                    <Field
                                                                        type="number"
                                                                        name={`items.${index}.quantity`}
                                                                        min="1"
                                                                        className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                                                    />
                                                                    {errors?.items?.[index]?.quantity && touched?.items?.[index]?.quantity && (
                                                                        <div className="mt-1 text-red-500 text-xs">
                                                                            {errors.items[index].quantity}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Price */}
                                                                <div>
                                                                    <label className="block mb-1 text-gray-700 text-sm font-medium">
                                                                        سعر الوحدة *
                                                                    </label>
                                                                    <Field
                                                                        type="number"
                                                                        name={`items.${index}.price`}
                                                                        min="0"
                                                                        step="0.01"
                                                                        className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                                                    />
                                                                    {errors?.items?.[index]?.price && touched?.items?.[index]?.price && (
                                                                        <div className="mt-1 text-red-500 text-xs">
                                                                            {errors.items[index].price}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Item Total */}
                                                            <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                                                <span className="text-gray-600 text-sm">المجموع: </span>
                                                                <span className="font-medium text-gray-900">
                                                                    {(Number(item.price) * Number(item.quantity))} EGP
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {typeof errors.items === 'string' && (
                                                <div className="mt-2 text-red-500 text-sm">{errors.items}</div>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>

                                {/* Editable Order Details */}
                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                        تفاصيل الطلب
                                    </h3>

                                    <div className="gap-3 grid grid-cols-2">
                                        <div>
                                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                                الخصم
                                            </label>
                                            <Field
                                                type="number"
                                                name="discount"
                                                min="0"
                                                step="0.01"
                                                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                            />
                                            {errors.discount && touched.discount && (
                                                <div className="mt-1 text-red-500 text-xs">{errors.discount}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                                نوع الخصم
                                            </label>
                                            <Field
                                                as="select"
                                                name="discountType"
                                                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                            >
                                                <option value="percentage">نسبة مئوية (%)</option>
                                                <option value="fixed">مبلغ ثابت (EGP)</option>
                                            </Field>
                                        </div>

                                        <div>
                                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                                الشحن (EGP)
                                            </label>
                                            <Field
                                                type="number"
                                                name="shipping"
                                                min="0"
                                                step="0.01"
                                                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                            />
                                            {errors.shipping && touched.shipping && (
                                                <div className="mt-1 text-red-500 text-xs">{errors.shipping}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                                حالة الطلب *
                                            </label>
                                            <Field
                                                as="select"
                                                name="status"
                                                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                            >
                                                <option value="pending">معلق</option>
                                                <option value="completed">ناجح</option>
                                                <option value="cancelled">ملغي</option>
                                            </Field>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-white mt-4 p-4 border border-gray-200 rounded-lg">
                                        <h4 className="mb-3 font-semibold text-gray-900">
                                            ملخص الطلب
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">المجموع الفرعي:</span>
                                                <span className="font-medium">{subtotal} EGP</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">الخصم:</span>
                                                <span className="font-medium text-red-600">
                                                    -{discountAmount} EGP
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">الشحن:</span>
                                                <span className="font-medium">
                                                    +{Number(values.shipping)} EGP
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-gray-300 border-t">
                                                <span className="font-semibold text-gray-900">
                                                    الإجمالي:
                                                </span>
                                                <span className="font-bold text-indigo-600 text-lg">
                                                    {total} EGP
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">

                                <Button
                                    large
                                    label="حفظ التعديلات"
                                    variant="filled"
                                    type="submit"
                                    rounded="xl"
                                    fixedPadding="3"
                                    isLoading={loadingBtn}
                                />
                                <Button
                                    large
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingOrder(null);
                                    }}
                                    label={"إلغاء"}
                                    variant="filled"
                                    rounded="xl"
                                    fixedPadding="3"
                                    color="danger"
                                />
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};

export default EditOrderModal;