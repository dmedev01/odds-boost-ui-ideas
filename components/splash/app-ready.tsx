'use client'

import { useEffect } from 'react'

export function AppReady() {
  useEffect(() => {
    // ?splash=hold keeps the splash up so it can be reviewed in the preview.
    if (new URLSearchParams(window.location.search).get('splash') === 'hold') return
    document.documentElement.setAttribute('data-app-ready', '')
  }, [])
  return null
}
