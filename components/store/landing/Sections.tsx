'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type {
  StoreConfig, AboutContent, ServicesContent,
  PricingContent, GalleryContent, FaqContent, ContactContent,
} from '@/types'
import { FadeUp, FadeIn, SlideLeft, SlideRight, StaggerGrid, StaggerItem, HoverCard } from './motion'

// ─── About ───────────────────────────────────────────────────────────────────

export function AboutSection({ store, content }: { store: StoreConfig; content: AboutContent }) {
  return (
    <section id="about" className="overflow-hidden relative">
      {/* Background block */}
      <div className="absolute inset-0 right-1/2 hidden md:block"
        style={{ backgroundColor: store.color_primary }} />

      <div className="relative grid md:grid-cols-2 min-h-[600px]">
        {/* Image side */}
        <SlideLeft className="relative min-h-[400px] md:min-h-0">
          {content.image_url ? (
            <Image src={content.image_url} alt={content.title} fill sizes="50vw"
              className="object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: store.color_secondary }} />
          )}
          {/* Overlay gradient on image */}
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(to right, transparent 60%, ${store.color_background})` }} />
        </SlideLeft>

        {/* Text side */}
        <SlideRight className="flex flex-col justify-center px-10 py-20 md:px-16"
          style={{ backgroundColor: store.color_background }}>
          {content.label && (
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ color: store.color_accent }}>
              {content.label}
            </p>
          )}
          <h2 className="mb-6 font-black uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: store.color_text }}>
            {content.title}
          </h2>
          <p className="mb-10 text-base leading-relaxed max-w-md opacity-60"
            style={{ color: store.color_text }}>
            {content.body}
          </p>
          {content.cta_label && (
            <motion.a href={content.cta_url || '#contact'}
              whileHover={{ x: 6 }}
              className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] w-fit"
              style={{ color: store.color_accent }}>
              {content.cta_label}
              <span>→</span>
            </motion.a>
          )}
        </SlideRight>
      </div>
    </section>
  )
}

// ─── Services ────────────────────────────────────────────────────────────────

export function ServicesSection({ store, content }: { store: StoreConfig; content: ServicesContent }) {
  return (
    <section id="services" className="px-8 py-28 md:px-20">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="mb-20">
          {content.subtitle && (
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ color: store.color_accent }}>
              {content.subtitle}
            </p>
          )}
          <h2 className="font-black uppercase tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: store.color_text }}>
            {content.title}
          </h2>
        </FadeUp>

        <StaggerGrid className={`grid gap-px ${content.items.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
          style={{ backgroundColor: `${store.color_text}10` }}>
          {content.items.map((item, i) => (
            <StaggerItem key={i}>
              <HoverCard
                className="group flex flex-col gap-6 p-10 h-full relative overflow-hidden"
                style={{ backgroundColor: store.color_background }}>
                {/* Accent corner */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at top right, ${store.color_accent}30, transparent)` }}
                />
                <span className="text-5xl">{item.icon}</span>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3"
                    style={{ color: store.color_text }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed opacity-60" style={{ color: store.color_text }}>
                    {item.description}
                  </p>
                </div>
                <motion.div className="mt-auto h-0.5 w-0 group-hover:w-full transition-all duration-500 origin-left"
                  style={{ backgroundColor: store.color_accent }} />
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export function PricingSection({ store, content }: { store: StoreConfig; content: PricingContent }) {
  return (
    <section id="pricing" className="px-8 py-28 md:px-20"
      style={{ backgroundColor: `${store.color_text}04` }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <h2 className="mb-4 font-black uppercase tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: store.color_text }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-base opacity-50" style={{ color: store.color_text }}>
              {content.subtitle}
            </p>
          )}
        </FadeUp>

        <StaggerGrid className={`grid gap-6 ${content.plans.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'}`}>
          {content.plans.map((plan, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative flex flex-col rounded-3xl p-10 h-full overflow-hidden"
                style={{
                  backgroundColor: plan.highlighted ? store.color_primary : store.color_background,
                  boxShadow: plan.highlighted ? `0 30px 80px ${store.color_primary}40` : `0 4px 40px ${store.color_text}08`,
                }}>
                {plan.highlighted && (
                  <>
                    {/* Glow background */}
                    <div className="absolute inset-0 opacity-20"
                      style={{ background: `radial-gradient(circle at 70% 20%, ${store.color_accent}, transparent 60%)` }} />
                    <span className="relative inline-block mb-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit"
                      style={{ backgroundColor: store.color_accent, color: store.color_background }}>
                      Más popular
                    </span>
                  </>
                )}
                <h3 className="relative text-2xl font-black uppercase mb-2"
                  style={{ color: plan.highlighted ? store.color_background : store.color_text }}>
                  {plan.name}
                </h3>
                <div className="relative flex items-end gap-1 mb-8">
                  <span className="text-5xl font-black leading-none"
                    style={{ color: plan.highlighted ? store.color_background : store.color_text }}>
                    {plan.price}
                  </span>
                  <span className="text-sm mb-1 opacity-50"
                    style={{ color: plan.highlighted ? store.color_background : store.color_text }}>
                    {plan.period}
                  </span>
                </div>
                <ul className="relative flex-1 space-y-3 mb-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm"
                      style={{ color: plan.highlighted ? `${store.color_background}cc` : `${store.color_text}cc` }}>
                      <span className="mt-0.5 shrink-0 text-xs" style={{ color: store.color_accent }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.a href={plan.cta_url || '#contact'}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="relative flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl"
                  style={{
                    backgroundColor: plan.highlighted ? store.color_accent : `${store.color_text}10`,
                    color: plan.highlighted ? store.color_background : store.color_text,
                  }}>
                  {plan.cta_label} →
                </motion.a>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export function GallerySection({ store, content }: { store: StoreConfig; content: GalleryContent }) {
  if (!content.images?.length) return null
  return (
    <section id="gallery" className="px-8 py-28 md:px-20">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="mb-12">
          <h2 className="font-black uppercase tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: store.color_text }}>
            {content.title}
          </h2>
        </FadeUp>
        <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {content.images.map((src, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className={`relative overflow-hidden rounded-2xl ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}>
                <Image src={src} alt="" fill sizes="(max-width:768px) 50vw, 33vw"
                  className="object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export function FaqSection({ store, content }: { store: StoreConfig; content: FaqContent }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="px-8 py-28 md:px-20">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="mb-16">
          <h2 className="font-black uppercase tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: store.color_text }}>
            {content.title}
          </h2>
        </FadeUp>

        <div className="space-y-3">
          {content.items.map((item, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div className="rounded-2xl overflow-hidden border"
                style={{ borderColor: `${store.color_text}12` }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-8 py-5 text-left"
                  style={{ backgroundColor: open === i ? `${store.color_accent}10` : store.color_background }}>
                  <span className="text-base font-bold pr-4" style={{ color: store.color_text }}>
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-2xl font-light"
                    style={{ color: store.color_accent }}>
                    +
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden">
                  <p className="px-8 pb-6 text-sm leading-relaxed opacity-60"
                    style={{ color: store.color_text }}>
                    {item.answer}
                  </p>
                </motion.div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export function ContactSection({ store, content }: { store: StoreConfig; content: ContactContent }) {
  const waLink = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`
    : null

  return (
    <section id="contact" className="relative px-8 py-32 md:px-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: store.color_primary }} />
      <div className="absolute inset-0 opacity-10"
        style={{ background: `radial-gradient(ellipse at 80% 50%, ${store.color_accent}, transparent 60%)` }} />

      <div className="relative max-w-2xl mx-auto text-center">
        <FadeUp>
          <h2 className="mb-6 font-black uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: store.color_background }}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="mb-12 text-base leading-relaxed opacity-60"
              style={{ color: store.color_background }}>
              {content.subtitle}
            </p>
          )}
        </FadeUp>

        <StaggerGrid className="flex flex-col items-center gap-4 max-w-xs mx-auto">
          {waLink && (
            <StaggerItem className="w-full">
              <motion.a href={waLink} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wide"
                style={{ backgroundColor: '#25D366', color: '#fff' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </motion.a>
            </StaggerItem>
          )}
          {store.email && (
            <StaggerItem className="w-full">
              <motion.a href={`mailto:${store.email}`}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wide border"
                style={{ borderColor: `${store.color_background}40`, color: store.color_background }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {store.email}
              </motion.a>
            </StaggerItem>
          )}
          {store.instagram_url && (
            <StaggerItem className="w-full">
              <motion.a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wide"
                style={{ color: `${store.color_background}60` }}>
                Instagram ↗
              </motion.a>
            </StaggerItem>
          )}
        </StaggerGrid>
      </div>
    </section>
  )
}
