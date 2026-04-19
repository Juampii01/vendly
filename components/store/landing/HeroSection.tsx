'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { StoreConfig, HeroContent } from '@/types'

interface Props {
  store: StoreConfig
  content: HeroContent
}

export function HeroSection({ store, content }: Props) {
  const hasImage = Boolean(content.image_url)

  // Split title into words for staggered reveal
  const words = content.title.split(' ')

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background */}
      {hasImage ? (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image src={content.image_url} alt={content.title} fill priority sizes="100vw"
            className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/20" />
        </motion.div>
      ) : (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            background: `linear-gradient(135deg, ${store.color_primary} 0%, ${store.color_secondary} 50%, ${store.color_accent}40 100%)`,
          }}
        />
      )}

      {/* Animated grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

      {/* Content */}
      <div className="relative z-10 w-full px-8 py-32 md:px-20">
        <div className="max-w-5xl">

          {/* Label */}
          {content.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 text-xs font-bold uppercase tracking-[0.4em]"
              style={{ color: store.color_accent }}
            >
              {content.subtitle}
            </motion.p>
          )}

          {/* Title — word by word */}
          <h1 className="mb-10 font-black leading-[0.9] tracking-tight text-white"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}>
            {words.map((word, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 60, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-block mr-[0.25em]"
                style={{ transformOrigin: 'bottom center', perspective: '400px' }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* CTA */}
          {content.cta_label && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + words.length * 0.1 + 0.2 }}
            >
              <motion.a
                href={content.cta_url || '#contact'}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-[0.2em]"
                style={{ backgroundColor: store.color_accent, color: store.color_background }}
              >
                {content.cta_label}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </motion.a>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-px h-12 origin-top"
          style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
