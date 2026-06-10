'use client'

import GradualBlur from '@/components/GradualBlur'

export function BottomGlassFade() {
  return (
    <GradualBlur
      target="page"
      position="bottom"
      height="7rem"
      strength={2.5}
      divCount={6}
      curve="bezier"
      exponential
      opacity={1}
      zIndex={40}
      style={{
        background:
          'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 50%, transparent 100%)',
      }}
    />
  )
}
