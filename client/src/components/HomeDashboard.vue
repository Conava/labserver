<template>
  <div class="dashboard">
    <!-- Full-width card for the title -->
    <div class="main-card">
      <!-- Greet the user with his name -->
      <h1 class="centered-label">Welcome to your Home Dashboard, {{ username }}</h1>
    </div>

    <!-- Rows of cards -->
    <div class="card-row" v-for="(row, index) in cardRows" :key="index">
      <div class="card" v-for="card in row" :key="card.id">
        <h1 class="centered-label">{{ card.title }}</h1>
        <p>{{ card.content }}</p>
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
        const response = await fetch('/api/cards', {
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`,
          },
        });
        if (response.ok) {
          this.cards = await response.json();
        }
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

.card {
  border-radius: 10px;
  margin: 10px;
  padding: 20px;
  background-color: var(--card-background-color);
  color: var(--card-text-color);
}

.full-width {
  width: 100%;
}

.centered-label {
  text-align: center;
}

.card-row {
  display: flex;
  justify-content: space-between;
}
</style>