import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../lib/supabaseClient.js';

import LandingView from '@/views/LandingView.vue';
import LoginView from '@/views/auth/LoginView.vue';
// import RegisterView from '@views/auth/RegisterView.vue';

const routes = [
    { path: '/', name: 'sb education', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    // { path: '/register', name: 'register', component: RegisterView },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Pending to add require auth

export default router;
