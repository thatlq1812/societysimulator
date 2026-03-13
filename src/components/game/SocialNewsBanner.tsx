'use client'

import { useEffect, useState } from 'react'

interface SocialNewsBannerProps {
  text: string
}

export function SocialNewsBanner({ text }: SocialNewsBannerProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 18)
    return () => clearInterval(id)
  }, [text])

  return (
    <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
      {displayed}
      {!done && <span className="typewriter-cursor" />}
    </div>
  )
}
