import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'h-8 px-3 text-[12px]' : 'h-9 px-3.5 text-[13px]';

  const variantClass =
    variant === 'primary'
      ? 'bg-[#E87932] text-white border border-[#E87932] hover:bg-[#d66b27]'
      : variant === 'danger'
        ? 'bg-[#D44C47] text-white border border-[#D44C47] hover:bg-[#be403c]'
        : variant === 'ghost'
          ? 'bg-transparent text-[#252525] border border-transparent hover:bg-[#F5F5F4] dark:text-[#E6E6E6] dark:hover:bg-[#252525]'
          : 'bg-[#FFFFFF] text-[#252525] border border-[#E9E9E7] hover:bg-[#F5F5F4] dark:bg-[#202020] dark:text-[#E6E6E6] dark:border-[#343434] dark:hover:bg-[#252525]';

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-[2px] font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E87932] disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
