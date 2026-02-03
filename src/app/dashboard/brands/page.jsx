"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import Button from "../../../components/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../../../components/Modal";
import Title from "../../../components/Title";
import DeleteModal from "../../../components/DeleteModal";
import SmallDataCard from "../../../components/SmallDataCard";
import axiosClient from "../../../lib/axios-client";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Message from "../../../components/Message";
import { useDebounce } from "use-debounce";
import FiltersCombonent from "../../../components/FiltersCombonent";

// Validation Schema
const brandValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("اسم الموديل مطلوب")
    .min(2, "اسم الموديل يجب أن يكون 2 أحرف على الأقل")
    .max(100, "اسم الموديل يجب أن لا يتجاوز 100 حرف"),
});

// Initial form values
const initialFormValues = {
  name: "",
};

export default function Brands() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [refetsh, setRefetsh] = useState(true);
  const [message, setMessage] = useState(false);
  const [search, setSearch] = useState("");
  const [searchValue] = useDebounce(search, 1000);

  useEffect(() => {
    setPage(1);
    setRefetsh(!refetsh);
  }, [limit, searchValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: page,
          limit: limit,
          search: searchValue,
        };
        setIsLoading(true);
        const { data } = await axiosClient.get(`/brands`, { params });
  
        setBrands(data.data);
        // setTotalPages(data?.totalPages);
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
      setShowModal(false);
      const brandData = {
        ...values,
        name: values.name.trim(),
      };

      if (editingBrand) {
        try {
          setLoadingBtn(true);
          const { data } = await axiosClient.put(
            `/brands/${editingBrand._id}`,
            brandData
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
          const { data } = await axiosClient.post(`/brands`, brandData);
        
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
      }

      resetForm();
      setEditingBrand(null);
    } catch (error) {
      console.error("Error submitting brand:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setShowModal(true);
  };

  const handleDelete = async () => {
  
    try {
      setLoadingBtn(true);
      const { data } = await axiosClient.delete(`/brands/${deleteModal}`);

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

  return (
    <div className="" dir="rtl">
      <Message message={message} setMessage={setMessage} />

      {/*edit and add brand modal */}
      <Modal
        bgWhite
        open={showModal}
        setOpen={(val) => {
          if (!val) setShowModal(null);
        }}
      >
        <div>
          <div className="font-bold text-gray-900 text-2xl">
            {editingBrand ? "تعديل الموديل" : "إضافة موديل جديد"}
          </div>
          <div className="text-gray-500">
            أدخل تفاصيل الموديل أدناه ثم اضغط حفظ.
          </div>
        </div>

        <Formik
          initialValues={
            editingBrand
              ? {
                  name: editingBrand.name,
                }
              : initialFormValues
          }
          validationSchema={brandValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="space-y-4 mt-4">
              {/* Brand Name */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-medium text-gray-700 text-sm">
                    اسم الموديل *
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
                  placeholder="مثال: Nike Air Force"
                  className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>

              {/* Character Count */}
              <div className="text-gray-500 text-sm text-left">
                {values.name.length} / 100 حرف
              </div>

              <div dir="ltr" className="flex justify-between space-x-4 pt-4">
                <Button
                  large
                  onClick={() => {
                    setShowModal(false);
                    setEditingBrand(null);
                  }}
                  label={"إلغاء"}
                  variant="filled"
                  rounded="xl"
                  fixedPadding="3"
                  color="danger"
                />
                <Button
                  large
                  label={editingBrand ? "تحديث" : "إضافة"}
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
        name="الموديل"
        deleteHandler={handleDelete}
        isLoading={loadingBtn}
      />

      {/* العنوان */}
      <Title
        count={brands?.length}
        title="الموديلات"
        subTitle="إدارة جميع موديلات المتجر"
        button={
          <Button
            Icon={PlusIcon}
            onClick={() => {
              setEditingBrand(null);
              setShowModal(true);
            }}
            label={"إضافة موديل"}
            variant="filled"
            type="submit"
            rounded="xl"
            fixedPadding="3"
          />
        }
      />

      {/* Filters */}
      <FiltersCombonent
        placeholder={"إبحث بإسم الموديل ..."}
        searchField
        search={search}
        setSearch={setSearch}
      />

      {/* Loading State or Brand Cards Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <SmallDataCard
          data={brands}
          handleEdit={handleEdit}
          setDeleteModal={setDeleteModal}
          nodata="موديلات"
          addItem={() => {
            setEditingBrand(null);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}
