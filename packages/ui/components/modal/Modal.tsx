"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import XIcon from "@/components/icons/XIcon"
import Heading from "@/components/typography/Heading"
import Text from "@/components/typography/Text"
import Button from "@/components/ui/Button"
import useLockBodyScroll from "@/hooks/useLockBodyScroll"

export type ModalProps = {
  title?: ReactNode
  description?: ReactNode
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, description, onClose, children }: ModalProps) {
  useLockBodyScroll()

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 w-screen overflow-y-auto"
      >
        <div
          className="flex items-center justify-center p-24"
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white px-9 py-8 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="group/button absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition-colors duration-300 ease-in-out hover:bg-black/2.5 hover:text-zinc-700 dark:hover:bg-white/2.5 dark:hover:text-zinc-300"
            >
              <XIcon className="h-5 w-5 transition-transform duration-300 ease-in-out group-hover/button:rotate-90" />
            </button>

            <div className="mb-4 space-y-1">
              {title && (
                <Heading className="mb-0">
                  {title}
                </Heading>
              )}

              {description && (
                <Text>
                  {description}
                </Text>
              )}
            </div>

            <div className="mb-4">
              {children}
            </div>

            <Button
              onClick={onClose}
              className="mx-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
