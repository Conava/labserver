<template>
  <div :class="bodyClass">
    <div id="app">
      <app-header :is-logged-in="isLoggedIn" @logout="handleLogout"></app-header>
      <div class="main-content">
        <Login v-if="!isLoggedIn" @login="handleLogin"/>
        <CorelAuthWindow v-else-if="isLoggedIn && !isAuthenticated" @authenticate="handleAuthentication"/>
        <HelloWorld v-else-if="isLoggedIn && isAuthenticated" msg="Laboratory Vault entered"/>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed} from 'vue';
import axios from 'axios';
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/LoginWindow.vue'
import CorelAuthWindow from './components/CorelAuthWindow.vue'
import Header from "@/components/AppHeader.vue";

export default {
  name: 'App',
  components: {
    HelloWorld,
    Login,
    'app-header': Header,
    CorelAuthWindow
  },
  setup() {
    const darkMode = ref(localStorage.getItem('theme') === 'dark');
    const bodyClass = computed(() => darkMode.value ? 'dark-mode' : '');
    if (darkMode.value) {
      console.log("dark mode detected");
      document.body.classList.add('dark-mode');
    }
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
      this.isLoggedIn = success;
    },
    async handleAuthentication() {
      try {
        const response = await axios.post('/authenticate');
        if (response.data.success) {
          this.isAuthenticated = true;
        } else {      console.log(JSON.stringify({
        id: 'test',
        status: 'approved'
      }))
          // Handle authentication failure
        }
      } catch (error) {
        // Handle error
      }
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