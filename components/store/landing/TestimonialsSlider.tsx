'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StoreConfig, TestimonialsContent } from '@/types'
import { FadeUp } from './motion'

interface Props {
  store: StoreConfig
  content: TestimonialsContent
}

export function TestimonialsSlider({ store, content }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const items = content.items
  const total = items.length

  const go = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(c => (c + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(c => (c - 1 + total) % total)
  }, [total])

  // Auto-advance
  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next, total])

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 80, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -80, scale: 0.96, transition: { duration: 0.35 } }),
  }

  return (
    <section id="testimonials" className="px-6 py-28 md:px-16 overflow-hidden"
      style={{ backgroundColor: `${store.color_text}06` }}>
      <div className="max-w-4xl mx-auto">

        <FadeUp className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
            {content.title}
          </h2>
        </FadeUp>

        {/* Slider */}
        <div className="relative">
          {/* Quote mark */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl font-black opacity-10 select-none"
            style={{ color: store.color_accent }}>
            "
          </div>

          {/* Card */}
          <div className="relative min-h-[220px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full max-w-2xl mx-auto text-center px-4"
              >
                <p className="text-xl md:text-2xl leading-relaxed mb-10 font-light"
                  style={{ color: store.color_text }}>
                  "{items[current].text}"
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-base font-black text-white"
                    style={{ backgroundColor: store.color_accent }}>
                    {items[current].name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold" style={{ color: store.color_text }}>
                    {items[current].name}
                  </p>
                  <p className="text-xs opacity-40">{items[current].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-6 mt-10">
              <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: `${store.color_text}30`, color: store.color_text }}>
                ←
              </motion.button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <motion.button key={i} onClick={() => go(i)}
                    animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.3 }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: store.color_accent }}
                  />
                ))}
              </div>

              <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: `${store.color_text}30`, color: store.color_text }}>
                →
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
