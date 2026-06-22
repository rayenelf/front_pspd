<script setup lang="ts">
// Gestion des sessions/appareils connectés (#3).
import { ref, computed, onMounted } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import { api, type SessionData, type ApiError } from "@/lib/api";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const sessions = ref<SessionData[]>([]);
const loading  = ref(true);
const message  = ref<{ type: "success" | "error"; text: string } | null>(null);

// Un même appareil génère une session par connexion (chaque login crée un sid).
// On regroupe par appareil + IP pour n'afficher qu'une ligne par appareil,
// en conservant la dernière activité et la liste des sid à révoquer ensemble.
interface DeviceGroup {
  key: string;
  device: string;
  ip: string;
  lastSeenAt: string;
  current: boolean;
  sids: string[];
}

const deviceGroups = computed<DeviceGroup[]>(() => {
  const map = new Map<string, DeviceGroup>();
  for (const s of sessions.value) {
    const key = `${s.device}|${s.ip}`;
    const g = map.get(key);
    if (!g) {
      map.set(key, { key, device: s.device, ip: s.ip, lastSeenAt: s.lastSeenAt, current: s.current, sids: [s.sid] });
    } else {
      g.sids.push(s.sid);
      g.current = g.current || s.current;
      if (s.lastSeenAt > g.lastSeenAt) g.lastSeenAt = s.lastSeenAt; // ISO → comparable
    }
  }
  // Appareil courant en premier, puis par activité la plus récente.
  return [...map.values()].sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1;
    return b.lastSeenAt.localeCompare(a.lastSeenAt);
  });
});

function shortDevice(ua: string): string {
  if (!ua) return t("account.sessions.unknownDevice");
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) return "Android";
  if (/mac/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows";
  if (/linux/i.test(ua)) return "Linux";
  return ua.slice(0, 40);
}

function fmt(iso: string): string {
  try { return new Date(iso).toLocaleString(locale.value === "fr" ? "fr-FR" : "en-US", { dateStyle: "short", timeStyle: "short" }); }
  catch { return iso; }
}

async function load() {
  loading.value = true;
  try {
    sessions.value = await api.getSessions();
  } catch {
    message.value = { type: "error", text: t("account.sessions.errLoad") };
  } finally {
    loading.value = false;
  }
}

// Révoque toutes les sessions de l'appareil (le groupe affiché n'est jamais courant).
async function revokeGroup(g: DeviceGroup) {
  try {
    await Promise.all(g.sids.map((sid) => api.revokeSession(sid)));
    const removed = new Set(g.sids);
    sessions.value = sessions.value.filter((s) => !removed.has(s.sid));
  } catch (e) {
    message.value = { type: "error", text: (e as ApiError).message || t("account.sessions.errLogout") };
  }
}

async function revokeOthers() {
  try {
    await api.logoutAllSessions();
    message.value = { type: "success", text: t("account.sessions.logoutOk") };
    await load();
  } catch (e) {
    message.value = { type: "error", text: (e as ApiError).message || t("account.sessions.errGeneric") };
  }
}

onMounted(load);
</script>

<template>
  <PanelCard :title="$t('account.sessions.title')">
    <p v-if="loading" class="text-sm text-muted-foreground">{{ $t("account.sessions.loading") }}</p>

    <ul v-else class="space-y-2 text-sm">
      <li
        v-for="g in deviceGroups"
        :key="g.key"
        class="flex items-center justify-between rounded-lg border border-border p-3"
      >
        <div>
          <p class="font-medium flex items-center gap-2">
            {{ shortDevice(g.device) }}
            <Badge v-if="g.current" variant="default">{{ $t("account.sessions.thisDevice") }}</Badge>
            <span v-if="g.sids.length > 1" class="text-xs font-normal text-muted-foreground">
              {{ $t("account.sessions.sessionCount", { count: g.sids.length }) }}
            </span>
          </p>
          <p class="text-xs text-muted-foreground">
            {{ $t("account.sessions.ipSeen", { ip: g.ip || "—", date: fmt(g.lastSeenAt) }) }}
          </p>
        </div>
        <Button
          v-if="!g.current"
          variant="outline"
          size="sm"
          @click="revokeGroup(g)"
        >
          {{ $t("account.sessions.disconnect") }}
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
      {{ $t("account.sessions.disconnectOthers") }}
    </Button>
  </PanelCard>
</template>
