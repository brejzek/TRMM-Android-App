import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    apiUrl: localStorage.getItem('apiUrl') || '',
    apiKey: localStorage.getItem('apiKey') || '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.apiUrl && !!state.apiKey,
  },
  actions: {
    setCredentials(url: string, key: string) {
      this.apiUrl = url.endsWith('/') ? url.slice(0, -1) : url
      this.apiKey = key
      localStorage.setItem('apiUrl', this.apiUrl)
      localStorage.setItem('apiKey', this.apiKey)
    },
    logout() {
      this.apiUrl = ''
      this.apiKey = ''
      localStorage.removeItem('apiUrl')
      localStorage.removeItem('apiKey')
    },
  },
})
