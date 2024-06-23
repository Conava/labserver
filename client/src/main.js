import { createApp } from 'vue';
import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import App from './App.vue';

// Create a new store instance.
const store = createStore({
  plugins: [createPersistedState()],

  state () {
    return {
      count: 0,
      username: '',
      isAuthenticated: false
    }
  },
  mutations: {
    increment (state) {
      state.count++
    },
    setUsername (state, username) {
      state.username = username;
    },
    setIsAuthenticated (state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    }
  }
})

// Create a new Vue app instance and use the store.
const app = createApp(App);
app.use(store);
app.mount('#app');