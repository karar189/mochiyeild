'use client'

import { useEffect } from 'react'

/** Applies global dark theme body class used across landing + app pages. */
export function LandingBodySync() {
  useEffect(() => {
    document.body.classList.add('is-landing')
    return () => document.body.classList.remove('is-landing')
  }, [])

  return null
}
