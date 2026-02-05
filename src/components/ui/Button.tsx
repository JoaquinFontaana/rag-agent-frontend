interface ButtonProps {
  readonly type?: "button" | "submit" | "reset";
  readonly variant?: "primary" | "secondary" | "danger" | "ghost";
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function Button({
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  children,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "flex justify-center items-center py-3 px-4 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  const variantStyles = {
    primary:
      "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "border-gray-700 text-white bg-gray-800 hover:bg-gray-700 focus:ring-gray-500",
    danger:
      "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    ghost:
      "border-transparent text-gray-400 hover:text-white hover:bg-gray-800 focus:ring-gray-500",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
