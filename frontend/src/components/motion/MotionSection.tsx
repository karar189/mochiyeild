'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { sectionReveal } from './variants'

type MotionSectionProps = HTMLMotionProps<'section'> & {
  delay?: number
}

export function MotionSection({
  children,
  className,
  delay = 0,
  ...props
}: MotionSectionProps) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -12% 0px' }}
      variants={{
        hidden: sectionReveal.hidden,
        visible: {
          ...sectionReveal.visible,
          transition: {
            ...sectionReveal.visible.transition,
            delay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.section>
  )
}
