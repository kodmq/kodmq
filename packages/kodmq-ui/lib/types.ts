import { ComponentProps, JSX, JSXElementConstructor } from "react"

export type ExtendProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<unknown>, U> = Omit<ComponentProps<T>, keyof U> & U;
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export type StringKeys<T> = Extract<keyof T, string>

export type Errors = {
  [key: string]: string
}

export type ErrorWithMessage = {
  message: string
}
