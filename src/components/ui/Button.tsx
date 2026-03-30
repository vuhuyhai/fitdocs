import { ButtonHTMLAttributes, forwardRef, useCallback } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  ripple?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-violet-600 hover:bg-violet-500 text-white border border-violet-600 hover:border-violet-500',
  secondary:
    'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 hover:border-zinc-600',
  ghost:
    'bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-zinc-50 border border-transparent',
  danger:
    'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 hover:border-red-600/50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, ripple = true, className = '', children, onClick, ...props }, ref) => {
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (ripple && !disabled && !loading) {
          const btn = e.currentTarget;
          const rect = btn.getBoundingClientRect();
          const diameter = Math.max(rect.width, rect.height);
          const wave = document.createElement('span');
          wave.className = 'ripple-wave';
          wave.style.cssText = `
            width: ${diameter}px; height: ${diameter}px;
            left: ${e.clientX - rect.left - diameter / 2}px;
            top:  ${e.clientY - rect.top  - diameter / 2}px;
          `;
          btn.appendChild(wave);
          setTimeout(() => wave.remove(), 600);
        }
        onClick?.(e);
      },
      [ripple, disabled, loading, onClick],
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`
          ripple-container inline-flex items-center justify-center gap-2 font-medium
          transition-colors duration-150 cursor-pointer btn-press
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export default Button;
