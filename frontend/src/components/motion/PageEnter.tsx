'use client'

import { motion } from 'framer-motion'
import { fadeIn } from './variants'

export function PageEnter({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      {children}
    </motion.div>
  )
}
