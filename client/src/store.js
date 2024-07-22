import {createStore} from 'vuex';
import axios from "axios";

/**
 * Vuex store for managing application state.
 * Includes state for login status, user authentication, theme, username, and cards.
 * Contains mutations for updating state, actions for asynchronous operations like login, logout, and fetching data.
 */
export default createStore({
    state: {
        isLoggedIn: false,
        isAuthenticated: false,
        theme: localStorage.getItem('theme'),
        username: null,
        cards: [],
    },
    mutations: {
        /**
         * Sets the login state of the user.
         * @param {Object} state The current state of the store.
         * @param {Object} payload Contains isLoggedIn and isAuthenticated flags.
         */
        setLoginState(state, {isLoggedIn, isAuthenticated}) {
            state.isLoggedIn = isLoggedIn;
            state.isAuthenticated = isAuthenticated;
        },
        /**
         * Toggles the theme between 'dark' and 'light'.
         * Updates the theme in localStorage and applies the corresponding class to the body.
         * @param {Object} state The current state of the store.
         */
        toggleTheme(state) {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', state.theme);
            if (state.theme) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        },
        /**
         * Sets the username in the state.
         * @param {Object} state The current state of the store.
         * @param {string} username The username to set.
         */
        setUsername(state, username) { // Step 2: Create setUsername mutation
            state.username = username;
        },
        /**
         * Sets the authentication status of the user.
         * @param {Object} state The current state of the store.
         * @param {boolean} isAuthenticated The authentication status to set.
         */
        setIsAuthenticated(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        /**
         * Saves the user cards in the state.
         * @param {Object} state The current state of the store.
         * @param {Array} cards The cards to set.
         */
        setCards(state, cards) {
            state.cards = cards;
        }
    },
    actions: {
        /**
         * Asynchronous action to log in the user.
         * @param {Object} context Provides commit function to trigger mutations.
         * @param {Object} payload Contains username and password for login.
         * @returns {Object} Result of the login attempt including success status and message.
         */
        async loginVuex({commit}, {username, password}) {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username, password})
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.success) {
                        commit('setLoginState', {isLoggedIn: true, isAuthenticated: false});
                        commit('setUsername', username);
                        return {success: true, message: 'Login successful'};
                    } else {
                        // Considered successful HTTP request but logical error (e.g., wrong credentials)
                        return {success: false, message: data.message, statusCode: response.status};
                    }
                } else {
                    // HTTP request failed
                    return {success: false, message: data.message, statusCode: response.status};
                }
            } catch (error) {
                console.error('Network error:', error);
                // Network error or other issue preventing the request from completing
                return {success: false, message: 'Network error', statusCode: 0}; // statusCode 0 for network errors
            }
        },

        /**
         * Asynchronous action to authenticate the user.
         * @param {Object} commit Provides commit function to trigger mutations.
         * @returns {Object} Result of the authentication attempt including success status and message.
         */
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

        /**
         * Fetches cards from the server if the user is authenticated.
         * If the user is authenticated, it sends a GET request to the '/cards' endpoint.
         * Upon successful response, it commits the fetched cards to the state.
         * @param {Object} context - The Vuex action context, providing access to commit mutations and state.
         */
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

        /**
         * Toggles the application theme between 'dark' and 'light'.
         * This action toggles the theme and commits the new theme to the state.
         * It also updates the theme in localStorage and applies the corresponding class to the body.
         * @param {Object} context - The Vuex action context, providing access to commit mutations and state.
         */
        toggleThemeVuex({commit, state}) {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark';
            commit('toggleTheme', newTheme); // Commit mutation to update theme in the store
            localStorage.setItem('theme', newTheme); // Update localStorage
            document.body.className = newTheme === 'dark' ? 'dark-mode' : ''; // Update body class
        },

        /**
         * Logs out the current user.
         * This action sends a POST request to the '/logout' endpoint.
         * Upon successful response, it commits mutations to update the login state and clear user information.
         * If the request fails, it logs the error and rejects the promise.
         * @returns {Promise} A promise that resolves if logout is successful, otherwise rejects with an error message.
         */
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

        /**
         * Checks the authentication status of the user.
         * This action sends a GET request to the '/checkAuthentication' endpoint.
         * Based on the response, it commits mutations to update the login state accordingly.
         * If the request fails, it logs the error.
         */
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