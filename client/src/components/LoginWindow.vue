<template>
  <div class="centered-component-container">
    <div class="card">
      <h2>Welcome Back</h2>
      <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
      <form @submit.prevent="submitForm">
        <div class="input-group">
          <input id="username" type="text" v-model="username" placeholder=" ">
          <label :class="{ active: username }" for="username">Username</label>
        </div>
        <div class="input-group">
          <input id="password" type="password" v-model="password" placeholder=" ">
          <label :class="{ active: password }" for="password">Password</label>
        </div>
        <button type="submit" :disabled="isButtonDisabled">Log in</button>
      </form>
    </div>
  </div>
</template>

<script>
import {mapActions} from 'vuex';

export default {
  name: 'LoginWindow',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    };
  },
  computed: {
    isButtonDisabled() {
      return !this.username || !this.password;
    }
  },
  methods: {
    ...mapActions(['loginVuex']),
    async submitForm() {
      try {
        // Attempt to log in using the Vuex action 'loginVuex'
        const response = await this.loginVuex({username: this.username, password: this.password});
        if (!response.success) {
          // If login is unsuccessful, display the error message and clear inputs
          this.errorMessage = response.message;
          this.username = '';
          this.password = '';
        } else {
          // On successful login, clear any error message
          this.errorMessage = '';
        }
      } catch (error) {
        // Handle any errors that occur during the API call
        console.error('Login error:', error);
        this.errorMessage = error.message || 'An error occurred during login.';
      }
    }
  }
};
</script>

<style scoped>
button {
  display: inline-block;
  padding: .75rem 1.25rem;
  border-radius: 10rem;
  color: #fff;
  text-transform: uppercase;
  font-size: 1rem;
  letter-spacing: .15rem;
  transition: all .3s;
  position: relative;
  overflow: hidden;
  z-index: 1;
  margin-bottom: 0;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--accent-color);
    border-radius: 10rem;
    z-index: -2;
  }

  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 100%;
    background-color: var(--accent-color);
    transition: all .3s;
    border-radius: 10rem;
    z-index: -1;
  }

  &:hover {
    color: #fff;

    &:before {
      width: 100%;
    }
  }
}

button:disabled {
  background-color: var(--button-background-color);
  cursor: not-allowed;
  pointer-events: none;
}

button:disabled:before {
  background-color: var(--button-background-color);
}

button:disabled:after {
  background-color: var(--button-background-color);
}

.card {
  width: 400px;
  padding: 20px;
  text-align: center;
}

.card input {
  display: block;
  width: 90%;
  margin: 0 auto 30px;
}

.card button {
  width: 100%;
  padding: 10px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
  margin-top: 40px;
}

.input-group input {
  display: block;
  width: 90%;
  margin: 0 auto 10px;
}

.input-group label {
  position: absolute;
  top: 0;
  left: 20px;
  padding: 12px 0;
  pointer-events: none;
  transition: 0.3s;
  color: var(--text-color);
}

.input-group label.active {
  transform: translateY(-30px);
  font-size: 18px;
  color: var(--accent-color);
}
</style>