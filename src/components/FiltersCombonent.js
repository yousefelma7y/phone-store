import React, { useState } from "react";
import CustomComboBox from "./ComboBox";

const FiltersComponent = ({
    searchField = false,
    search = "",
    setSearch = () => { },
    placeholder = "Search...",
    comboboxsLoading = false,
    comboBoxes = [], // Array of ComboBox configs
    dateRange = false,
    startDate = "",
    endDate = "",
    setStartDate = () => { },
    setEndDate = () => { },
    onClearDateRange = () => { }
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getDateRangeText = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        } else if (startDate) {
            return `من ${formatDate(startDate)}`;
        } else if (endDate) {
            return `حتى ${formatDate(endDate)}`;
        }
        return "اختر الفترة الزمنية";
    };

    return (
        <div className="mb-2 mx-auto w-full grid grid-cols-8 gap-3 px-4">
            {searchField && (
                <input
                    placeholder={placeholder}
                    type="text"
                    className="bg-white border border-gray-100 rounded-2xl py-3 px-4 w-full col-span-8 md:col-span-4"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            )}

            {dateRange && (
                <div className="relative col-span-4 md:col-span-4 lg:col-span-2">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="bg-white border border-gray-100 rounded-2xl py-3 px-4 w-full flex items-center justify-between hover:border-gray-300 transition-colors"
                    >
                        <span className={startDate || endDate ? "text-gray-900" : "text-gray-400"}>
                            {getDateRangeText()}
                        </span>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {showDatePicker && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDatePicker(false)}
                            />
                            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-20 w-full">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            تاريخ البداية
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            تاريخ النهاية
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                onClearDateRange();
                                                setShowDatePicker(false);
                                            }}
                                            className="flex-1 cursor-pointer bg-red-400 hover:bg-red-500 text-white rounded-lg py-2 px-4 transition-colors"
                                        >
                                            مسح
                                        </button>
                                        {/* <button
                                            onClick={() => setShowDatePicker(false)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-4 transition-colors"
                                        >
                                            تطبيق
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {comboBoxes.map((combo, index) => (
                <div key={index} className="col-span-4 md:col-span-4 lg:col-span-2">
                    <CustomComboBox
                        onClear={() => combo.onChange(null)}
                        className="!border !border-gray-100 !rounded-2xl !py-3"
                        isLoading={comboboxsLoading}
                        onChange={(value) => combo.onChange(value)}
                        byId
                        currentSelected={combo.value}
                        items={combo.items?.map((item) => ({
                            id: item._id,
                            name: item.name,
                        }))}
                        placeholder={combo.placeholder}
                    />
                </div>
            ))}
        </div>
    );
};

export default FiltersComponent;