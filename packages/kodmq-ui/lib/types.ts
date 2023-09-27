import { ComponentProps, FunctionComponent, JSX, JSXElementConstructor, PropsWithoutRef, RefAttributes, SVGProps } from "react"

export type ExtendProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<unknown>, U> = Omit<ComponentProps<T>, keyof U> & U;
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export type StringKeys<T> = Extract<keyof T, string>
export type DateKeys<T> = Extract<keyof T, Date>
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T]


type IconSVGProps = PropsWithoutRef<SVGProps<SVGSVGElement>> & RefAttributes<SVGSVGElement>
type IconProps = IconSVGProps & { title?: string, titleId?: string }
export type Icon = FunctionComponent<IconProps>

// export type IconProps = ComponentProps<"svg"> & {
//   strokeWidth?: number
// }

export type Errors = {
  [key: string]: string
}

export type ErrorWithMessage = {
  message: string
}
