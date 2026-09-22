# Prompt: Goo / Nexus Startup Landing — Pixel-Perfect Reproduction

Reproduce this component pixel-perfect in React or Next.js. Maintain exact styling, animations, and component structure.

## Stack
- React + Vite / Next.js
- Tailwind CSS (bg-zinc-950, white/5 borders, blur, gradients)
- framer-motion (useScroll, useTransform, useSpring, useMotionValue)
- lucide-react icons

## Page Structure
`GooPage` tracks global mousePosition and sets CSS variables --mouse-x / --mouse-y, renders:
BackgroundGradient, Navbar, HeroSection, LogosSection, BentoGrid, WorkflowSection, StatsSection, IntegrationsSection, PricingSection, TestimonialSection, FAQSection, GooTeam, GooNewsletter, CallToAction

All sections, classNames, animations, and component hierarchy must be preserved 1:1. No simplification. Use `cn` from `@/src/lib/utils` for conditional classes.

## Acceptance
- Pixel diff <1%
- All hover / scroll / motion effects preserved
- Responsive breakpoints identical (md: grid-cols-3, etc.)
- Export path: `@/src/components/CoreLandingPages/StartupLandingPages/tsx/Goo`
