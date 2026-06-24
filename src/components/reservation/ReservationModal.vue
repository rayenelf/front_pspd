<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/ui/Button.vue";
import { reservationApi } from "@/lib/reservationApi";
import type { ServiceData } from "@/lib/api";
import { X, CalendarDays, Clock, FileText } from "lucide-vue-next";

const props = defineProps<{
  prestataireId: string;
  nomCommercial: string;
  services: ServiceData[];
}>();

const emit = defineEmits<{ close: [] }>();

const router = useRouter();

const serviceId  = ref(props.services[0]?.id ?? "");
const dateService = ref("");
const heureService = ref("09:00");
const description = ref("");
const loading = ref(false);
const error   = ref<string | null>(null);

const today = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
});

async function submit() {
  if (!serviceId.value || !dateService.value || !heureService.value) return;
  loading.value = true;
  error.value   = null;
  try {
    await reservationApi.creer({
      prestataireId: props.prestataireId,
      serviceId:     serviceId.value,
      dateService:   dateService.value,
      heureService:  heureService.value,
      description:   description.value || undefined,
    });
    emit("close");
    router.push("/client/reservations");
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
      <!-- Header -->
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="font-display text-lg font-bold">Réserver une prestation</h2>
          <p class="text-sm text-muted-foreground">{{ nomCommercial }}</p>
        </div>
        <button @click="emit('close')" class="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
          <X class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- Service -->
        <div>
          <label class="mb-1 block text-sm font-medium">Service</label>
          <select v-model="serviceId" required
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option v-for="s in services" :key="s.id" :value="s.id">
              {{ s.libelle }}{{ s.prixIndicatif ? ` — à partir de ${s.prixIndicatif} TND` : "" }}
            </option>
          </select>
          <p v-if="!services.length" class="mt-1 text-xs text-destructive">
            Ce prestataire n'a pas de service disponible.
          </p>
        </div>

        <!-- Date -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            <CalendarDays class="mr-1 inline h-4 w-4" />Date souhaitée
          </label>
          <input v-model="dateService" type="date" :min="today" required
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <!-- Heure -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            <Clock class="mr-1 inline h-4 w-4" />Heure souhaitée
          </label>
          <input v-model="heureService" type="time" required
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <!-- Description -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            <FileText class="mr-1 inline h-4 w-4" />Description (optionnel)
          </label>
          <textarea v-model="description" rows="3" placeholder="Décrivez votre besoin..."
            class="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex gap-3 pt-1">
          <Button type="button" variant="outline" class="flex-1" @click="emit('close')">Annuler</Button>
          <Button type="submit" class="flex-1 bg-gradient-warm text-primary-foreground"
            :disabled="loading || !services.length">
            {{ loading ? "Envoi…" : "Confirmer la réservation" }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
