'use client'

import { useRef } from 'react'
import { motion, useInView, type Variants, AnimatePresence } from 'framer-motion'

export { AnimatePresence }

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const slideRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface AnimProps {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

function useScrollReveal(margin = '-80px') {
  const ref = useRef(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inView = useInView(ref, { once: true, margin } as any)
  return { ref, inView }
}

// ─── Components ───────────────────────────────────────────────────────────────

export function FadeUp({ children, className, delay = 0, style }: AnimProps) {
  const { ref, inView } = useScrollReveal()
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, className, delay = 0, style }: AnimProps) {
  const { ref, inView } = useScrollReveal()
  return (
    <motion.div ref={ref} variants={fadeIn} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

export function SlideLeft({ children, className, delay = 0, style }: AnimProps) {
  const { ref, inView } = useScrollReveal()
  return (
    <motion.div ref={ref} variants={slideLeft} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

export function SlideRight({ children, className, delay = 0, style }: AnimProps) {
  const { ref, inView } = useScrollReveal()
  return (
    <motion.div ref={ref} variants={slideRight} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

export function StaggerGrid({ children, className, style }: AnimProps) {
  const { ref, inView } = useScrollReveal('-40px')
  return (
    <motion.div ref={ref} variants={staggerContainer} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, style }: AnimProps) {
  return (
    <motion.div variants={staggerItem} className={className} style={style}>
      {children}
    </motion.div>
  )
}

export function HoverCard({ children, className, style }: AnimProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className} style={style}>
      {children}
    </motion.div>
  )
}

// ─── Page enter ───────────────────────────────────────────────────────────────

export function PageEnter({ children, className }: AnimProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
