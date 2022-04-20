<script setup lang="ts">
import type { Card } from "@/blackjack/card";

defineProps<{
  card: Card;
}>();
</script>

<template>
  <!-- <p class="text-slate-900 font-extrabold text-l text-center">
    {{ card.rank }} of
    {{ card.suit }}
  </p> -->

  <img
    :src="`cards/${card.rank}_of_${card.suit}.svg`"
    width="100"
    class="float-left m-auto"
  />
</template>
