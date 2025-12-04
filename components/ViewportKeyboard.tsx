'use client'

import { useEffect } from 'react'

export default function ViewportKeyboard() {
  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined
    const root = document.documentElement

    const update = () => {
      const ih = window.innerHeight || document.documentElement.clientHeight || 0
      const height = vv?.height ?? ih
      const offsetTop = vv?.offsetTop ?? 0
      const inset = Math.max(0, ih - height - offsetTop)

      root.style.setProperty('--kb-inset', `${inset}px`)
      if (inset > 0) root.classList.add('kb-open')
      else root.classList.remove('kb-open')
    }

    update()
    window.addEventListener('resize', update)
    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update)
    }
    return () => {
      window.removeEventListener('resize', update)
      if (vv) {
        vv.removeEventListener('resize', update)
        vv.removeEventListener('scroll', update)
      }
    }
  }, [])

  return null
}


