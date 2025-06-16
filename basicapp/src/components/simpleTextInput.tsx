import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface SimpleTextInputProps {
  label: string;
  isPassword?: boolean;
}

export default function SimpleTextInput({
  label,
  isPassword = false,
  ...props
}: SimpleTextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setHasValue(e.target.value !== "");
  };

  const shouldFloat = focused || hasValue;

  return (
    <div className="relative mt-2">
      <input
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={isPassword ? showPassword ? "text" : "password" : "text"}
        className="peer w-full border border-gray-300 dark:border-gray-700 px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <label
        className={`absolute left-2 top-1 text-sm transition-all duration-200 bg-transparent px-1 text-gray-500 ${
          shouldFloat ? "-top-2 text-xs" : "top-3"
        } pointer-events-none`}
      >
        {label}
      </label>
      {isPassword && (
        <div className="absolute right-2 top-2 text-sm transition-all duration-200 bg-transparent px-1">
          <div
            className="flex items-center space-x-1 py-2.5 px-1 hover:text-gray-200 text-gray-500 hover:scale-110"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
