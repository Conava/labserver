<template>
  <!-- Login form container -->
  <div class="login-container">
    <!-- Login form card -->
    <div class="card">
      <!-- Login form title -->
      <h2>Welcome Back</h2>
      <!-- Error message display, only visible when there is an error message -->
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <!-- Login form -->
      <form @submit.prevent="submitForm">

        <!-- Username input group -->
        <div class="input-group">
          <input id="username" type="text" v-model="username" placeholder=" ">
          <label :class="{ active: username }" for="username">Username</label>
        </div>

        <!-- Password input group -->
        <div class="input-group">
          <input id="password" type="password" v-model="password" placeholder=" ">
          <label :class="{ active: password }" for="password">Password</label>
        </div>

        <!-- Login button, disabled when username or password is empty -->
        <button type="submit" :disabled="isButtonDisabled">Log in</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginWindow',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    }
  },
  computed: {
    // Computed property to check if the login button should be disabled
    isButtonDisabled() {
      return !this.username || !this.password;
    }
  },
  methods: {
    // Method to handle form submission
    async submitForm() {
      try {
        // Send login request to the server
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        // Check if the response is OK
        if (response.ok) {
          const data = await response.json();
          console.log('Response text:', data);

          // Check if the login was successful
          if (data.success) {
            // Emit login event
            this.$emit('login', true);
          } else {
            // Handle login failure
            this.errorMessage = data.message;
            this.username = '';
            this.password = '';
          }
        } else if (response.status === 401) {
          // Handle unauthorized access
          const data = await response.json();
          this.errorMessage = data.message;
          this.username = '';
          this.password = '';
        }
      } catch (error) {
        // Handle network errors
        console.error('Network error:', error);
      }
    }
  }
};
</script>

<style scoped>
p {
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
    background-color: var(--accent-color2);
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

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
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