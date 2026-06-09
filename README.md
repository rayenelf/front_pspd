# joy-bloom-vue

Version Vue 3 du projet `joy-bloom-interface` (TanStack Start + React).
UI 100% identique — même design system Tailwind v4, mêmes composants visuels, mêmes pages.

## Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router 4** — routing
- **Vite 7** — bundler
- **TypeScript 5**
- **Tailwind CSS v4** — design system (oklch, polices Sora + Inter)
- **lucide-vue-next** — icônes
- **class-variance-authority** + **tailwind-merge** — variants UI

## Installation

```bash
cd ~/Desktop/joy-bloom-vue
npm install
npm run dev
```

Ouvrir http://localhost:5173.

## Structure

```
src/
├── assets/                 # Images (hero, pros)
├── components/
│   ├── auth/              # AuthLayout
│   ├── dashboard/         # DashboardShell, StatCard, PanelCard
│   ├── site/              # Navbar, Footer, Hero, Stats, etc.
│   └── ui/                # Button, Input, Card, Badge, etc.
├── lib/                   # utils (cn), services-data
├── router/                # Vue Router config
├── styles/                # main.css (design tokens)
└── views/                 # Pages
    ├── Home.vue
    ├── services/          # Services + ServiceDetail
    ├── auth/              # Login, Signup, ForgotPassword
    ├── client/            # Espace client (5 pages)
    ├── pro/               # Espace prestataire (6 pages)
    └── admin/             # Back-office (6 pages)
```

## Routes

- `/` — Accueil Domivo
- `/services` — Liste de toutes les catégories
- `/services/:slug` — Détail d'un service + pros disponibles
- `/comment-ca-marche`
- `/devenir-prestataire`
- `/auth/login` `/auth/signup` `/auth/forgot-password`
- `/client` `/client/reservations` `/client/factures` `/client/favoris` `/client/profil`
- `/pro` `/pro/missions` `/pro/agenda` `/pro/devis` `/pro/avis` `/pro/profil`
- `/admin` `/admin/utilisateurs` `/admin/prestataires` `/admin/finances` `/admin/contenus` `/admin/signalements`
