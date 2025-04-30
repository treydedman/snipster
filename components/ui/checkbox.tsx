// components/ui/checkbox.tsx
import * as React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mr-2 h-4 w-4 border-neutral-800 focus:ring-indigo-500"
      />
      {label}
    </label>
  );
};

export { Checkbox };
