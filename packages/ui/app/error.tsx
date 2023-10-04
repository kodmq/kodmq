"use client"

import { useCallback, useEffect, useState } from "react"
import AlertIcon from "@/components/icons/AlertIcon"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { getErrorMessage } from "@/lib/utils"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [resetting, setResetting] = useState(false)

  const handleReset = useCallback(async () => {
    setResetting(true)

    // Fake loading, so user can see the button is working
    await new Promise((resolve) => setTimeout(resolve, 300))
    reset()

    setResetting(false)
  }, [])

  // eslint-disable-next-line no-console
  useEffect(() => console.error(error), [error])

  return (
    <EmptyState
      icon={AlertIcon}
      iconProps={{ className: "text-red-500 dark:text-red-500", strokeWidth: 1.5 }}
      title="Something went wrong"
      description={getErrorMessage(error)}
      button={(
        <Button
          loading={resetting}
          onClick={handleReset}
        >
          Try again
        </Button>
      )}
    />
  )
}
