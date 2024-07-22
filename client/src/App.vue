<template>
  <div :class="bodyClass">
    <div id="app">
      <app-header></app-header>
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
import Header from "./components/AppHeader.vue";

export default {
  name: 'App',
  components: {
    HomeDashboard,
    LoginWindow,
    'app-header': Header,
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
    this.checkAuthenticationVuex();
    document.body.className = this.theme === 'dark' ? 'dark-mode' : '';
  }
}
</script>

<style>
@import 'assets/theme.css';
</style>