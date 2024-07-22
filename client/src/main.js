import {createApp} from 'vue';
import App from './App.vue';
import store from './store.js';

// Create a new Vue app instance and use the store.
createApp(App).use(store).mount('#app');