import { defineStore } from 'pinia'
import { usuariosService } from '@/services'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: '', usuario: null }),
  getters: { logged: (s) => !!s.token },
  actions: {
    async login(email, password) {
      const { data } = await usuariosService.login({ email, password })
      this.token = data.token
      this.usuario = data.usuario
    },
    logout() {
      this.$reset()
    },
  },
  persist: true, // pinia-plugin-persistedstate: la sesión sobrevive a recargar la página
})
