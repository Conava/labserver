<template>
  <div class="corel-auth-window">
    <button @click="authenticate">Start Authentication</button>
  </div>
</template>

<script>
export default {
  methods: {
    authenticate() {
      this.$emit('authenticate');
    }
  }
};
</script>

<style scoped>
.corel-auth-window {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

button {
  padding: 10px 20px;
  font-size: 1.2em;
}
</style>