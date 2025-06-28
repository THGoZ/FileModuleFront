import { Eye, EyeOff, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SimpleTextInputProps {
  label: string;
  type?: string;
  isValid?: boolean;
  value?: string;
  onClear: () => void;
}

export default function SimpleTextInput({
  label,
  type = "text",
  isValid = true,
  onClear,
  value,
  ...props
}: SimpleTextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldFloat, setShouldFloat] = useState(false);
  const inputType = type;

  const handleFocus = () => setFocused(true);
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFocused(false);
    setHasValue(e.target.value !== "");
  };

  const clear = () => {
    onClear();
    setHasValue(false);
    setFocused(false);
  };

  useEffect(() => {
    if (value) {
      setHasValue(true);
    }
  }, [value]);

  useEffect(() => {
    if (focused || hasValue) {
      setShouldFloat(true);
    } else {
      setShouldFloat(false);
    }
  }, [focused, hasValue]);

  return (
    <div className="relative mt-2">
      {type === "textarea" ? (
        <div className="relative">
          <textarea
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            defaultValue={value}
            className={`peer w-full border px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500
          ${
            isValid
              ? "border-zinc-300 dark:border-zinc-600"
              : "bg-red-400/10 border-red-300 dark:border-red-700"
          }`}
          />
        </div>
      ) : (
        <input
          {...props}
          type={
            inputType === "password"
              ? showPassword
                ? "text"
                : "password"
              : inputType
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          defaultValue={value}
          className={`peer w-full border px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500
          ${
            isValid
              ? "border-gray-300 dark:border-zinc-600"
              : "bg-red-400/10 border-red-300 dark:border-red-700"
          }`}
        />
      )}

      <label
        className={`absolute left-2 text-sm transition-all duration-200 bg-transparent px-1 text-zinc-500 ${
          shouldFloat ? "top-0.5 text-xs" : "top-3"
        } pointer-events-none`}
      >
        {label}
      </label>

      <div className="absolute right-2 top-2 text-sm transition-all duration-200 bg-transparent px-1 my-1 space-x-0.5 flex">
        {inputType === "password" && (
          <div
            className="flex items-center space-x-1 px-1 py-1 hover:text-zinc-200 text-zinc-500 hover:scale-110"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </div>
        )}
        {!isValid && (
          <div
            className="flex items-center space-x-1 px-1 py-1 border border-red-500 bg-red-500/10 hover:bg-red-400/20 text-red-300 hover:text-red-200 transition-colors"
            onClick={clear}
          >
            <X className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
