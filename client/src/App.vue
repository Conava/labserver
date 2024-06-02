<template>
  <div :class="bodyClass">
    <div id="app">
      <app-header :is-logged-in="isLoggedIn"></app-header>
      <div class="main-content">
        <Login v-if="!isLoggedIn" @login="handleLogin"/>
        <div v-else>
          <img alt="Vue logo" src="./assets/logo.png">
          <HelloWorld msg="Welcome to Your Vue.js App"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/LoginWindow.vue'
import Header from "@/components/AppHeader.vue";

export default {
  name: 'App',
  components: {
    HelloWorld,
    Login,
    'app-header': Header
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
      isLoggedIn: false
    }
  },
  methods: {
    handleLogin(success) {
      this.isLoggedIn = success;
    }
  }
}
</script>

<style>
  @import 'assets/theme.css';
</style>