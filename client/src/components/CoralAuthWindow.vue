<template>
  <div class="centered-component-container">
    <div class="card">
      <h2>Authentication</h2>
      <p>Please click the button below to start the authentication process.</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <div class="loading-container">
        <div class="loading-symbol">
          <div v-if="isLoading" class="loading">
            <div v-for="i in 8" :key="i" class="dot"></div>
          </div>
        </div>
      </div>
      <div>
        <button @click="authenticate">Start Authentication</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

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
        const response = await axios.post('/authenticate', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          const data = response.data;
          if (data.success) {
            this.isAuthenticated = true;
            console.log('Authentication successful');
            this.$store.commit('setIsAuthenticated', true);
            this.$emit('authenticate', true);
          } else {
            console.log('Authentication failed');
            this.errorMessage = data.message;
          }
        } else if (response.status === 401) {
          const data = await response.json();
          this.errorMessage = data.message;
        }
      } catch (error) {
        console.error('Error authenticating:', error);
        // Check if error.response exists and if it has data.message
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = error.message;
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.card {
  width: 400px;
  padding: 20px;
  text-align: center;
}

button {
  padding: 10px 20px;
  font-size: 1.2em;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100px;
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