<template>
  <div class="dashboard">
    <div class="main-card card">
      <h1 class="centered-label">Welcome to your Home Dashboard, {{ username }}</h1>
    </div>
    <div class="card-row" v-for="(row, index) in cardRows" :key="index">
      <div class="content-card card" v-for="card in row" :key="card.id">
        <div v-for="element in card.elements" :key="element.content">
          <h3 v-if="element.type === 'title'">{{ element.content }}</h3>
          <p v-if="element.type === 'text'">{{ element.content }}</p>
          <img v-if="element.type === 'image'" :src="element.content" alt="Card image">
          <button v-if="element.type === 'button'" @click="performAction(element.content.action)">
            {{ element.content.text }}
          </button>
          <a v-if="element.type === 'link'" :href="element.content.url" target="_blank"
             rel="noopener noreferrer" class="button-like">{{ element.content.text }}</a></div>
      </div>
    </div>
  </div>
</template>

<script>
import {computed} from 'vue';
import {mapActions, useStore} from 'vuex';

export default {
  name: 'HomeDashboard',
  setup() {
    const store = useStore();
    const username = computed(() => store.getters.username);
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const storeCards = computed(() => store.state.cards); // Access cards from the store

    return {username, isAuthenticated, storeCards};
  },
  data() {
    return {
      cards: [],
    };
  },
  computed: {
    cardRows() {
      let rows = [];
      for (let i = 0; i < this.cards.length; i += 3) {
        rows.push(this.cards.slice(i, i + 3));
      }
      return rows;
    },
  },
  methods: {
    ...mapActions(['fetchCardsVuex']),

    performAction(action) {
      // Perform the desired action based on the action parameter
      if (action.startsWith('http')) {
        // Redirect to the URL in a new tab
        window.open(action, "_blank");
      } else if (action.startsWith('/')) {
        window.location.href = action;
      } else {
        // Handle other types of actions
        console.log('Action:', action);
      }
    },
  },
  created() {
    this.fetchCardsVuex();
    console.log('HomeDashboard created, fetch cards executed');
  },
  mounted() {
    // Watch for changes in the store's cards and update the local cards accordingly
    this.$watch(
        () => this.storeCards,
        (newCards) => {
          this.cards = newCards;
        },
        { immediate: true }
    );
  },
};
</script>


<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-card {
  flex: 1;
  max-width: calc(33.33% - 20px); /* 33.33% for each card, minus the margin */
}

.main-card {
  margin-top: 10px;
  max-width: calc(100% - 40px);
}

.centered-label {
  text-align: center;
}

.card-row {
  display: flex;
  justify-content: space-between;
}
</style>