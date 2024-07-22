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
        <button @click="authenticate" :disabled="isLoading">Start Authentication</button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from 'vuex';
import {Spinner} from 'spin.js';

export default {
  data() {
    return {
      isLoading: false,
      errorMessage: '',
      spinner: null
    };
  },
  methods: {
    ...mapActions(['authenticateVuex']),
    async authenticate() {
      this.isLoading = true;
      this.errorMessage = '';
      this.spinner = new Spinner().spin(this.$refs.loading);
      this.spinner.el.style.color = 'var(--spinner-color)';
      const result = await this.authenticateVuex();
      if (!result.success) {
        this.errorMessage = result.message;
      }
      this.spinner.stop();
      this.isLoading = false;
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