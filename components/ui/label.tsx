import * as React from "react";

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-white">
      {children}
    </label>
  );
};

export { Label };
