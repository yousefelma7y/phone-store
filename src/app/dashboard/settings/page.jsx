"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Store,
  MapPin,
  Phone,
  Lock,
  Camera,
  Save,
  X,
  Check,
  AlertCircle,
  PencilIcon,
} from "lucide-react";
import Title from "../../../components/Title";
import Button from "../../../components/Button";

export default function SettingsPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [logoPreview, setLogoPreview] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    brandName: "",
    location: "",
    phone: "",
    logo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="));

      if (userCookie) {
        const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        const response = await fetch(`/api/users/${user._id}`);
        const result = await response.json();

        if (result.success) {
          setUserData(result.data);
          setFormData({
            userName: result.data.userName,
            brandName: result.data.brandName,
            location: result.data.location,
            phone: result.data.phone,
            logo: result.data.logo || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setLogoPreview(result.data.logo || "");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showMessage("error", "فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage("error", "حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSubmit = async () => {
    if (formData.newPassword) {
      // if (formData.newPassword.length < 6) {
      //   showMessage("error", "كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل");
      //   return;
      // }
      if (formData.newPassword !== formData.confirmPassword) {
        showMessage("error", "كلمة السر الجديدة غير متطابقة");
        return;
      }
      if (!formData.currentPassword) {
        showMessage("error", "يرجى إدخال كلمة السر الحالية");
        return;
      }
    }

    try {
      setSaving(true);

      const updateData = {
        userName: formData.userName,
        brandName: formData.brandName,
        location: formData.location,
        phone: formData.phone,
        logo: formData.logo,
        logo: "",
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const response = await fetch(`/api/users/${userData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        const updatedUser = { ...userData, ...updateData };
        delete updatedUser.password;
        document.cookie = `user=${JSON.stringify(
          updatedUser
        )}; path=/; max-age=604800`;

        setUserData(result.data);
        setEditing(false);
        showMessage("success", "تم تحديث البيانات بنجاح");

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        showMessage("error", result.message || "فشل في تحديث البيانات");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage("error", "حدث خطأ أثناء التحديث");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    if (userData) {
      setFormData({
        userName: userData.userName,
        brandName: userData.brandName,
        location: userData.location,
        phone: userData.phone,
        logo: userData.logo || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLogoPreview(userData.logo || "");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-blue-600 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="" dir="rtl">
      {/* العنوان */}
      <Title
        button={
          <Button
            Icon={PencilIcon}
            onClick={() => setEditing(true)}
            label={"تعديل"}
            variant="filled"
            type="submit"
            rounded="xl"
            fixedPadding="3"
          />
        }
        settings
        title="الإعدادات"
        subTitle="إدارة معلومات الحساب والمتجر"
      />

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="flex-shrink-0 w-5 h-5" />
          ) : (
            <AlertCircle className="flex-shrink-0 w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white m-4 md:m-6 lg:m-8 p-6 rounded-xl">
        <div className="flex items-center gap-6 mb-6 pb-6 border-gray-100 border-b">
          <div className="relative">
            <div className="flex justify-center items-center bg-gray-100 rounded-full w-24 h-24 overflow-hidden">
              {/* {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-12 h-12 text-gray-400" />
                )} */}
              <img
                src="/logo.jpg"
                alt="Elz3lan logo"
                className={`rounded-full h-full w-full object-cover`}
              />
            </div>
            {/* {editing && (
                <label className="right-0 bottom-0 absolute bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white transition-colors cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )} */}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-lg">
              {userData?.brandName}
            </h3>
            <p className="text-gray-500 text-sm">شعار المتجر</p>
          </div>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              <User className="inline ml-2 w-4 h-4" />
              اسم المستخدم
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              disabled={!editing}
              className="disabled:bg-gray-50 px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              <Store className="inline ml-2 w-4 h-4" />
              اسم المتجر
            </label>
            <input
              type="text"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              disabled={!editing}
              className="disabled:bg-gray-50 px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              <MapPin className="inline ml-2 w-4 h-4" />
              الموقع
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!editing}
              className="disabled:bg-gray-50 px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              <Phone className="inline ml-2 w-4 h-4" />
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editing}
              className="disabled:bg-gray-50 px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {editing && (
        <div className="bg-white shadow-sm m-4 md:m-6 lg:m-8 p-6 border border-gray-100 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900 text-xl">
              تغيير كلمة السر
            </h2>
          </div>
          <p className="mb-4 text-gray-600 text-sm">
            اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة السر
          </p>

          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                كلمة السر الحالية
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                كلمة السر الجديدة
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                تأكيد كلمة السر
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="flex justify-center gap-4 m-8">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </>
            )}
          </button>
          <button
            onClick={cancelEdit}
            disabled={saving}
            className="flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            إلغاء
          </button>
        </div>
      )}
    </div>
  );
}
