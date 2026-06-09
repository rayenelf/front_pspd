<script setup lang="ts">
import { provide, ref, watch } from "vue";

const props = defineProps<{ modelValue?: string; defaultValue?: string; class?: string }>();
const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const active = ref<string>(props.modelValue ?? props.defaultValue ?? "");

watch(() => props.modelValue, (v) => {
  if (v !== undefined && v !== active.value) active.value = v;
});

function setValue(v: string) {
  active.value = v;
  emit("update:modelValue", v);
}

provide("tabs-context", { active, setValue });
</script>

<template>
  <div :class="props.class"><slot /></div>
</template>
