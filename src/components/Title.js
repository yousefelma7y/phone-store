import React from "react";

const Title = ({ title, subTitle, button = false, count = 0, settings = false }) => {
  return (
    <div className="flex justify-between items-center p-8">
      <div>
        <h1 className="font-bold text-gray-900 text-3xl">{title} {!settings && `(${count.toLocaleString("ar-EG")})`} </h1>
        <p className="text-gray-500">{subTitle}</p>
      </div>
      {button && button}

    </div>
  );
};

export default Title;
