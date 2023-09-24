import { create } from "zustand"

type ID = string

type Toast = {
	id: ID
	title: string
	description: string
}

type ToastStore = {
	toasts: Toast[]
	timers: Record<ID, NodeJS.Timeout>

	toast: (toast: Omit<Toast, "id">) => void
	closeToast: (id: string) => void
}

const store = create<ToastStore>((set, get) => ({
  toasts: [],
  timers: {},

  toast: (toastWithoutId: Omit<Toast, "id">) => {
    const { toasts, timers } = get()
		
    const toast: Toast = {
      id: Math.random().toString(36).substring(7),
      ...toastWithoutId,
    }
		
    const timer = setTimeout(() => {
      get().closeToast(toast.id)
    }, 3000)
		
    set({
      toasts: [...toasts, toast],
      timers: { ...timers, [toast.id]: timer },
    })
  },

  closeToast: (id: string) => {
    const { toasts, timers } = get()

    if (!timers[id]) return

    clearTimeout(timers[id])

    const newToasts = toasts.filter((toast) => toast.id !== id)
    const newTimers = { ...timers }
    delete newTimers[id]
		
    set({ toasts: newToasts, timers: newTimers })
  },
}))

export const useToasts = () => store((state) => state.toasts)

export const toast = (toast: Omit<Toast, "id">) => store.getState().toast(toast)
export const closeToast = (id: ID) => store.getState().closeToast(id)
