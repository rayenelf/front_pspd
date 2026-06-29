<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import Button from "@/components/ui/Button.vue";
import { chatApi, type ChatMessage } from "@/lib/chatApi";
import { reservationApi } from "@/lib/reservationApi";
import { getCurrentUser } from "@/lib/auth";
import type { Devis, Reservation } from "@/lib/reservation";

const props = defineProps<{
  reservation: Reservation;
  role: "CLIENT" | "PRESTATAIRE";
}>();

const emit = defineEmits<{ close: [] }>();

const myUid = getCurrentUser()?.uid ?? "";
const convId = ref<string | null>(null);
const messages = ref<ChatMessage[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const sending = ref(false);
const text = ref("");
const messagesEnd = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null);
const lastTs = ref<string | null>(null);
const imageUrls = ref(new Map<string, string>());

// Devis
const devis = ref<Devis | null>(null);
const showDevisForm = ref(false);
const devisForm = ref({ montant: 0, dureeEstimeeH: "" as string | number, conditions: "" });
const devisSubmitting = ref(false);
const devisError = ref<string | null>(null);
const devisAccepting = ref(false);
const devisRefusing = ref(false);

async function init() {
  loading.value = true;
  error.value = null;
  try {
    const conv = await chatApi.getOrCreate(props.reservation.id);
    convId.value = conv.id;
    messages.value = await chatApi.getMessages(conv.id);
    if (messages.value.length) lastTs.value = messages.value[messages.value.length - 1].envoyeLe;
    await loadImages(messages.value);
    await loadDevis();
    await nextTick();
    scrollBottom();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function loadDevis() {
  try {
    devis.value = await reservationApi.getDevis(props.reservation.id);
  } catch {
    devis.value = null;
  }
}

async function loadImages(msgs: ChatMessage[]) {
  if (!convId.value) return;
  for (const msg of msgs) {
    if (msg.pieceJointeUrl && !imageUrls.value.has(msg.id)) {
      try {
        const url = await chatApi.messageImageUrl(convId.value, msg.id);
        imageUrls.value.set(msg.id, url);
      } catch {
        // keep silent if image unavailable
      }
    }
  }
}

async function poll() {
  if (!convId.value) return;
  try {
    const newer = await chatApi.getMessages(convId.value, lastTs.value ?? undefined);
    if (newer.length) {
      messages.value.push(...newer);
      lastTs.value = newer[newer.length - 1].envoyeLe;
      await loadImages(newer);
      await nextTick();
      scrollBottom();
    }
    if (!devis.value) await loadDevis();
  } catch {
    // ignore poll errors silently
  }
}

async function send() {
  if (!text.value.trim() || !convId.value || sending.value) return;
  sending.value = true;
  error.value = null;
  try {
    const msg = await chatApi.sendMessage(convId.value, text.value.trim());
    messages.value.push(msg);
    lastTs.value = msg.envoyeLe;
    text.value = "";
    await nextTick();
    scrollBottom();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    sending.value = false;
  }
}

async function uploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !convId.value) return;
  sending.value = true;
  error.value = null;
  try {
    const msg = await chatApi.sendImage(convId.value, file);
    messages.value.push(msg);
    lastTs.value = msg.envoyeLe;
    if (msg.pieceJointeUrl) {
      const url = await chatApi.messageImageUrl(convId.value, msg.id);
      imageUrls.value.set(msg.id, url);
    }
    await nextTick();
    scrollBottom();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    sending.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
}

async function submitDevis() {
  if (!devisForm.value.montant || devisSubmitting.value || !convId.value) return;
  devisSubmitting.value = true;
  devisError.value = null;
  try {
    const duree = Number(devisForm.value.dureeEstimeeH) || null;
    devis.value = await reservationApi.creerDevis(props.reservation.id, {
      montant: Number(devisForm.value.montant),
      dureeEstimeeH: duree,
      conditions: devisForm.value.conditions.trim() || null,
    });
    showDevisForm.value = false;
    const label = `Devis envoyé : ${devisForm.value.montant} TND${duree ? ` · ${duree}h` : ""}`;
    const msg = await chatApi.sendMessage(convId.value, label);
    messages.value.push(msg);
    lastTs.value = msg.envoyeLe;
    await nextTick();
    scrollBottom();
  } catch (e) {
    devisError.value = (e as Error).message;
  } finally {
    devisSubmitting.value = false;
  }
}

async function accepterDevis() {
  if (devisAccepting.value || !convId.value) return;
  devisAccepting.value = true;
  error.value = null;
  try {
    devis.value = await reservationApi.accepterDevis(props.reservation.id);
    const msg = await chatApi.sendMessage(convId.value, "Devis accepté.");
    messages.value.push(msg);
    lastTs.value = msg.envoyeLe;
    await nextTick();
    scrollBottom();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    devisAccepting.value = false;
  }
}

async function refuserDevis() {
  if (devisRefusing.value || !convId.value) return;
  devisRefusing.value = true;
  error.value = null;
  try {
    devis.value = await reservationApi.refuserDevis(props.reservation.id);
    const msg = await chatApi.sendMessage(convId.value, "Devis refusé.");
    messages.value.push(msg);
    lastTs.value = msg.envoyeLe;
    await nextTick();
    scrollBottom();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    devisRefusing.value = false;
  }
}

function openImage(url: string) {
  window.open(url, "_blank");
}

function scrollBottom() {
  messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

onMounted(async () => {
  await init();
  pollTimer.value = setInterval(poll, 3000);
});

onUnmounted(() => {
  if (pollTimer.value) clearInterval(pollTimer.value);
  imageUrls.value.forEach((url) => URL.revokeObjectURL(url));
});
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-end justify-end bg-black/40 sm:items-center sm:justify-center"
    @click.self="emit('close')"
  >
    <!-- Panel -->
    <div
      class="flex h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-background shadow-2xl sm:h-[80vh] sm:rounded-2xl"
    >
      <!-- ── Header ── -->
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p class="text-sm font-semibold">Discussion</p>
          <p class="text-xs text-muted-foreground">
            Réservation {{ reservation.id.slice(0, 8).toUpperCase() }}
          </p>
        </div>
        <button type="button" class="rounded-full p-1.5 hover:bg-muted" @click="emit('close')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- ── Devis banner (client, devis en attente) ── -->
      <div
        v-if="role === 'CLIENT' && devis && devis.statut === 'ENVOYE'"
        class="border-b border-border bg-primary/5 px-4 py-3"
      >
        <p class="text-sm font-medium">
          Devis reçu :
          <span class="font-bold text-primary">{{ devis.montant }} TND</span>
          <span v-if="devis.dureeEstimeeH" class="text-muted-foreground">
            &nbsp;· {{ devis.dureeEstimeeH }}h
          </span>
        </p>
        <p v-if="devis.conditions" class="mt-0.5 text-xs text-muted-foreground">
          {{ devis.conditions }}
        </p>
        <div class="mt-2 flex gap-2">
          <Button size="sm" :disabled="devisAccepting" @click="accepterDevis">
            {{ devisAccepting ? "…" : "Accepter" }}
          </Button>
          <Button size="sm" variant="destructive" :disabled="devisRefusing" @click="refuserDevis">
            {{ devisRefusing ? "…" : "Refuser" }}
          </Button>
        </div>
      </div>

      <!-- ── Devis status (accepted / refused) ── -->
      <div
        v-else-if="devis && (devis.statut === 'ACCEPTE' || devis.statut === 'REFUSE')"
        class="border-b border-border px-4 py-2 text-xs"
        :class="
          devis.statut === 'ACCEPTE'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        "
      >
        Devis {{ devis.statut === "ACCEPTE" ? "accepté" : "refusé" }} · {{ devis.montant }} TND
      </div>

      <!-- ── Messages ── -->
      <div class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div
          v-if="loading"
          class="flex h-full items-center justify-center text-sm text-muted-foreground"
        >
          Chargement…
        </div>
        <div
          v-else-if="messages.length === 0"
          class="flex h-full items-center justify-center text-sm text-muted-foreground"
        >
          Démarrez la conversation.
        </div>
        <template v-else>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.auteurId === myUid ? 'justify-end' : 'justify-start'"
          >
            <div class="max-w-[75%]">
              <p
                class="mb-1 text-xs text-muted-foreground"
                :class="msg.auteurId === myUid ? 'text-right' : ''"
              >
                {{ msg.auteurNom }} · {{ formatTime(msg.envoyeLe) }}
              </p>
              <!-- Image message -->
              <template v-if="msg.pieceJointeUrl">
                <img
                  v-if="imageUrls.get(msg.id)"
                  :src="imageUrls.get(msg.id)"
                  class="max-h-48 w-auto cursor-pointer rounded-xl object-cover"
                  @click="openImage(imageUrls.get(msg.id)!)"
                />
                <div
                  v-else
                  class="flex h-24 w-40 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground"
                >
                  Chargement…
                </div>
              </template>
              <!-- Text message -->
              <div
                v-else
                class="rounded-2xl px-3 py-2 text-sm"
                :class="
                  msg.auteurId === myUid
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm bg-muted text-foreground'
                "
              >
                {{ msg.contenu }}
              </div>
            </div>
          </div>
        </template>
        <div ref="messagesEnd" />
      </div>

      <!-- ── Devis form (prestataire) ── -->
      <div
        v-if="role === 'PRESTATAIRE' && showDevisForm"
        class="space-y-2 border-t border-border bg-muted/30 px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Créer un devis
        </p>
        <p v-if="devisError" class="text-xs text-destructive">{{ devisError }}</p>
        <div class="flex gap-2">
          <div class="flex-1">
            <label class="text-xs text-muted-foreground">Montant (TND) *</label>
            <input
              v-model.number="devisForm.montant"
              type="number"
              min="0"
              step="0.5"
              class="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="w-24">
            <label class="text-xs text-muted-foreground">Durée (h)</label>
            <input
              v-model="devisForm.dureeEstimeeH"
              type="number"
              min="0"
              step="0.5"
              class="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <textarea
          v-model="devisForm.conditions"
          rows="2"
          placeholder="Conditions, remarques…"
          class="w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div class="flex gap-2">
          <Button
            size="sm"
            :disabled="devisSubmitting || !devisForm.montant"
            @click="submitDevis"
          >
            {{ devisSubmitting ? "Envoi…" : "Envoyer le devis" }}
          </Button>
          <Button size="sm" variant="ghost" @click="showDevisForm = false">Annuler</Button>
        </div>
      </div>

      <!-- ── Input bar ── -->
      <div class="border-t border-border px-3 py-3">
        <p v-if="error" class="mb-2 text-xs text-destructive">{{ error }}</p>
        <div class="flex items-end gap-2">
          <!-- Image upload -->
          <button
            type="button"
            title="Envoyer une image"
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full hover:bg-muted"
            @click="fileInput?.click()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="uploadImage" />

          <!-- Devis button (prestataire, no devis yet) -->
          <button
            v-if="role === 'PRESTATAIRE' && !devis"
            type="button"
            class="flex h-9 flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20"
            @click="showDevisForm = !showDevisForm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Devis
          </button>

          <!-- Text input -->
          <textarea
            v-model="text"
            rows="1"
            placeholder="Écrivez un message…"
            style="max-height: 100px; overflow-y: auto"
            class="flex-1 resize-none rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            @keydown.enter.exact.prevent="send"
          />

          <!-- Send -->
          <button
            type="button"
            :disabled="!text.trim() || sending"
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            @click="send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
