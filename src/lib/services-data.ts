import {
  Sparkles, Wrench, Droplets, Zap, Trees, Snowflake, WashingMachine,
  Truck, Paintbrush, GraduationCap, Baby, Laptop, Package, Boxes,
} from "lucide-vue-next";
import type { Component } from "vue";

export type ServiceCategory = {
  slug: string;
  name: string;
  tagline: string;
  icon: Component;
  hue: string;
  startingAt: number;
  duration: string;
};

export const services: ServiceCategory[] = [
  { slug: "menage", name: "Ménage", tagline: "Maison propre, esprit léger", icon: Sparkles, hue: "from-amber-200 to-orange-300", startingAt: 25, duration: "2h" },
  { slug: "bricolage", name: "Bricolage", tagline: "Petites mains, gros résultats", icon: Wrench, hue: "from-orange-200 to-rose-300", startingAt: 30, duration: "1h" },
  { slug: "plomberie", name: "Plomberie", tagline: "Fuite ? Réparée.", icon: Droplets, hue: "from-sky-200 to-cyan-300", startingAt: 40, duration: "1h" },
  { slug: "electricite", name: "Électricité", tagline: "En toute sécurité", icon: Zap, hue: "from-yellow-200 to-amber-300", startingAt: 40, duration: "1h" },
  { slug: "jardinage", name: "Jardinage", tagline: "Un extérieur qui respire", icon: Trees, hue: "from-emerald-200 to-green-300", startingAt: 35, duration: "2h" },
  { slug: "climatisation", name: "Climatisation", tagline: "Confort toute l'année", icon: Snowflake, hue: "from-cyan-200 to-blue-300", startingAt: 50, duration: "1h30" },
  { slug: "electromenager", name: "Électroménager", tagline: "Réparation rapide", icon: WashingMachine, hue: "from-violet-200 to-purple-300", startingAt: 45, duration: "1h" },
  { slug: "demenagement", name: "Déménagement", tagline: "On porte, on roule", icon: Truck, hue: "from-orange-200 to-amber-300", startingAt: 120, duration: "4h" },
  { slug: "peinture", name: "Peinture", tagline: "Murs comme neufs", icon: Paintbrush, hue: "from-rose-200 to-pink-300", startingAt: 60, duration: "3h" },
  { slug: "soutien-scolaire", name: "Soutien scolaire", tagline: "Réussir, ensemble", icon: GraduationCap, hue: "from-indigo-200 to-blue-300", startingAt: 20, duration: "1h" },
  { slug: "garde-enfants", name: "Garde d'enfants", tagline: "Personnes de confiance", icon: Baby, hue: "from-pink-200 to-rose-300", startingAt: 18, duration: "1h" },
  { slug: "informatique", name: "Informatique", tagline: "Dépannage à domicile", icon: Laptop, hue: "from-slate-200 to-zinc-300", startingAt: 35, duration: "1h" },
  { slug: "livraison", name: "Livraison", tagline: "Rapide et fiable", icon: Package, hue: "from-amber-200 to-yellow-300", startingAt: 15, duration: "30min" },
  { slug: "montage-meubles", name: "Montage meubles", tagline: "Plus de notice cassée", icon: Boxes, hue: "from-orange-200 to-rose-300", startingAt: 30, duration: "1h30" },
];

export function findService(slug: string) {
  return services.find((s) => s.slug === slug);
}
