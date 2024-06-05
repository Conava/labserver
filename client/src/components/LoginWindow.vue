<template>
  <div class="login-container">
    <div class="card">
      <h2>Welcome Back</h2>
      <form @submit.prevent="submitForm">
        <label for="username">Username</label>
        <input id="username" type="text" v-model="username" placeholder="Username">

        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" placeholder="Password">

        <button type="submit">Sign In</button>
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
      password: ''
    }
  },
  methods: {
    async submitForm() {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });
      const text = await response.text();
      console.log('Response text:', text);

      try {
        const data = JSON.parse(text);

        if (data.success) {
          this.$emit('login', true);
        } else {
          // Show an error message
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }
};
</script>

<style scoped>
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
  width: 100%;
  margin-bottom: 10px;
}

.card button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>