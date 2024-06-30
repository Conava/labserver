<template>
  <div class="corel-auth-window card">
    <h2>Authentication</h2>
    <p>Please click the button below to start the authentication process.</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    async authenticate() {
      this.isLoading = true;
      try {
        await new Promise((resolve, reject) => {
          this.$emit('authenticate', { resolve, reject });
        });
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.corel-auth-window {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
}

.card {
  width: 400px;
  padding: 20px;
  text-align: center;
  margin: auto; /* Center the card horizontally */
  max-height: 20vh; /* Limit the height to 90% of the viewport height */
  overflow-y: auto; /* Add a scrollbar if the content exceeds the max height */
}

button {
  padding: 10px 20px;
  font-size: 1.2em;
}

.error-message {
  color: #a61a1a;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  margin-top: 20px;
  border-radius: 5px;
  padding: 10px 10px;
  outline: none;
  text-align: center;
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

.dot:nth-child(1) {
  transform: rotate(0deg) translate(35px);
}

.dot:nth-child(2) {
  transform: rotate(45deg) translate(35px);
}

.dot:nth-child(3) {
  transform: rotate(90deg) translate(35px);
}

.dot:nth-child(4) {
  transform: rotate(135deg) translate(35px);
}

.dot:nth-child(5) {
  transform: rotate(180deg) translate(35px);
}

.dot:nth-child(6) {
  transform: rotate(225deg) translate(35px);
}

.dot:nth-child(7) {
  transform: rotate(270deg) translate(35px);
}

.dot:nth-child(8) {
  transform: rotate(315deg) translate(35px);
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>