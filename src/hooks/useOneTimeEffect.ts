import { useEffect, useState } from 'react'

export const useOneTimeEffect = (effect: () => void, shouldRun: boolean) => {
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    if (!shouldRun || hasRun) {
      return
    }

    // StrictMode runs a throwaway effect pass in dev; defer so its cleanup can cancel.
    let isCurrentEffect = true
    const frame = window.requestAnimationFrame(() => {
      if (!isCurrentEffect) {
        return
      }

      setHasRun(true)
      effect()
    })

    return () => {
      isCurrentEffect = false
      window.cancelAnimationFrame(frame)
    }
  }, [effect, hasRun, shouldRun])
}
