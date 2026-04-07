import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import SptManager from '../pages/SptManager.vue'
import SptjmManager from '../pages/SptjmManager.vue'
import PegawaiManager from '../pages/PegawaiManager.vue'
import AdminManager from '../pages/AdminManager.vue'
import Layout from '../components/Layout.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'spt', name: 'SptManager', component: SptManager },
      { path: 'sptjm', name: 'SptjmManager', component: SptjmManager },
      { path: 'pegawai', name: 'PegawaiManager', component: PegawaiManager },
      { path: 'admin', name: 'AdminManager', component: AdminManager },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const adminData = localStorage.getItem('adminData')
  if (to.name !== 'Login' && !adminData) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && adminData) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
