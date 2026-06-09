<script setup lang="ts">
import Navbar from "./Navbar.vue";
import Footer from "./Footer.vue";
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <main class="flex-1"><slot /></main>
    <Footer />
  </div>
</template>
