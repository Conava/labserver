<template>
  <div class="dashboard">
    <!-- Full-width card for the title -->
    <div class="main-card card">
      <!-- Greet the user with his name -->
      <h1 class="centered-label">Welcome to your Home Dashboard, {{ username }}</h1>
    </div>

    <!-- Rows of cards -->
    <div class="card-row" v-for="(row, index) in cardRows" :key="index">
      <div class="content-card card" v-for="card in row" :key="card.id">
        <div v-for="element in card.elements" :key="element.content">
          <p v-if="element.type === 'text'">{{ element.content }}</p>
          <img v-if="element.type === 'image'" :src="element.content" alt="Card image">
          <button v-if="element.type === 'button'" @click="performAction(element.content.action)">{{ element.content.text }}</button>
          <a v-if="element.type === 'link'" :href="element.content.url">{{ element.content.text }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'HomeDashboard',
  setup() {
    const store = useStore();
    const username = computed(() => store.state.username);
    return { username };
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
    async fetchCards() {
      if (this.$store.state.isAuthenticated) {
        const response = await fetch('/cards', {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`,
          },
        });
        console.log(response);
        if (response.ok) {
          this.cards = await response.json();
        }
      }
    },
    performAction(action) {
      // Perform the desired action based on the action parameter
      if (action.startsWith('http')) {
        window.location.href = action;
      } else {
        // Handle other types of actions
        console.log('Action:', action);
      }
    },
  },
  created() {
    this.fetchCards();
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