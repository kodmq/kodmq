"use client"

import * as Toast from "@radix-ui/react-toast"
import { motion, AnimatePresence } from "framer-motion"
import Card, { CardPadding, CardDescription, CardTitle } from "@/components/ui/Card"
import { closeToast, useToasts } from "@/stores/toast"

export default function Toasts() {
  const toasts = useToasts()
	
  return (
    <Toast.Provider swipeDirection="right">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast.Root
            open
            asChild
            forceMount
            key={toast.id}
          >
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              onClick={() => closeToast(toast.id)}
            >
              <Card>
                <CardPadding>
                  <Toast.Title asChild>
                    <CardTitle className="mb-0.5">
                      {toast.title}
                    </CardTitle>
                  </Toast.Title>
                  <Toast.Description asChild>
                    <CardDescription>
                      {toast.description}
                    </CardDescription>
                  </Toast.Description>
                </CardPadding>
              </Card>
            </motion.div>
          </Toast.Root>
        ))}
      </AnimatePresence>

      <Toast.Viewport
        className="max-w-screen fixed bottom-5 right-5 z-[1000] flex w-96 flex-col gap-2 outline-none"
      />
    </Toast.Provider>
  )
}
