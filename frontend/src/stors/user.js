// src/stores/userStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        loading: true,
        error: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
        role: (state) => state.user?.role || null,
        fullName: (state) =>
            state.user ? `${state.user.first_name} ${state.user.last_name}` : '',
        email: (state) => state.user?.email || '',
        gender: (state) => state.user?.gender || '',
    },
    actions: {
        async fetchSession() {
            this.loading = true;
            try {
                const res = await axios.get('http://localhost:5000/api/auth/check-session', {
                    withCredentials: true,
                });
                this.user = res.data;
            } catch (err) {
                console.error("Error fetching session:", err);
                this.user = null;
                this.error = err.response?.data?.message || err.message;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await axios.post('http://localhost:5000/api/auth/logout', {}, {
                    withCredentials: true,
                });
            } catch (err) {
                console.warn("Logout error:", err);
                this.error = err.response?.data?.message || err.message;
            } finally {
                this.user = null;
                this.loading = false;
            }
        },

        async updateUser(userData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.put(
                    `http://localhost:5000/api/users/profile/${this.user.id}`,
                    userData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Update local user data with the response
                this.user = { ...this.user, ...response.data };
                await this.fetchSession();
                return response.data;
            } catch (err) {
                console.error("Error updating user:", err);
                this.error = err.response?.data?.message || err.message;
                throw err; // Re-throw to handle in component
            } finally {
                this.loading = false;
            }
        }
    },
});