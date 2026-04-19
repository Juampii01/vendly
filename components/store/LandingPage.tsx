import type { StoreConfig, LandingSection, HeroContent, AboutContent, ServicesContent, TestimonialsContent, PricingContent, GalleryContent, FaqContent, ContactContent } from '@/types'

// Client section components
import { HeroSection } from './landing/HeroSection'
import { TestimonialsSlider } from './landing/TestimonialsSlider'
import { AboutSection, ServicesSection, PricingSection, GallerySection, FaqSection, ContactSection } from './landing/Sections'

interface Props {
  store: StoreConfig
  sections: LandingSection[]
}

export function LandingPage({ store, sections }: Props) {
  const active = sections.filter(s => s.active)

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>
      {active.map(section => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} store={store} content={section.content as HeroContent} />
          case 'about':
            return <AboutSection key={section.id} store={store} content={section.content as AboutContent} />
          case 'services':
            return <ServicesSection key={section.id} store={store} content={section.content as ServicesContent} />
          case 'testimonials':
            return <TestimonialsSlider key={section.id} store={store} content={section.content as TestimonialsContent} />
          case 'pricing':
            return <PricingSection key={section.id} store={store} content={section.content as PricingContent} />
          case 'gallery':
            return <GallerySection key={section.id} store={store} content={section.content as GalleryContent} />
          case 'faq':
            return <FaqSection key={section.id} store={store} content={section.content as FaqContent} />
          case 'contact':
            return <ContactSection key={section.id} store={store} content={section.content as ContactContent} />
          default:
            return null
        }
      })}
    </div>
  )
}
