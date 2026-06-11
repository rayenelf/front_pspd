<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import { useAuthStore } from "@/stores/auth";
import { api, type ApiError } from "@/lib/api";

const route  = useRoute();
const router = useRouter();
const auth   = useAuthStore();

const email = ref((route.query.email as string) ?? "");

// ── Saisie OTP ─────────────────────────────────────────────────────────────
const digits     = ref<string[]>(Array(6).fill(""));
const inputRefs  = ref<HTMLInputElement[]>([]);
const otpCode    = computed(() => digits.value.join(""));
const isComplete = computed(() => otpCode.value.length === 6 && !/\D/.test(otpCode.value));

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement;
  const val   = input.value.replace(/\D/g, "").slice(-1);
  digits.value[index] = val;
  input.value = val;
  if (val && index < 5) inputRefs.value[index + 1]?.focus();
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === "Backspace" && !digits.value[index] && index > 0) {
    digits.value[index - 1] = "";
    inputRefs.value[index - 1]?.focus();
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData("text") ?? "";
  const nums  = text.replace(/\D/g, "").slice(0, 6).split("");
  nums.forEach((n, i) => { digits.value[i] = n; });
  inputRefs.value[Math.min(nums.length, 5)]?.focus();
}

// ── Compte à rebours ───────────────────────────────────────────────────────
const countdown  = ref(300);   // 5 min en secondes
const canResend  = ref(false);
let   timer: ReturnType<typeof setInterval> | null = null;

function startCountdown() {
  if (timer) clearInterval(timer);
  countdown.value = 300;
  canResend.value = false;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer!);
      canResend.value = true;
    }
  }, 1000);
}

const countdownDisplay = computed(() => {
  const m = Math.floor(countdown.value / 60).toString().padStart(2, "0");
  const s = (countdown.value % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});

// ── Envoi / renvoi OTP ──────────────────────────────────────────────────────
const sendError = ref<string | null>(null);

async function sendOtp() {
  if (!email.value) return;
  sendError.value = null;
  try {
    await api.send2faOtp(email.value);
    startCountdown();
  } catch {
    sendError.value = "Impossible d'envoyer le code. Réessayez.";
  }
}

// ── Soumission ──────────────────────────────────────────────────────────────
const submitting = ref(false);
const error      = ref<string | null>(null);

async function submit() {
  if (!isComplete.value) return;
  submitting.value = true;
  error.value = null;
  try {
    const response = await api.verify2fa(email.value, otpCode.value);
    auth.setSession(response.accessToken, response.refreshToken);
    router.replace(auth.homeRoute);
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 429) {
      error.value = "Trop de tentatives incorrectes. Demandez un nouveau code.";
      canResend.value = true;
      if (timer) clearInterval(timer);
    } else {
      error.value = err.message || "Code incorrect. Réessayez.";
    }
    digits.value = Array(6).fill("");
    inputRefs.value[0]?.focus();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (!email.value) {
    router.replace("/auth/login");
    return;
  }
  sendOtp();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <AuthLayout
    title="Vérification en deux étapes"
    subtitle="Un code à 6 chiffres a été envoyé à votre adresse."
  >
    <div class="space-y-6">

      <!-- Email affiché -->
      <p class="text-center text-sm text-muted-foreground">
        Code envoyé à <span class="font-medium text-foreground">{{ email }}</span>
      </p>

      <!-- Inputs OTP -->
      <div class="flex justify-center gap-2" @paste="handlePaste">
        <input
          v-for="i in 6"
          :key="i"
          :ref="(el) => { if (el) inputRefs[i - 1] = el as HTMLInputElement }"
          :value="digits[i - 1]"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="1"
          :class="[
            'h-14 w-11 rounded-lg border text-center text-xl font-bold transition',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            digits[i - 1] ? 'border-primary bg-primary/5' : 'border-border bg-background',
          ]"
          @input="handleInput(i - 1, $event)"
          @keydown="handleKeydown(i - 1, $event)"
        />
      </div>

      <!-- Erreur -->
      <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-700">
        {{ error }}
      </p>

      <!-- Bouton vérifier -->
      <Button
        class="w-full bg-gradient-warm text-primary-foreground shadow-glow"
        :disabled="!isComplete || submitting"
        @click="submit"
      >
        {{ submitting ? "Vérification…" : "Vérifier le code" }}
      </Button>

      <!-- Renvoi + countdown -->
      <div class="text-center text-sm text-muted-foreground">
        <template v-if="canResend">
          <button
            class="font-semibold text-primary hover:underline"
            @click="sendOtp"
          >
            Renvoyer un nouveau code
          </button>
        </template>
        <template v-else>
          Renvoyer dans
          <span class="font-medium tabular-nums text-foreground">{{ countdownDisplay }}</span>
        </template>
      </div>

      <p v-if="sendError" class="text-center text-xs text-red-600">{{ sendError }}</p>
    </div>

    <template #footer>
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">
        Retour à la connexion
      </RouterLink>
    </template>
  </AuthLayout>
</template>
