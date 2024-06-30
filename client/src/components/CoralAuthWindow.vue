<template>
  <div class="centered-component-container">
    <div class="card">
      <h2>Authentication</h2>
      <p>Please click the button below to start the authentication process.</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <div class="loading-container">
          <div class="loading-symbol" ref="loading" v-show="isLoading"></div>
      </div>
      <div>
        <button @click="authenticate">Start Authentication</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Spinner } from 'spin.js';

export default {
  data() {
    return {
      isLoading: false,
      errorMessage: '',
      spinner: null
    }
  },
  methods: {
    async authenticate() {
      this.isLoading = true;
      this.spinner = new Spinner().spin(this.$refs.loading);
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
        this.spinner.stop();
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
[ref="loading"] {
  width: 50px;
  height: 50px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-symbol {
  animation: spin 4s linear infinite;
}

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
  width: 100%;
}

.loading-symbol {
  width: 100%;
  height: 100%;
  position: relative;
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