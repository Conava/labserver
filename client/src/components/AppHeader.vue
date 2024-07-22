<template>
  <header>
    <button v-if="isLoggedIn" @click="logoutButtonClick">Logout</button>
    <div v-else class="placeholder"></div>
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
  background-color: var(--card-background-color);
  color: var(--text-color);
  border-bottom: 1px;
  border-color: var(--card-border-color);
}

header h1 {
  text-align: center;
  flex-grow: 1;
}

.placeholder {
  width: 70px;
  height: 20px;
}

button {
  margin: 20px;
}
</style>