<template>
  <header>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
    <div v-else class="placeholder"></div>
    <h1>Laboratory Vault</h1>
    <button @click="toggleDarkMode">
      {{ darkMode ? 'Light Mode' : 'Dark Mode' }}
    </button>
  </header>
</template>

<script>
export default {
  props: ['isLoggedIn'],
  data() {
    return {
      darkMode: localStorage.getItem('theme') === 'dark',
    }
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    },
    logout() {
      // Implement your logout logic here
    }
  }
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-background-color);
  color: var(--text-color);
  border-bottom: 1px solid grey;
}

header h1 {
  text-align: center;
  flex-grow: 1;
}

.placeholder {
  /* Adjust the width and height to match the logout button */
  width: 80px;
  height: 20px;
}
</style>