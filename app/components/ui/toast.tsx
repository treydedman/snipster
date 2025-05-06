// components/ui/toast.tsx
import * as React from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded-md text-white ${bgColor}`}
    >
      {message}
    </div>
  );
};

export { Toast };
