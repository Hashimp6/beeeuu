// src/components/CustomToast.jsx
import React from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

// Reusable Toast component
const ToastContent = ({ t, message, type }) => {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-gray-700";

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between gap-2`}
    >
      <span>{message}</span>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 text-white hover:text-gray-200"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// ✅ Success toast
export const showSuccessToast = (message) => {
  toast.custom(
    (t) => <ToastContent t={t} message={message} type="success" />,
    { duration: 2000 }
  );
};

// ❌ Error toast
export const showErrorToast = (message) => {
  toast.custom(
    (t) => <ToastContent t={t} message={message} type="error" />,
    { duration: 2000 }
  );
};

export default ToastContent;
