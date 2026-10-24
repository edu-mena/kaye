import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'onNavy'
type Size = 'sm' | 'md' | 'lg'

type Style = { variant?: Variant; size?: Size; className?: string }

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-dark',
  secondary: 'border border-line bg-surface text-navy hover:border-navy/40',
  ghost: 'text-navy hover:bg-navy-100',
  // Gold on near-black or light surfaces, never over navy (docs/design.md, Cores).
  accent: 'bg-gold text-night hover:bg-[#f2b600]',
  // On navy only white: never gold over navy.
  onNavy: 'bg-white text-navy hover:bg-navy-100',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
}

function buttonClasses({ variant = 'primary', size = 'md', className = '' }: Style = {}) {
  return [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap',
    'transition-[background-color,border-color,transform] duration-200 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Style

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
}

type ButtonLinkProps = LinkProps & Style

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />
}
