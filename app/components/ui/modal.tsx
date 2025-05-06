// components/ui/modal.tsx
import * as React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-black"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export { Modal };
