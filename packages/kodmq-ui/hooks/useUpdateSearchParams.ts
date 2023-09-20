import { usePathname } from "next/dist/client/components/navigation"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type SearchParams = {
  [key: string]: string | number | undefined | null
}

export function useUpdateSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback((value: SearchParams) => {
    const newSearchParams = new URLSearchParams(searchParams)

    for (const key in value) {
      if (value[key] !== undefined && value[key] !== null) {
        newSearchParams.set(key, String(value[key]))
      } else {
        newSearchParams.delete(key)
      }
    }

    router.push(`${pathname}?${newSearchParams.toString()}`)
  }, [router, pathname, searchParams])
}
