<script setup lang="ts">
import type { Card } from "@/blackjack/card";

defineProps<{
  card: Card;
}>();
</script>

<template>
  <p class="text-slate-900 font-extrabold text-m text-center">
    {{ card.rank }} of
    {{ card.suit }}
  </p>
</template>

<style scoped></style>
