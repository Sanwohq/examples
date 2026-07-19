<script setup lang="ts">
import CheckoutForm from "./components/CheckoutForm.vue";
</script>

<template>
  <div class="app">
    <CheckoutForm />
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  background: #f5f5f5;
  color: #333;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
