<template>
  <div :class="bodyClass">
    <div id="app">
      <app-header :is-logged-in="isLoggedIn" @logout="handleLogout"></app-header>
      <div class="main-content">
        <Login v-if="!isLoggedIn" @login="handleLogin"/>
        <CoralAuthWindow v-else-if="isLoggedIn && !isAuthenticated" @authenticate="handleAuthentication"/>
        <HomeDashboard v-else-if="isLoggedIn && isAuthenticated" msg="Laboratory Vault entered"/>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, watch} from 'vue';
import axios from 'axios';
import HomeDashboard from './components/HomeDashboard.vue'
import Login from './components/LoginWindow.vue'
import CoralAuthWindow from './components/CoralAuthWindow.vue'
import Header from "@/components/AppHeader.vue";

export default {
  name: 'App',
  components: {
    HomeDashboard,
    Login,
    'app-header': Header,
    CoralAuthWindow
  },
  created() {
    axios.get('/checkAuthentication')
        .then(response => {
          this.isLoggedIn = this.isAuthenticated = response.data.isAuthenticated;
        })
        .catch(error => {
          console.error('Error checking authentication:', error);
        });
  },
  setup() {
    const darkMode = ref(localStorage.getItem('theme') === 'dark');
    const bodyClass = computed(() => darkMode.value ? 'dark-mode' : '');
    if (darkMode.value) {
      console.log("dark mode detected");
      document.body.classList.add('dark-mode');
    }
    // Watch for changes to darkMode and update localStorage
    watch(darkMode, (newVal) => {
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      if (newVal) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    });

    return {
      darkMode,
      bodyClass
    };
  },
  data() {
    return {
      isLoggedIn: false,
      isAuthenticated: false
    }
  },
  methods: {
    handleLogin(success) {
      console.log('Login successful:', success)
      this.isLoggedIn = success;
    },
    handleAuthentication(success) {
      console.log('Authentication successful:', success);
      this.isAuthenticated = success;
    },
    async handleLogout() {
      try {
        const response = await axios.post('/logout');
        if (response.data.success) {
          this.isLoggedIn = false;
          this.isAuthenticated = false;
        } else {
          // Handle logout failure
        }
      } catch (error) {
        // Handle error
      }
    }
  }
}
</script>

<style>
@import 'assets/theme.css';
</style>