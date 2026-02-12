import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "gradient" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
}

export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 tracking-wide";

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white shadow-md shadow-blue-600/20 disabled:shadow-none focus:ring-blue-500",
    secondary: "border border-gray-700 text-white bg-gray-800 hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 hover:shadow-red-500/30 focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20 hover:shadow-green-500/30 focus:ring-green-500",
    ghost: "text-gray-400 hover:text-white hover:bg-gray-800 focus:ring-gray-500",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 focus:ring-blue-500",
    icon: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white focus:ring-gray-600"
  };

  const sizeStyles = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
    lg: "px-6 py-3 text-base font-medium"
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
