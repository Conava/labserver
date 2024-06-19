<template>
  <div class="corel-auth-window">
    <div v-if="isLoading" class="loading">
      <div v-for="i in 8" :key="i" class="dot"></div>
    </div>
    <div>
      <button @click="authenticate">Start Authentication</button>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false
    }
  },
  methods: {
    async authenticate() {
      this.isLoading = true;
      await new Promise(resolve => {
        this.$emit('authenticate', resolve);
      });
      this.isLoading = false;
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  position: relative;
  animation: rotate 2s linear infinite;
}

.dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--accent-color);
  border-radius: 50%;
}

.dot:nth-child(1) { transform: rotate(0deg) translate(35px); }
.dot:nth-child(2) { transform: rotate(45deg) translate(35px); }
.dot:nth-child(3) { transform: rotate(90deg) translate(35px); }
.dot:nth-child(4) { transform: rotate(135deg) translate(35px); }
.dot:nth-child(5) { transform: rotate(180deg) translate(35px); }
.dot:nth-child(6) { transform: rotate(225deg) translate(35px); }
.dot:nth-child(7) { transform: rotate(270deg) translate(35px); }
.dot:nth-child(8) { transform: rotate(315deg) translate(35px); }

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>