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

// Validation Schema
const categoryValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("اسم الصنف مطلوب")
    .min(3, "اسم الصنف يجب أن يكون 3 أحرف على الأقل")
    .max(100, "اسم الصنف يجب أن لا يتجاوز 100 حرف"),
});

// Initial form values
const initialFormValues = {
  name: "",
};

export default function Categories() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [refetsh, setRefetsh] = useState(true);
  const [message, setMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: page,
          limit: limit,
        };
        setIsLoading(true);
        const { data } = await axiosClient.get(`/categories`, { params });
      
        setCategories(data.data);
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
  }, [page, limit, refetsh]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setShowModal(false);
      const categoryData = {
        ...values,
        name: values.name.trim(),
      };

      if (editingCategory) {
        try {
          setLoadingBtn(true);
          const { data } = await axiosClient.put(
            `/categories/${editingCategory._id}`,
            categoryData
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
          const { data } = await axiosClient.post(`/categories`, categoryData);
         
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
      setEditingCategory(null);
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
   
    try {
      setLoadingBtn(true);
      const { data } = await axiosClient.delete(`/categories/${deleteModal}`);
  
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
      {/*edit and add category modal */}
      <Modal
        bgWhite
        open={showModal}
        setOpen={(val) => {
          if (!val) setShowModal(null);
        }}
      >
        <div>
          <div className="font-bold text-gray-900 text-2xl">
            {editingCategory ? "تعديل الصنف" : "إضافة صنف جديد"}
          </div>
          <div className="text-gray-500">
            أدخل تفاصيل الصنف أدناه ثم اضغط حفظ.
          </div>
        </div>

        <Formik
          initialValues={
            editingCategory
              ? {
                  name: editingCategory.name,
                }
              : initialFormValues
          }
          validationSchema={categoryValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="space-y-4 mt-4">
              {/* Brand Name */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-medium text-gray-700 text-sm">
                    اسم الصنف *
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
                  placeholder="مثال: جزمة"
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
                  label={editingCategory ? "تحديث" : "إضافة"}
                  variant="filled"
                  type="submit"
                  rounded="xl"
                  fixedPadding="3"
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <DeleteModal
        deleteReqModal={deleteModal}
        setDeleteReqModal={setDeleteModal}
        name="الأصناف"
        deleteHandler={handleDelete}
      />

      <Title
        count={categories?.length}
        title="الأصناف"
        subTitle="إدارة جميع أصناف المتجر"
        button={
          <Button
            Icon={PlusIcon}
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            label={"إضافة صنف"}
            variant="filled"
            type="submit"
            rounded="xl"
            fixedPadding="3"
          />
        }
      />

      {/* category Cards Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <SmallDataCard
          data={categories}
          handleEdit={handleEdit}
          setDeleteModal={setDeleteModal}
          nodata="أصناف"
          addItem={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}
