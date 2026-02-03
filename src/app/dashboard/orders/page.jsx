"use client";
import { useEffect, useState } from "react";
import { Edit, QrCode, XCircleIcon } from "lucide-react";
import * as Yup from "yup";

import { PlusIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/Button";
import ContentTable from "../../../components/contentTable";
import Modal from "../../../components/Modal";
import DeleteModal from "../../../components/DeleteModal";
import Title from "../../../components/Title";
import QRCode from "qrcode";
import axiosClient from "../../../lib/axios-client";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Message from "../../../components/Message";
import { NumericFormat } from "react-number-format";
import { useDebounce } from "use-debounce";
import FiltersCombonent from "../../../components/FiltersCombonent";
import EditOrderModal from "../../../components/Order/EditOrderModal";
import OrderReceiptDialog from "../../../components/Order/OrderReceiptDialog";

const statuses = [
  {
    _id: "completed",
    name: "ناجح",
  },
  {
    _id: "pending",
    name: "معلق",
  },
  {
    _id: "cancelled",
    name: "ألغي",
  },
];

export default function OrdersPage() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrImage, setQrImage] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchValue] = useDebounce(search, 1000);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [refetsh, setRefetsh] = useState(true);
  const [message, setMessage] = useState(false);

  // get products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosClient.get("/products");
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // /////
  useEffect(() => {
    setPage(1);
    setRefetsh(!refetsh);
  }, [limit, searchValue, status, startDate, endDate]);

  // Clear date range handler
  const handleClearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: page,
          limit: limit,
          status: status,
          search: searchValue,
          startDate: startDate,
          endDate: endDate,
        };
        setIsLoading(true);
        const { data } = await axiosClient.get(`/orders`, { params });
     
        setOrders(data.data);
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

  // open edit modal
  const handleEdit = (order) => {
  
    setEditingOrder(order);
    setShowModal(true);
  };
  // submit edit
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoadingBtn(true);

      // Prepare the order data in the format expected by the backend
      const orderData = {
        items: values.items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        discount: {
          value: Number(values.discount),
          type: values.discountType,
        },
        shipping: Number(values.shipping),
        status: values.status,
      };

      // Make the API call to update the order
      const { data } = await axiosClient.put(
        `/orders/${editingOrder._id}`, // Fixed: Changed from /products/ to /orders/
        orderData
      );


      setMessage({
        type: "success",
        message: data.message || "تم تحديث الطلب بنجاح",
      });

      // Reset form and close modal
      resetForm();
      setEditingOrder(null);
      setShowModal(false);

      // Refresh the orders list
      setRefetsh(!refetsh);
    } catch (error) {
      console.error("Error updating order:", error);

      if (error.response) {
        // Server responded with error
        setMessage({
          type: "error",
          message: error.response.data.message || "حدث خطأ أثناء تحديث الطلب",
        });
      } else if (error.request) {
        // Request was made but no response
        setMessage({
          type: "error",
          message: "لا يوجد اتصال بالخادم",
        });
      } else {
        // Something else happened
        setMessage({
          type: "error",
          message: error.message || "حدث خطأ غير متوقع",
        });
      }
    } finally {
      setLoadingBtn(false);
      setSubmitting(false);
    }
  };
  // submit delete
  const handleDelete = async (_id) => {
 
    // Handle delete logic here
    try {
      const params = {
        status: "cancelled",
      };
      setLoadingBtn(true);
      const { data } = await axiosClient.put(`/orders/${deleteModal}`, params);

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

  // Handle showing receipt
  const handleShowReceipt = async (order) => {
    try {
      // Fetch full order details with populated fields
      const { data } = await axiosClient.get(`/orders/${order._id}`);
      setSelectedOrder(data.data);
      setShowReceiptDialog(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setMessage({
        type: "error",
        message: "حدث خطأ أثناء تحميل تفاصيل الطلب",
      });
    }
  };

  // Handle close receipt dialog
  const handleCloseReceiptDialog = () => {
    setShowReceiptDialog(false);
    setSelectedOrder(null);
  };
  const generateQR = async (order) => {
    const qrData = order._id.toString();
    const qrCode = await QRCode.toDataURL(qrData);
    setQrImage(qrCode);
  };

  return (
    <div className="" dir="rtl">
      <Message message={message} setMessage={setMessage} />

      {/*QR code modal*/}
      <Modal
        bgWhite
        open={showQRModal}
        setOpen={(val) => {
          if (!val) setShowQRModal(null);
        }}
      >
        <h2 className="mb-4 font-bold text-gray-900 text-xl">كود الطلب</h2>
        {qrImage ? (
          <img src={qrImage} alt="QR Code" className="mx-auto mb-6" />
        ) : (
          <p className="mb-6 text-gray-500 text-center">لا يوجد كود QR لعرضه</p>
        )}
        <div>
          <Button
            onClick={() => {
              setShowQRModal(false);
              setQrImage(null);
            }}
            label={"إغلاق"}
            variant="filled"
            type="submit"
            rounded="xl"
            fixedPadding="3"
            color="danger"
          />
        </div>
      </Modal>

      {/*edit and add order modal */}
      <EditOrderModal
        loadingBtn={loadingBtn}
        showModal={showModal}
        setShowModal={setShowModal}
        editingOrder={editingOrder}
        handleSubmit={handleSubmit}
        setEditingOrder={setEditingOrder}
        products={products}
      />
      {/* Receipt Dialog */}
      <OrderReceiptDialog
        isOpen={showReceiptDialog}
        onClose={handleCloseReceiptDialog}
        orderData={selectedOrder}
      />

      <DeleteModal
        deleteReqModal={deleteModal}
        setDeleteReqModal={setDeleteModal}
        name="الطلب"
        deleteHandler={handleDelete}
        OrdersPage
        isLoading={loadingBtn}
      />

      {/* العنوان */}
      <Title
        title="الطلبات"
        count={orders?.length}
        subTitle="إدارة جميع طلبات المتجر"
        button={
          <Button
            Icon={PlusIcon}
            onClick={() => {
              window.location.href = "/dashboard/create-order";
            }}
            label={"إضافة طلب"}
            variant="filled"
            type="submit"
            rounded="xl"
            fixedPadding="3"
          />
        }
      />

      {/* Filters */}
      <FiltersCombonent
        placeholder="أبحث برقم العميل او رقم الطلب ..."
        searchField
        search={search}
        setSearch={setSearch}
        dateRange
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClearDateRange={handleClearDateRange}
        comboBoxes={[
          {
            placeholder: "حالة الطلب",
            value: status,
            onChange: setStatus,
            items: statuses,
          },
        ]}
      />

      {/* جدول المنتجات */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="">
          <ContentTable
            data={orders.map((order) => {
              return {
                _id: order?._id,
                name: order?.customer?.name,
                itemsQty: order?.items?.reduce(
                  (acc, curr) => acc + curr?.quantity,
                  0
                ),
                total: (
                  <div className="flex justify-center items-center space-x-2">
                    <span
                      className={`font-semibold ${
                        order?.total > 0 && "text-green-600"
                      }`}
                    >
                      <NumericFormat
                        dir="ltr"
                        value={order?.total}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </span>
                    {order?.subtotal > 0 && order?.subtotal != order?.total && (
                      <span
                        className={`font-semibold text-red-600 line-through`}
                      >
                        (
                        <NumericFormat
                          dir="ltr"
                          value={order?.subtotal}
                          displayType={"text"}
                          thousandSeparator={true}
                        />
                        )
                      </span>
                    )}
                  </div>
                ),
                discount: (
                  <span>
                    {order?.discount?.value}{" "}
                    {order?.discount?.type == "percentage" ? "%" : "EGP"}
                  </span>
                ),
                shipping:
                  (
                    <span
                      className={`font-semibold ${
                        order?.shipping > 0 && "text-orange-600"
                      }`}
                    >
                      <NumericFormat
                        dir="ltr"
                        value={order?.shipping}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </span>
                  ) || 0,
                status: (
                  <span
                    className={`md:text-white md:p-2 md:px-4 rounded-xl ${
                      order?.status == "completed"
                        ? "md:bg-green-600 text-green-500"
                        : order?.status == "pending"
                        ? "md:bg-yellow-500 text-yellow-500"
                        : "md:bg-red-500 text-red-500"
                    }`}
                  >
                    {order?.status == "completed"
                      ? "ناجح"
                      : order?.status == "pending"
                      ? "معلق"
                      : order?.status == "cancelled"
                      ? "ألغي"
                      : "-"}
                  </span>
                ),
                date: order?.createdAt.split("T", 1),
                statusValue: order?.status,
              };
            })}
            nodata="طلبات"
            actions={[
              {
                label: "كود",
                Icon: QrCode,
                action: (order) => {
                  handleShowReceipt(order);
                },
                props: {
                  variant: "filled",
                  rounded: "2xl",
                },
              },
              {
                label: "تعديل",
                Icon: Edit,
                action: (order) => {
                  // Find the full order object from the orders array
                  const fullOrder = orders.find((o) => o._id === order._id);
                  handleEdit(fullOrder);
                },
                props: {
                  color: "babyBlue",
                  variant: "filled",
                  rounded: "2xl",
                },
              },
              {
                label: "حذف",
                Icon: XCircleIcon,
                action: (order) => {
                  setDeleteModal(order?._id);
                },
                props: {
                  color: "danger",
                  variant: "filled",
                  rounded: "2xl",
                },
              },
            ]}
            ignore={["statusValue"]}
            header={[
              "ID",
              "إسم العميل",
              "عدد القطع",
              "الإجمالي",
              "الخصم",
              "التوصيل",
              "الحالة",
              "تاريخ الطلب",
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
