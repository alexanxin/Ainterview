import * as React from "react";
import { cn } from "@/lib/utils";

export interface RangeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const RangeInput = React.forwardRef<HTMLInputElement, RangeInputProps>(
  ({ className, type = "range", min = 0, max = 100, step = 1, ...props }, ref) => {
    return (
      <input
        type={type}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
RangeInput.displayName = "RangeInput";

export { RangeInput };