<template>
  <div :class="bodyClass">
    <div id="app">
      <AppHeader></AppHeader>
      <div class="main-content">
        <!-- Use Vuex getters directly in the template for conditional rendering -->
        <LoginWindow v-if="!isLoggedIn"/>
        <CoralAuthWindow v-else-if="isLoggedIn && !isAuthenticated"/>
        <HomeDashboard v-else-if="isLoggedIn && isAuthenticated" msg="Laboratory Vault entered"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import HomeDashboard from './components/HomeDashboard.vue';
import LoginWindow from './components/LoginWindow.vue';
import CoralAuthWindow from './components/CoralAuthWindow.vue';
import AppHeader from "./components/AppHeader.vue";

export default {
  name: 'App',
  components: {
    HomeDashboard,
    LoginWindow,
    AppHeader,
    CoralAuthWindow
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'isAuthenticated', 'theme']),
    bodyClass() {
      return this.theme === 'dark' ? 'dark-mode' : '';
    }
  },
  methods: {
    ...mapActions(['checkAuthenticationVuex']),
  },
  created() {
    // Calls the checkAuthenticationVuex action when the component is created to check if the user is already authenticated.
    // If the user is authenticated, the user is redirected to the HomeDashboard component.
    // Also sets the class of the <body> element according to the current theme.
    this.checkAuthenticationVuex();
    document.body.className = this.theme === 'dark' ? 'dark-mode' : '';
  }
}
</script>

<style>
@import 'assets/theme.css';
</style>