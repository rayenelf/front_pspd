<script setup lang="ts">
// Gestion des sessions/appareils connectés (#3).
import { ref, onMounted } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import { api, type SessionData, type ApiError } from "@/lib/api";

const sessions = ref<SessionData[]>([]);
const loading  = ref(true);
const message  = ref<{ type: "success" | "error"; text: string } | null>(null);

function shortDevice(ua: string): string {
  if (!ua) return "Appareil inconnu";
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) return "Android";
  if (/mac/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows";
  if (/linux/i.test(ua)) return "Linux";
  return ua.slice(0, 40);
}

function fmt(iso: string): string {
  try { return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }); }
  catch { return iso; }
}

async function load() {
  loading.value = true;
  try {
    sessions.value = await api.getSessions();
  } catch {
    message.value = { type: "error", text: "Impossible de charger les sessions." };
  } finally {
    loading.value = false;
  }
}

async function revoke(sid: string) {
  try {
    await api.revokeSession(sid);
    sessions.value = sessions.value.filter((s) => s.sid !== sid);
  } catch (e) {
    message.value = { type: "error", text: (e as ApiError).message || "Échec de la déconnexion." };
  }
}

async function revokeOthers() {
  try {
    await api.logoutAllSessions();
    message.value = { type: "success", text: "Tous les autres appareils ont été déconnectés." };
    await load();
  } catch (e) {
    message.value = { type: "error", text: (e as ApiError).message || "Échec de l'opération." };
  }
}

onMounted(load);
</script>

<template>
  <PanelCard title="Appareils connectés">
    <p v-if="loading" class="text-sm text-muted-foreground">Chargement…</p>

    <ul v-else class="space-y-2 text-sm">
      <li
        v-for="s in sessions"
        :key="s.sid"
        class="flex items-center justify-between rounded-lg border border-border p-3"
      >
        <div>
          <p class="font-medium flex items-center gap-2">
            {{ shortDevice(s.device) }}
            <Badge v-if="s.current" variant="default">Cet appareil</Badge>
          </p>
          <p class="text-xs text-muted-foreground">
            IP {{ s.ip || "—" }} · vu le {{ fmt(s.lastSeenAt) }}
          </p>
        </div>
        <Button
          v-if="!s.current"
          variant="outline"
          size="sm"
          @click="revoke(s.sid)"
        >
          Déconnecter
        </Button>
      </li>
    </ul>

    <p v-if="message" :class="[
      'mt-3 rounded-md px-3 py-2 text-xs font-medium',
      message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    ]">{{ message.text }}</p>

    <Button
      v-if="sessions.length > 1"
      variant="outline"
      class="mt-4"
      @click="revokeOthers"
    >
      Déconnecter tous les autres appareils
    </Button>
  </PanelCard>
</template>
