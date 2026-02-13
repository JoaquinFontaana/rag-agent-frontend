import NextLink from "next/link";
import { ReactNode } from "react";

interface LinkButtonProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: "primary" | "secondary";
  readonly className?: string;
}

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700",
  secondary: "bg-gray-800 hover:bg-gray-700",
};

export default function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
}: LinkButtonProps) {
  return (
    <NextLink
      href={href}
      className={`px-6 py-3 sm:px-8 sm:py-4 text-white font-semibold rounded-xl transition-colors text-base sm:text-lg ${variants[variant]} ${className}`}
    >
      {children}
    </NextLink>
  );
}
