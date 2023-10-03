import { useEffect } from "react"

export default function useLockBodyScroll() {
  useEffect(() => {
    document.body.dataset.previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = document.body.dataset.previousOverflow || ""
    }
  }, [])
}
