import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: () => import('@/pages/LoginPage.vue'), meta: { publica: true } },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/cursos',
      children: [
        { path: 'cursos', component: () => import('@/pages/CursosPage.vue') },
        { path: 'aprendices', component: () => import('@/pages/AprendicesPage.vue') },
        { path: 'cuentas', component: () => import('@/pages/CuentasPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const { logged } = useAuthStore()
  if (!to.meta.publica && !logged) return '/login'
  if (to.path === '/login' && logged) return '/'
})

export default router
