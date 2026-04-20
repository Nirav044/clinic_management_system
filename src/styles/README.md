# 🎨 MediCore Design System

The visual identity of MediCore is built on a custom design system centered around **Glassmorphism**, **High Contrast**, and **Medicine-Themed Color Palettes**.

## 🎨 Token Architecture (`design-system.css`)
Our foundation is built with flexible CSS variables to ensure consistency and easy theming:

### **Color Palette (Indigo/Azure Base)**
- `--primary`: `#4f46e5` (Solid Brand Identity)
- `--primary-light`: `rgba(238, 242, 255, 0.5)` (Soft Backgrounds)
- `--primary-glow`: `rgba(79, 70, 229, 0.1)` (Sophisticated Hover States)
- `--surface`: `#ffffff` (Clean White Forms)
- `--bg-main`: `radial-gradient(circle, #f8fafc, #eff6ff)` (Soft Clinical Backgrounds)

## 🪟 UI Aesthetic: Glassmorphism
The platform utilizes high-fidelity transparency effects for a modern, elite look:
- **Backdrop Blur**: `backdrop-filter: blur(20px)` for high-level depth.
- **Micro-Shadows**: Subtle, multi-layered shadows to simulate elevation.
- **Rounded Edges**: `var(--radius-xl)` (16px - 24px) for a soft, professional feel.

## 📱 Responsive Breakpoints
We ensure the platform looks stunning on all devices:
- **Mobile**: `576px`
- **Tablet**: `768px`
- **Notebook**: `1024px`
- **Desktop**: `1440px`

## 📂 Implementation Flow
1. **Apply Tokens**: Define variables in `design-system.css`.
2. **Global Integration**: Import design system into `index.css`.
3. **Component Injection**: Use CSS Modules or Global Classes for ad-hoc component styles.

---
*Style with precision &middot; Built by MediCore Creative Team.*
