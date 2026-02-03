"use client";
import React, { useEffect, useState } from "react";
import NoData from "./NoData";
import { NumericFormat } from "react-number-format";
import Button from "./Button";
import Pagination from "./Pagination";
import { XCircleIcon, Clock, AlertCircle, CheckCircle, TrendingUp, Calendar, User, Zap } from "lucide-react";

const ContentTable = ({
  data,
  header,
  ignore,
  id,
  actions = [],
  actionsLoading = false,
  nodata,
  Nolinks = false,
  navigation = [],
  onNavigateChange = () => { },
  withBtn = false,
  btnProps = [],
  checkbox = false,
  onCheck = () => { },
  onAllCheck = () => { },
  problems = false,
  noLinks = false,
  totalPages,
  setPage,
  setLimit,
  page,
  limit,
  smallSection = false,
}) => {
  const [navigateFilter, setNavigateFilter] = useState(
    navigation[0]?.value || ""
  );

  useEffect(() => {
    onNavigateChange(navigateFilter);
  }, [navigateFilter, onNavigateChange]);

  let cols = header.length;
  if (checkbox) cols += 1;
  if (actions.length > 0) cols += 1;

  // Utility Functions
  const formatDate = (dateString) => {
    try {
      const [day, month, year] = dateString.split('-');
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isDateExpired = (dateString) => {
    try {
      const [day, month, year] = dateString.split('-');
      const date = new Date(`${year}-${month}-${day}`);
      return date < new Date();
    } catch {
      return false;
    }
  };

  const daysUntilRenewal = (dateString) => {
    try {
      const [day, month, year] = dateString.split('-');
      const date = new Date(`${year}-${month}-${day}`);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const getIconForKey = (key) => {
    if (key.toLowerCase() === 'subscriptionprice') return TrendingUp;
    if (key.toLowerCase() === 'renewdate') return Calendar;
    if (key.toLowerCase() === 'name') return User;
    return Zap;
  };

  // Mobile Card Content Section - Modern Grid Design
  const MobileCardContent = ({ row, headerLabels, ignoreKeys }) => (
    <div className="px-2 py-2">
      <div className="space-y-2">
        {Object.keys(row)
          .filter((key) => !ignoreKeys?.includes(key) && key !== 'id' && key !== 'role')
          .map((key, idx) => {
            const headerLabel = headerLabels?.[idx] || key.replace(/([A-Z])/g, ' $1').trim();
            const isPrice = key.toLowerCase() === 'subscriptionprice';
            const isRenewal = key.toLowerCase() === 'renewdate';
            const IconComponent = getIconForKey(key);

            return (
              <div
                key={idx}
                className="group relative bg-gradient-to-r from-transparent to-gray-200 rounded-lg p-1 border border-gray-100 "
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                      {headerLabel}
                    </span>

                    {/* Value */}
                    {isPrice ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.floor(row['subscriptionPrice']).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">ج.م</span>
                      </div>
                    ) : isRenewal ? (
                      <div className="space-y-1.5">
                        <div className={`flex items-center gap-2 font-semibold text-sm ${isDateExpired(row['renewDate'])
                          ? 'text-red-600'
                          : 'text-emerald-600'
                          }`}>
                          {isDateExpired(row['renewDate']) ? (
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span>{formatDate(row['renewDate'])}</span>
                        </div>
                        {daysUntilRenewal(row['renewDate']) !== null && (
                          <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            <span>
                              {isDateExpired(row['renewDate'])
                                ? `منتهي منذ ${Math.abs(daysUntilRenewal(row['renewDate']))} يوم`
                                : daysUntilRenewal(row['renewDate']) === 0
                                  ? 'اليوم'
                                  : `${daysUntilRenewal(row['renewDate'])} يوم`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-900 font-medium text-sm block break-words">
                        {String(row[key])}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      {data?.length > 0 ? (
        <>
          {/* TABLE VIEW (for md and larger) */}
          <div
            dir="rtl"
            className={`hidden md:block w-full overflow-x-auto ${smallSection ? "" : "min-h-[70vh]"
              }`}
          >
            <table className="w-full text-gray-700 lg:text-md text-sm text-center rtl:text-center border-collapse">
              <thead className="text-sm lg:text-md text-black uppercase bg-gray-200 font-bold">
                <tr>
                  {checkbox && (
                    <th className="p-4 w-14">
                      <input
                        type="checkbox"
                        onChange={(e) => onAllCheck(e.target.checked)}
                      />
                    </th>
                  )}
                  {header.map((head) => (
                    <th key={head} className="px-6 py-4 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                  {actions.length > 0 && <th className="px-6 py-4"></th>}
                </tr>
              </thead>

              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className={`${new Date(
                      row["renewDate"]?.split("-").reverse().join("-")
                    ) < new Date()
                      ? "hover:bg-red-300 bg-red-200"
                      : "hover:bg-gray-50 bg-white"
                      } border-b border-gray-200 ${(row["statusValue"] == "cancelled" || row["stock"] == 0) && "!bg-red-100 hover:!bg-red-200"}`}
                  >
                    {checkbox && (
                      <td className="p-3 w-14">
                        <input
                          type="checkbox"
                          checked={row["readed"]}
                          onChange={(e) => onCheck(e.target.checked, row.id)}
                        />
                      </td>
                    )}
                    {id && (
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {row.id}
                      </td>
                    )}
                    {Object.keys(row)
                      .filter((key) => !ignore?.includes(key))
                      .map((key, idx) => (
                        <td
                          key={idx}
                          className="px-6 py-4 truncate max-w-[200px] whitespace-nowrap"
                        >
                          {key.toLowerCase() === "subscriptionprice" ? (
                            <NumericFormat
                              value={row["subscriptionPrice"]}
                              displayType={"text"}
                              thousandSeparator={true}
                              prefix={"ج "}
                            />
                          ) : key.toLowerCase() === "renewdate" ? (
                            <span
                              className={`font-semibold ${new Date(
                                row["renewDate"]?.split("-").reverse().join("-")
                              ) < new Date()
                                ? "text-red-600"
                                : "text-green-600"
                                }`}
                            >
                              {row["renewDate"]}
                            </span>
                          ) : (
                            <span className="font-medium text-gray-800">
                              {row[key]}
                            </span>
                          )}
                        </td>
                      ))}
                    {actions.length > 0 && (
                      <td>
                        {row["role"] != "admin" &&
                          <div className="flex justify-center items-center p-2 w-full h-full">
                            {actions.map((action, idx) => (
                              <div key={idx} className="ml-2">
                                <Button
                                  disabled={(row["statusValue"] == "cancelled" && action.Icon == XCircleIcon) ||
                                    actionsLoading ||
                                    (action.disabled && action.disabled(row.id))
                                  }
                                  color={action.color}
                                  Icon={action.Icon || null}
                                  label={action.label || null}
                                  onClick={() => action.action(row, idx)}
                                  {...action.props}
                                />
                              </div>
                            ))}
                          </div>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARD VIEW (for small screens) - UPGRADED WITH PREMIUM DESIGN */}
          <div className="md:hidden bg-gradient-to-br  min-h-screen p-3 space-y-3">
            {data.map((row, index) => {
              const isAdmin = row['role'] === 'admin';

              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-gray-300"
                >

                  {/* ============ ADMIN BADGE ============ */}
                  {isAdmin && (
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 px-4 py-2 flex justify-center">
                      <span className="inline-block px-8 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                        Admin
                      </span>
                    </div>
                  )}

                  {/* ============ ACTIONS SECTION ============ */}
                  {!isAdmin && actions.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-4 py-3 flex gap-2 justify-end flex-wrap">
                      {actions.map((action, idx) => {
                        const isDisabled = actionsLoading ||
                          (action.disabled && action.disabled(row.id)) ||
                          (row["statusValue"] === "cancelled" && action.Icon === XCircleIcon);

                        return (
                          <button
                            key={idx}
                            disabled={isDisabled}
                            onClick={() => action.action(row, idx)}
                            className={`
                              inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                              transition-all duration-200 relative overflow-hidden
                              ${action.color === 'danger' || action.color === 'red'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300'
                                : action.color === 'success' || action.color === 'green'
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:border-green-300'
                                  : action.color === 'warning' || action.color === 'yellow'
                                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-300'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 hover:border-blue-300'
                              }
                              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                            `}
                            {...(action.props || {})}
                          >
                            {action.Icon && <action.Icon className="w-4 h-4" />}
                            <span>{action.label || 'Action'}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ============ CONTENT SECTION (MODERN GRID DESIGN) ============ */}
                  <MobileCardContent
                    row={row}
                    headerLabels={header}
                    ignoreKeys={ignore}
                  />



                </div>
              );
            })}
          </div>

          {!smallSection && totalPages > 1 && (
            <Pagination
              currentPage={page}
              limit={limit}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => setLimit(l)}
            />
          )}
        </>
      ) : (
        <div className="pt-20">
          <NoData data={nodata} />
        </div>
      )}
    </div>
  );
};

export default ContentTable;