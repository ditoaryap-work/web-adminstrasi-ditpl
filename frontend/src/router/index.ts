import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const Login = () => import('../pages/Login.vue')
const Dashboard = () => import('../pages/Dashboard.vue')
const SptManager = () => import('../pages/SptManager.vue')
const SptjmManager = () => import('../pages/SptjmManager.vue')
const PegawaiManager = () => import('../pages/PegawaiManager.vue')
const AdminManager = () => import('../pages/AdminManager.vue')
const ArsipSuratManager = () => import('../pages/ArsipSuratManager.vue')

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
      { path: 'arsip-surat', name: 'ArsipSuratManager', component: ArsipSuratManager },
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
