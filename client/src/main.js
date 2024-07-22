import {createApp} from 'vue';
import App from './App.vue';
import store from './store.js';

// Create a new Vue application instance
// This instance is configured to use the Vuex store for state management
// The application is then mounted to the DOM element with the ID 'app'
createApp(App).use(store).mount('#app');