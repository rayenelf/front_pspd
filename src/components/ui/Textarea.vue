<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  class?: string;
  disabled?: boolean;
  rows?: number;
  id?: string;
  name?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const classes = computed(() =>
  cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    props.class
  )
);
</script>

<template>
  <textarea
    :id="id"
    :name="name"
    :placeholder="placeholder"
    :disabled="disabled"
    :rows="rows"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :class="classes"
  />
</template>
