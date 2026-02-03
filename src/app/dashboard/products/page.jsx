"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, QrCode, Barcode } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import Button from "../../../components/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import ContentTable from "../../../components/contentTable";
import Modal from "../../../components/Modal";
import Title from "../../../components/Title";
import DeleteModal from "../../../components/DeleteModal";
import JsBarcode from "jsbarcode";
import axiosClient from "../../../lib/axios-client";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Message from "../../../components/Message";
import CustomComboBox from "../../../components/ComboBox";
import FiltersCombonent from "../../../components/FiltersCombonent";
import { useDebounce } from "use-debounce";

// Validation Schema
const productValidationSchema = Yup.object().shape({
  name: Yup.string().required("مطلوب").min(3, "قصير"),
  color: Yup.string().required("مطلوب"),
  regularPrice: Yup.number().required("مطلوب").positive("رقم موجب"),
  wholesalePrice: Yup.number().required("مطلوب").positive("رقم موجب"),
  salePrice: Yup.number()
    .required("مطلوب")
    .positive("رقم موجب")
    .test("is-less-than-retail", "أقل من الأصلي", function (value) {
      const { retailPrice } = this.parent;
      return !value || !retailPrice || value <= retailPrice;
    }),
  stock: Yup.number().required("مطلوب").integer("عدد صحيح").min(0, "غير صالح"),
  brand: Yup.string().required("مطلوب"),
  category: Yup.string().required("مطلوب"),
});
// Initial form values
const initialFormValues = {
  name: "",
  color: "",
  regularPrice: "",
  salePrice: "",
  wholesalePrice: "",
  stock: "",
  brand: "",
  category: "",
};
export default function ProductsPage() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // filters
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchValue] = useDebounce(search, 1000);
  const [categoryId, setCategoryId] = useState(null);
  const [brandId, setBrandId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [refetsh, setRefetsh] = useState(true);
  const [message, setMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFiltersLoading(true);
        const { data } = await axiosClient.get(`/brands`);

        setBrands(data.data);
        const { data: data2 } = await axiosClient.get(`/categories`);

        setCategories(data2.data);
      } catch (error) {
        console.log(error);
        if (error.response) {
          setMessage({ type: "error", message: error.response.data.message });
        } else {
          setMessage({ type: "error", message: error.message });
        }
      } finally {
        setFiltersLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
    setRefetsh(!refetsh);
  }, [limit, searchValue, categoryId, brandId]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: page,
          limit: limit,
          search: searchValue,
          categoryId: categoryId,
          brandId: brandId,
        };
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, refetsh]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const productData = {
        ...values,
        regularPrice: Number(values.regularPrice),
        salePrice: Number(values.salePrice),
        stock: Number(values.stock),
      };
      if (editingProduct) {
        try {
          setLoadingBtn(true);
          const { data } = await axiosClient.put(
            `/products/${editingProduct._id}`,
            productData,
          );

          setMessage({ type: "success", message: data.message });
        } catch (error) {
          console.log(error);
          if (error.response) {
            setMessage({ type: "error", message: error.response.data.message });
          } else {
            setMessage({ type: "error", message: error.message });
          }
        } finally {
          setRefetsh(!refetsh);
          setLoadingBtn(false);
        }
      } else {
        try {
          setLoadingBtn(true);
          const { data } = await axiosClient.post(`/products`, productData);

          setMessage({ type: "success", message: data.message });
        } catch (error) {
          console.log(error);
          if (error.response) {
            setMessage({ type: "error", message: error.response.data.error });
          } else {
            setMessage({ type: "error", message: error.error });
          }
        } finally {
          setRefetsh(!refetsh);
          setLoadingBtn(false);
        }
      }

      resetForm();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error submitting product:", error);
      if (error.response) {
        setMessage({ type: "error", message: error.response.data.message });
      } else {
        setMessage({ type: "error", message: error.message });
      }
    } finally {
      setShowModal(false);
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoadingBtn(true);
      const { data } = await axiosClient.delete(`/products/${deleteModal}`);

      setMessage({ type: "success", message: data.message });
    } catch (error) {
      console.log(error);
      if (error.response) {
        setMessage({ type: "error", message: error.response.data.message });
      } else {
        setMessage({ type: "error", message: error.message });
      }
    } finally {
      setDeleteModal(false);
      setRefetsh(!refetsh);
      setLoadingBtn(false);
    }
  };

  const handlePrintBarcode = (product) => {
    // Create a high-resolution canvas for sharp barcode
    const canvas = document.createElement("canvas");

    // Use higher scale for sharper output
    JsBarcode(canvas, product.id.toString(), {
      format: "CODE128",
      width: 2,
      height: 50,
      displayValue: false,
      margin: 0,
      fontSize: 0,
    });

    const barcodeImage = canvas.toDataURL("image/png");

    // Create hidden iframe for isolated printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Print Label</title>
      <style>
        @page {
          size: 38mm 38mm;
          margin: 0;
        }

        @media print {
          html, body {
            width: 38mm;
            height: 38mm;
          }
          
          /* Remove headers and footers */
          @page {
            margin: 0;
          }
          
          body::before,
          body::after {
            display: none !important;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 38mm;
          height: 38mm;
          overflow: hidden;
        }

        body {
          padding: 1.5mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: Arial, sans-serif;
          background: white;
        }

        .product-name {
          font-size: 7pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1mm;
          max-width: 35mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .barcode-img {
          width: 35mm;
          height: auto;
          margin: 0.5mm 0;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .price-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5mm;
          font-size: 8pt;
          font-weight: bold;
          margin-top: 0.5mm;
        }

        .sale-price {
          font-size: 9pt;
          color: #000;
        }

        .retail-price {
          text-decoration: line-through;
          font-size: 7pt;
          color: #666;
        }

        .currency {
          font-size: 7pt;
        }

        @media print {
          html, body {
            width: 38mm;
            height: 38mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="product-name">${product.name}</div>
      <img src="${barcodeImage}" alt="Barcode" class="barcode-img" />
      <div class="price-section">
        <span class="sale-price">${product.salePrice}</span>
        ${
          product.regularPrice !== product.salePrice
            ? `<span class="retail-price">${product.regularPrice}</span>`
            : ""
        }
        <span class="currency">ج.م</span>
      </div>
    </body>
    </html>
  `);
    iframeDoc.close();

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Clean up after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  return (
    <div className="" dir="rtl">
      <Message message={message} setMessage={setMessage} />

      {/*edit and add product modal */}
      <Modal
        bgWhite
        open={showModal}
        setOpen={(val) => {
          if (!val) setShowModal(null);
        }}
      >
        <div>
          <div className="font-bold text-gray-900 text-2xl">
            {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          </div>
          <div className="text-gray-500">
            أدخل تفاصيل المنتج أدناه ثم اضغط حفظ.
          </div>
        </div>

        <Formik
          initialValues={
            editingProduct
              ? {
                  name: editingProduct.name,
                  color: editingProduct.color,
                  regularPrice: editingProduct.regularPrice,
                  salePrice: editingProduct.salePrice,
                  wholesalePrice: editingProduct.wholesalePrice,
                  stock: editingProduct.stock,
                  brand: {
                    id: editingProduct.brand?._id || "",
                    name: editingProduct.brand?.name || "",
                  },
                  category: {
                    id: editingProduct.category?._id || "",
                    name: editingProduct.category?.name || "",
                  },
                }
              : initialFormValues
          }
          validationSchema={productValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ setFieldValue, values, errors, touched, isSubmitting }) => (
            <Form className="space-y-4 mt-4 px-1 max-h-[70vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-medium text-gray-700 text-sm">
                    اسم المنتج *
                  </label>
                  {errors.name && touched.name && (
                    <div className="mt-1 text-red-500 text-sm">
                      {errors.name}
                    </div>
                  )}
                </div>

                <Field
                  type="text"
                  name="name"
                  className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>
              {/* brand and Category */}
              <div className="gap-4 grid grid-cols-2">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      الموديل *
                    </label>
                    {errors.brand && touched.brand && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.brand}
                      </div>
                    )}
                  </div>

                  <CustomComboBox
                    isLoading={isLoading}
                    error={errors.brand && touched.brand ? true : false}
                    onChange={(value) => setFieldValue("brand", value)}
                    byId
                    currentSelected={values.brand}
                    items={brands.map((brand) => {
                      return {
                        id: brand._id,
                        name: brand.name,
                      };
                    })}
                    placeholder="أختر الموديل"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      الصنف *
                    </label>
                    {errors.category && touched.category && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.category}
                      </div>
                    )}
                  </div>

                  <CustomComboBox
                    isLoading={isLoading}
                    error={errors.category && touched.category ? true : false}
                    onChange={(value) => setFieldValue("category", value)}
                    byId
                    currentSelected={values.category}
                    items={categories.map((category) => {
                      return {
                        id: category._id,
                        name: category.name,
                      };
                    })}
                    placeholder="أختر الصنف"
                  />
                </div>
              </div>
              {/* Size and Color */}
              <div className="gap-4 grid grid-cols-2">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      اللون *
                    </label>
                    {errors.color && touched.color && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.color}``
                      </div>
                    )}
                  </div>
                  <Field
                    type="text"
                    name="color"
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      الكمية (المخزون) *
                    </label>
                    {errors.stock && touched.stock && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.stock}
                      </div>
                    )}
                  </div>

                  <Field
                    type="number"
                    name="stock"
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="gap-4 grid grid-cols-2">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      السعر الأصلي *
                    </label>
                    {errors.regularPrice && touched.regularPrice && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.regularPrice}
                      </div>
                    )}
                  </div>

                  <Field
                    type="number"
                    name="regularPrice"
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      سعر البيع *
                    </label>
                    {errors.salePrice && touched.salePrice && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.salePrice}
                      </div>
                    )}
                  </div>

                  <Field
                    type="number"
                    name="salePrice"
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="gap-4 grid grid-cols-2">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700 text-sm">
                      سعر الجملة *
                    </label>
                    {errors.wholesalePrice && touched.wholesalePrice && (
                      <div className="mt-1 text-red-500 text-sm">
                        {errors.wholesalePrice}
                      </div>
                    )}
                  </div>
                  <Field
                    type="number"
                    name="wholesalePrice"
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                </div>
              </div>

              {/* Price Comparison Display */}
              {values.retailPrice && values.salePrice && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">السعر الأصلي:</span>
                    <span className="font-semibold text-red-600 line-through">
                      {values.regularPrice} جنيه
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-700">سعر البيع:</span>
                    <span className="font-semibold text-green-600">
                      {values.salePrice} جنيه
                    </span>
                  </div>
                  {values.regularPrice > values.salePrice && (
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-gray-700">الخصم:</span>
                      <span className="font-semibold text-blue-600">
                        {((values.regularPrice - values.salePrice) /
                          values.regularPrice) *
                          100}
                        %
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div dir="ltr" className="flex justify-between space-x-4 pt-4">
                <Button
                  large
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  label={"إلغاء"}
                  variant="filled"
                  rounded="xl"
                  fixedPadding="3"
                  color="danger"
                />
                <Button
                  large
                  label={editingProduct ? "تحديث" : "إضافة"}
                  isLoading={loadingBtn}
                  variant="filled"
                  type="submit"
                  rounded="xl"
                  fixedPadding="3"
                  disabled={loadingBtn}
                />
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <DeleteModal
        deleteReqModal={deleteModal}
        setDeleteReqModal={setDeleteModal}
        name="المنتج"
        deleteHandler={handleDelete}
        isLoading={loadingBtn}
      />

      {/* العنوان */}
      <Title
        count={products?.length}
        title="المنتجات"
        subTitle="إدارة جميع منتجات المتجر"
        button={
          <Button
            Icon={PlusIcon}
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            label={"إضافة منتج"}
            variant="filled"
            type="submit"
            rounded="xl"
            fixedPadding="3"
          />
        }
      />

      {/* Filters */}
      <FiltersCombonent
        placeholder={"أبحث بالإسم او بكود المنتج ..."}
        searchField
        search={search}
        setSearch={setSearch}
        comboboxsLoading={filtersLoading}
        comboBoxes={[
          {
            placeholder: "اختر الموديل",
            value: brandId,
            onChange: setBrandId,
            items: brands,
          },
          {
            placeholder: "أختر الفئة",
            value: categoryId,
            onChange: setCategoryId,
            items: categories,
          },
        ]}
      />

      {/* جدول المنتجات */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="">
          <ContentTable
            data={products.map((product) => {
              return {
                id: product._id,
                name: product.name,
                color: product.color,
                stock: product.stock || 0,
                price: (
                  <div className="flex justify-center items-center space-x-1">
                    <span className="font-semibold text-green-600">
                      {product.salePrice || 0}
                    </span>
                    <span className="font-semibold text-green-600">EGP</span>
                    <span className="font-semibold text-red-600 line-through">
                      ({product.regularPrice || 0})
                    </span>
                  </div>
                ),
                wholesalePrice: product.wholesalePrice || 0,
                category: product?.category?.name,
                modal: product?.brand?.name,
                salePrice: product?.salePrice || 0,
                regularPrice: product?.regularPrice || 0,
              };
            })}
            nodata="منتجات"
            actions={[
              {
                label: "كود",
                Icon: QrCode,
                action: (product) => handlePrintBarcode(product),
                props: {
                  variant: "filled",
                  rounded: "2xl",
                },
              },
              {
                label: "تعديل",
                Icon: Edit,
                action: (product) => {
                  // Find the full product object from the products array
                  const fullProduct = products.find(
                    (p) => p._id === product.id,
                  );
                  handleEdit(fullProduct);
                },
                props: {
                  color: "babyBlue",
                  variant: "filled",
                  rounded: "2xl",
                },
              },
              {
                label: "حذف",
                Icon: Trash2,
                action: (product) => {
                  setDeleteModal(product?.id);
                },
                props: {
                  color: "danger",
                  variant: "filled",
                  rounded: "2xl",
                },
              },
            ]}
            ignore={["regularPrice", "salePrice"]}
            header={[
              "id",
              "إسم المنتج",
              "اللون",
              "الكمية",
              "سعر البيع",
              "سعر الجملة",
              "الصنف",
              "الموديل",
            ]}
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            setLimit={setLimit}
            limit={limit}
          />
        </div>
      )}
    </div>
  );
}
