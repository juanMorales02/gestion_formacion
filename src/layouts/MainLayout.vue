<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { confirmar } from '@/helpers/alerts'
import logo from '@/assets/sena.png'

const auth = useAuthStore()
const router = useRouter()
const inicial = computed(() => (auth.usuario?.nombre || '?')[0])
const links = [
  { to: '/cursos', icon: 'auto_stories', label: 'Cursos' },
  { to: '/aprendices', icon: 'school', label: 'Aprendices' },
  { to: '/cuentas', icon: 'badge', label: 'Cuentas' },
]
const salir = async () => {
  if (!(await confirmar('¿Cerrar sesión?'))) return
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="barra">
      <img :src="logo" class="logo-barra" alt="SENA" />
      <span class="marca">Gestión de formación</span>
      <nav>
        <router-link v-for="l in links" :key="l.to" :to="l.to" class="enlace" active-class="activo">
          <q-icon :name="l.icon" size="20px" /><span class="gt-xs">{{ l.label }}</span>
        </router-link>
      </nav>
      <button class="yo" @click="salir" title="Cerrar sesión">
        <span class="avatar">{{ inicial }}</span>
        <span class="gt-sm">{{ auth.usuario?.nombre }}</span><q-icon name="logout" size="18px" />
      </button>
    </q-header>
    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>
