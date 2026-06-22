<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { onClickOutside } from "@vueuse/core";
import { Globe, Check, ChevronDown } from "lucide-vue-next";
import { SUPPORTED_LOCALES, setLocale, type AppLocale } from "@/i18n";

const { locale } = useI18n();

// Nom natif de chaque langue (ne se traduit pas).
const nativeName: Record<AppLocale, string> = {
  fr: "Français",
  en: "English",
};

const open = ref(false);
const root = ref<HTMLElement | null>(null);
onClickOutside(root, () => (open.value = false));

function select(l: AppLocale) {
  setLocale(l);
  open.value = false;
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      @click="open = !open"
      :aria-label="$t('lang.label')"
      :aria-expanded="open"
      class="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:text-foreground"
    >
      <Globe class="h-4 w-4" />
      <span class="uppercase">{{ locale }}</span>
      <ChevronDown class="h-3.5 w-3.5 transition-transform" :class="open && 'rotate-180'" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <ul
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg ring-1 ring-black/5"
        role="listbox"
      >
        <li v-for="l in SUPPORTED_LOCALES" :key="l">
          <button
            type="button"
            @click="select(l)"
            role="option"
            :aria-selected="locale === l"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
            :class="locale === l
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-foreground/80 hover:bg-muted'"
          >
            <span class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase text-muted-foreground">{{ l }}</span>
              {{ nativeName[l] }}
            </span>
            <Check v-if="locale === l" class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
