<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{ value: string; class?: string }>();
const ctx = inject<{ active: Ref<string> }>("tabs-context");
const show = computed(() => ctx?.active.value === props.value);
const classes = computed(() => cn("mt-2 focus-visible:outline-none", props.class));
</script>

<template>
  <div v-if="show" role="tabpanel" :class="classes"><slot /></div>
</template>
