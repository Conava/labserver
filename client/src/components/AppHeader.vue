<template>
  <header>
    <button :disabled="!isLoggedIn" @click="logoutButtonClick">Logout</button>
    <h1>Laboratory Vault</h1>
    <button @click="toggleDarkMode">
      {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
    </button>
  </header>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  computed: {
    ...mapState(['theme', "isLoggedIn"])
  },
  methods: {
    ...mapActions(['toggleThemeVuex', 'logoutVuex']),

    toggleDarkMode() {
      this.toggleThemeVuex();
    },

    logoutButtonClick() {
      this.logoutVuex();
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
  border-bottom: 2px;
  border-color: var(--header-border-color);
}

header h1 {
  text-align: center;
  flex-grow: 1;
}

button {
  margin: 16px;
}
</style>