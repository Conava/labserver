import {createStore} from 'vuex';
import axios from "axios";

export default createStore({
    state: {
        isLoggedIn: false,
        isAuthenticated: false,
        theme: localStorage.getItem('theme'),
        username: null,
        cards: [],
    },
    mutations: {
        setLoginState(state, {isLoggedIn, isAuthenticated}) {
            state.isLoggedIn = isLoggedIn;
            state.isAuthenticated = isAuthenticated;
        },
        toggleTheme(state) {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', state.theme);
            if (state.theme) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        },
        setUsername(state, username) { // Step 2: Create setUsername mutation
            state.username = username;
        },
        setIsAuthenticated(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        setCards(state, cards) {
            state.cards = cards;
        }
    },
    actions: {
        async loginVuex({commit}, {username, password}) {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username, password})
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Response text:', data);

                    if (data.success) {
                        commit('setLoginState', {isLoggedIn: true, isAuthenticated: false});
                        commit('setUsername', username);
                        return {success: true};
                    } else {
                        return {error: data.message};
                    }
                } else {
                    const data = await response.json();
                    return {error: data.message};
                }
            } catch (error) {
                console.error('Network error:', error);
                return {success: false, error: 'Network error'};
            }
        },

        async authenticateVuex({commit}) {
            try {
                const response = await axios.post('/authenticate', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200 && response.data.success) {
                    commit('setIsAuthenticated', true);
                    return {success: true};
                } else {
                    return {success: false, message: response.data.message || 'Authentication failed'};
                }
            } catch (error) {
                let message = 'Error during authentication';
                if (error.response && error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                } else if (error.message) {
                    message = error.message;
                }
                return {success: false, message};
            }
        },

        async fetchCardsVuex({commit, state}) {
            console.log('Fetching cards');
            if (state.isAuthenticated) {
                console.log('User is authenticated, fetching cards');
                try {
                    const response = await fetch('/cards', {
                        method: 'GET', // Method is optional here as GET is the default
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    console.log('Fetch complete. Response:', response);
                    if (response.ok) {
                        const cards = await response.json();
                        commit('setCards', cards);
                        console.log('Cards set:', cards);
                    }
                } catch (error) {
                    console.error('Error fetching cards:', error);
                }
            }
        },

        toggleThemeVuex({commit, state}) {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark';
            commit('toggleTheme', newTheme); // Commit mutation to update theme in the store
            localStorage.setItem('theme', newTheme); // Update localStorage
            document.body.className = newTheme === 'dark' ? 'dark-mode' : ''; // Update body class
        },

        logoutVuex({commit}) {
            return new Promise((resolve, reject) => {
                axios.post('/logout').then(response => {
                    if (response.data.success) {
                        commit('setLoginState', {isLoggedIn: false, isAuthenticated: false}); // Use a mutation to update login state
                        commit('setToken', null); // Clear token
                        commit('setUsername', null); // Clear username
                        resolve();
                    } else {
                        console.error('Logout failed');
                        reject('Logout failed');
                    }
                }).catch(error => {
                    console.error('Error during logout:', error);
                    reject(error);
                });
            });
        },

        checkAuthenticationVuex({commit}) {
            axios.get('/checkAuthentication').then(response => {
                if (response.data.success) {
                    commit('setLoginState', {isLoggedIn: true, isAuthenticated: true});
                } else {
                    commit('setLoginState', {isLoggedIn: false, isAuthenticated: false});
                }
            }).catch(error => {
                console.error('Error during checkAuthentication:', error);
                // Optionally handle the error, e.g., by committing a specific mutation
            });
        }
    },
    getters:
        {
            isLoggedIn: state => state.isLoggedIn,
            isAuthenticated:
                state => state.isAuthenticated,
            theme:
                state => state.theme,
            username:
                state => state.username,
            cards:
                state => state.cards,
        }
});