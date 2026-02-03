import React from "react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";


const Pagination= ({
  currentPage,
  totalPages,
  onPageChange,
  onLimitChange,
  limit,
}) => {
  // Generate page numbers to display
  const pageNumbers = [];
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(currentPage + 2, totalPages);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <div
      dir="ltr"
      className="flex justify-center items-center p-2 rounded-b-lg w-full text-black"
    >
      <div className="flex justify-center items-center space-x-4 p-2 rounded-full w-full md:w-1/3">
        <div className="flex justify-between items-center space-x-1 text-center">
          <button
            className="hover:bg-gray-500 disabled:opacity-50 p-2 border border-gray-300 rounded-full text-black hover:text-white"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronDoubleLeftIcon className="size-4 font-bold" />
          </button>
          <button
            className="hover:bg-gray-500 disabled:opacity-50 p-2 border border-gray-300 rounded-full text-black hover:text-white"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <div className="space-x-1">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`relative z-0 size-9 ${
                  pageNumber === currentPage
                    ? "text-white before:absolute before:left-0 before:top-0 before:-z-10 before:h-full before:w-full before:rounded-full before:bg-gray-600"
                    : "rounded-full hover:bg-gray-400 hover:text-white"
                }`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            className="hover:bg-gray-500 disabled:opacity-50 p-2 border border-gray-300 rounded-full text-black hover:text-white"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </button>
          <button
            className="hover:bg-gray-500 disabled:opacity-50 p-2 border border-gray-300 rounded-full text-black hover:text-white"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronDoubleRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
