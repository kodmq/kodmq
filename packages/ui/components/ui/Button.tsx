"use client"

import { cva, VariantProps } from "class-variance-authority"
import { useRouter } from "next/navigation"
import { ComponentProps, createElement, ForwardedRef, forwardRef, FunctionComponent, RefObject, useCallback } from "react"
import { AriaButtonOptions, FocusRing, useButton } from "react-aria"
import { twMerge } from "tailwind-merge"
import Loader from "@/components/ui/Loader"

export type ButtonProps = Omit<ComponentProps<"button">, "ref">
	& AriaButtonOptions<"button">
	& VariantProps<typeof buttonVariants>
	& {
	icon?: FunctionComponent<{ className?: string }>
	href?: string
	block?: boolean
	loading?: boolean
}

function Button({
  variant = "primary",
  size = "md",
  icon,
  href,
  block = false,
  loading = false,
  disabled = false,
  className,
  onClick,
  children,
  ...props
}: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  const router = useRouter()
  const { buttonProps } = useButton({ isDisabled: disabled, ...props }, ref as RefObject<HTMLButtonElement>)

  const handleClick: ButtonProps["onClick"] = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (loading) return event.preventDefault()

    if (href) {
      event.preventDefault()
      router.push(href)
    } else {
      onClick?.(event)
    }
  }, [loading, href, onClick, router])

  const handleOnMouseDown: ButtonProps["onMouseDown"] = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (href && event.button === 1) {
      window.open(href, "_blank")
    } else {
      props.onMouseDown?.(event)
    }
  }, [href, props])

  const handleOnMouseEnter: ButtonProps["onMouseEnter"] = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (href) router.prefetch(href)
    props.onMouseEnter?.(event)
  }, [href, props, router])

  return (
    <FocusRing
      within
      focusRingClass="ring-2 ring-offset-2 ring-neutral-500 dark:ring-sky-500 ring-offset-white dark:ring-offset-neutral-900"
    >
      <button
        ref={ref}
        className={twMerge(
          buttonVariants({ variant, size, loading, disabled, iconOnly: !children }),
          className,
          block && "w-full",
          // Hide all children if loading
        )}
        {...buttonProps}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseDown={handleOnMouseDown}
        onMouseEnter={handleOnMouseEnter}
      >
        {loading ? (
          <Loader
            text="Loading"
            className={iconVariants({ size })}
          />
        ) : (
          <>
            {icon && createElement(icon, { className: iconVariants({ size }) })}
            {children}
          </>
        )}
      </button>
    </FocusRing>
  )
}

const buttonVariants = cva([
  "flex items-center justify-center whitespace-nowrap rounded-lg font-medium focus:outline-none",
], {
  variants: {
    variant: {
      primary: "",
      secondary: "",
      secondaryDark: "bg-neutral-200 text-neutral-900 enabled:hover:bg-neutral-300 disabled:bg-neutral-400 disabled:text-neutral-500 dark:bg-neutral-800 dark:text-neutral-100 dark:enabled:hover:bg-neutral-700 dark:disabled:bg-neutral-600 dark:disabled:text-neutral-500",
      link: "bg-transparent text-sky-600 enabled:hover:bg-sky-100 disabled:text-sky-300 dark:enabled:hover:bg-sky-100/10 dark:disabled:text-sky-700",

      red: "bg-red-600 text-white enabled:hover:bg-red-500 disabled:bg-red-300 disabled:text-red-500",
      dark: "bg-neutral-900 text-neutral-100 enabled:hover:bg-neutral-800 disabled:bg-neutral-700 disabled:text-neutral-500",
      transparent: "bg-transparent text-white enabled:hover:bg-neutral-900 disabled:text-neutral-600",

      skyGlassy: "bg-sky-500/10 text-sky-600 enabled:hover:bg-sky-500/20 disabled:bg-sky-500/5 dark:bg-sky-500/15 dark:text-sky-600",
      greenGlassy: "bg-green-500/10 text-green-600 enabled:hover:bg-green-500/20 disabled:bg-green-500/5 dark:bg-green-500/15 dark:text-green-600",
      yellowGlassy: "bg-yellow-500/10 text-yellow-700 enabled:hover:bg-yellow-500/20 disabled:bg-yellow-500/5 dark:bg-yellow-500/15 dark:text-yellow-600",
      amberGlassy: "bg-amber-500/10 text-amber-700 enabled:hover:bg-amber-500/20 disabled:bg-amber-500/5 dark:bg-amber-500/15 dark:text-amber-600",
      redGlassy: "bg-red-500/10 text-red-600 enabled:hover:bg-red-500/20 disabled:bg-red-500/5 dark:bg-red-500/15 dark:text-red-600",
    },
    size: {
      xs: "h-7 gap-1 px-2.5 text-xs",
      sm: "h-8 gap-1.5 px-3 text-sm",
      md: "h-10 gap-2 px-4 text-base",
      lg: "h-12 gap-2.5 px-5 text-lg",
      xl: "h-14 gap-3 px-6 text-xl",
    },
    disabled: {
      true: "cursor-not-allowed",
      false: "",
    },
    loading: {
      true: "cursor-wait",
      false: "",
    },
    iconOnly: {
      true: "px-0",
      false: "",
    },
  },

  compoundVariants: [
    // Primary
    { variant: "primary", disabled: false, className: "bg-black text-white dark:bg-neutral-200 dark:text-neutral-900" },
    { variant: "primary", disabled: true, className: "bg-neutral-400 text-neutral-700 dark:text-neutral-500" },
    { variant: "primary", disabled: false, loading: false, className: "hover:bg-neutral-900 dark:hover:bg-neutral-300" },

    // Secondary
    { variant: "secondary", disabled: false, className: "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100" },
    { variant: "secondary", disabled: true, className: "bg-neutral-300 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-500" },
    { variant: "secondary", disabled: false, loading: false, className: "hover:bg-neutral-200 dark:hover:bg-neutral-800" },

    // Sizes (iconOnly)
    { size: "xs", iconOnly: true, className: "h-7 w-7" },
    { size: "sm", iconOnly: true, className: "h-9 w-9" },
    { size: "md", iconOnly: true, className: "h-12 w-12" },
    { size: "lg", iconOnly: true, className: "h-14 w-14" },
    { size: "xl", iconOnly: true, className: "h-16 w-16" },
  ],
})

const iconVariants = cva([
  "inline-block shrink-0",
], {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
    },
  },
})

export default forwardRef(Button)
