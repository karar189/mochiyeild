'use client'

import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { HeroDashboardContent } from './HeroDashboardContent'

const SPRING = { stiffness: 140, damping: 24, mass: 0.5 } as const

function BrowserChrome() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#111111] border-b border-white/[0.06]">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>
      <div className="flex-1 flex justify-center min-w-0">
        <span className="text-[11px] text-[#71717A] font-[family-name:var(--font-inter)] bg-white/[0.04] border border-white/[0.06] px-4 py-1.5 rounded-full truncate max-w-[240px]">
          app.mochitrade.xyz
        </span>
      </div>
      <div className="w-[52px] shrink-0" aria-hidden />
    </div>
  )
}

export function HeroTiltedDashboard() {
  const previewRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ['start 95%', 'start 30%'],
  })

  const rotateXRaw = useTransform(scrollYProgress, [0, 1], [22, 0])
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [0.94, 1])

  const rotateX = useSpring(rotateXRaw, SPRING)
  const scale = useSpring(scaleRaw, SPRING)

  return (
    <div
      ref={previewRef}
      className="relative z-10 mt-20 sm:mt-28 lg:mt-36 w-full max-w-5xl mx-auto px-4 sm:px-6 pointer-events-none"
      style={{ perspective: '1800px', perspectiveOrigin: '50% 0%' }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[10%] w-[90%] h-[60%] blur-3xl rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(255,146,179,0.08) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                scale,
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 100%',
              }
        }
        className={reduceMotion ? 'scale-[0.98]' : undefined}
      >
        <div
          className="rounded-[20px] overflow-hidden"
          style={{
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.55)',
          }}
        >
          <BrowserChrome />
          <HeroDashboardContent />
        </div>
      </motion.div>
    </div>
  )
}
