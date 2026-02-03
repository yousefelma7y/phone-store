"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GoSignIn } from "react-icons/go";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/20/solid";
import { usePathname } from "next/navigation";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  Cog8ToothIcon,
  CubeTransparentIcon,
  DocumentChartBarIcon,
  FolderPlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";

const Sidebar = ({ role }) => {
  const [active, setActive] = useState("dashboard");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);


  useEffect(() => {
    if (pathname == "/dashboard") {
      setActive("dashboard");
    } else {
      setActive(pathname.split("/")[2]);
    }
    setIsOpen(false);
  }, [pathname]);

  const adminNavs = [
    {
      id: 1,
      label: "التقارير",
      icon: DocumentChartBarIcon,
      active: "dashboard",
      href: "/dashboard",
    },
    {
      id: 2,
      label: "إضافة طلب",
      icon: FolderPlusIcon,
      active: "create-order",
      href: "/dashboard/create-order",
    },
    {
      id: 3,
      label: "المبيعات",
      icon: ShoppingCartIcon,
      active: "orders",
      href: "/dashboard/orders",
    },
    {
      id: 4,
      label: "المنتجات",
      icon: CubeTransparentIcon,
      active: "products",
      href: "/dashboard/products",
    },
    {
      id: 7,
      label: "العملاء",
      icon: UsersIcon,
      active: "customers",
      href: "/dashboard/customers",
    },
    {
      id: 5,
      label: "الموديلات",
      icon: ShoppingBagIcon,
      active: "brands",
      href: "/dashboard/brands",
    },
    {
      id: 6,
      label: "أصناف",
      icon: TagIcon,
      active: "categories",
      href: "/dashboard/categories",
    },

    {
      id: 8,
      label: "الإعدادات",
      icon: Cog8ToothIcon,
      active: "settings",
      href: "/dashboard/settings",
    },
  ];

  const signOut = () => {
    Cookies.remove("user");
    window.location.href = "/signin";
  };
  return (
    <>
      <div
        className={`${isOpen ? "hidden " : "static sm:hidden"
          } w-0 h-0 p-0 m-0 `}
      >
        <button
          className={`p-2 hover:shadow absolute right-2 top-4 text-black  transition-all duration-300 ease-in-out
                          bg-white rounded-full z-50 cursor-pointer `}
          onClick={() => {
            setIsSidebarVisible(!isSidebarVisible);
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <ChevronDoubleRightIcon className="size-7" />
          ) : (
            <ChevronDoubleLeftIcon className="size-7" />
          )}
        </button>
      </div>
      <div
        className={`transition-all duration-150 sm:border-l-2 sm:border-white ease-in-out bg-bgColor min-h-[100vh] z-30 
                ${isOpen
            ? "w-full sm:w-80 block"
            : "w-16 lg:w-20 hidden sm:block"
          }`}
      >
        <div
          className={`h-full flex flex-col items-center justify-between space-y-2 font-bold text-center`}
        >
          {/* Toggle button for small screens */}
          <button
            className={`p-2 justify-center text-black  transition-all duration-150 ease-in-out
                       bg-white rounded-full hover:shadow-xl cursor-pointer
                       relative  ${isOpen ? "left-36 sm:right-40 top-4" : "right-10 top-2"
              }`}
            onClick={() => {
              setIsSidebarVisible(!isSidebarVisible);
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <ChevronDoubleRightIcon className="size-7" />
            ) : (
              <ChevronDoubleLeftIcon className="size-7" />
            )}
          </button>
          {/* Logo section */}
          <div className="flex flex-col justify-center items-center w-full text-black">
            <div className="">
              <a href="/dashboard">
                <img
                  src="/logo.jpg"
                  alt="Elz3lan logo"
                  className={`rounded-full ${isOpen
                    ? "h-[60px] w-[60px] lg:h-[70px] lg:w-[70px]"
                    : "h-[40px] w-[40px] lg:h-[60px] lg:w-[60px]"
                    }`}
                />
              </a>
            </div>
          </div>
          {/* Sidebar Navigation */}
          <div
            className={`space-y-3 text-black w-full ${isOpen ? "p-4" : "p-2"
              } flex  justify-center flex-col items-center h-3/4 `}
          >
            {adminNavs.map((nav) => (
              <Link
                key={nav.id}
                href={nav.href}
                className={` py-3 relative  w-full flex justify-center flex-col items-center text-black 
                                transition-all duration-300 ease-in-out  ${isOpen ? "rounded-3xl" : "rounded-3xl"
                  } 
                                 ${active == nav.active
                    ? " bg-white shadow-lg "
                    : " hover:bg-[#ffffffcf]   hover:shadow-lg "
                  }`}
              >
                <div
                  className={`flex ${isOpen
                    ? " lg:pr-12 pr-[28%] md:justify-start"
                    : "justify-center"
                    } space-x-2 w-full items-center`}
                >
                  <nav.icon className="size-5" />
                  {isOpen && <span>{isOpen && nav.label}</span>}
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col justify-center items-center w-full h-1/6">
            <hr className="bg-white border-none w-[80%] h-0.5" />
            <div className={`text-black w-full p-2`}>
              <button
                onClick={signOut}
                className={`py-3 w-full flex justify-center text-black hover:bg-white hover:text-red-700 hover:rounded-3xl
                                  hover:shadow-lg  transition-all duration-300 ease-in-out cursor-pointer`}
              >
                <div
                  className={`flex  space-x-2 w-full items-center 
                                    ${isOpen
                      ? " lg:pr-12 pr-[28%] md:justify-start"
                      : "md:justify-center"
                    }`}
                >
                  <GoSignIn className="size-5" />
                  <span>{isOpen && "تسجيل الخروج"}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
