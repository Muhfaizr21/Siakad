import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef((props, ref) => {
  const { className, type, ...rest } = props;

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-sm placeholder:text-[#a3a3a3] focus-visible:outline-none focus-visible:border-primary/50 focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      {...rest}
    />
  );
});

Input.displayName = "Input";

export { Input };