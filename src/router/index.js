import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/lib/supabaseClient.js';

import LandingView from '@/views/LandingView.vue';
import LoginView from '@/views/auth/LoginView.vue';

import HomeView from '@/views/HomeView.vue';

const routes = [
    { path: '/', name: 'landing', component: LandingView, meta: { guestOnly: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to) => {
    const { data: { session } } = await supabase.auth.getSession()

    // Si la ruta requiere auth y no hay sesión → mandar al landing
    if(to.meta.requiresAuth && !session) {
        return { name: 'landing' }
    }

    // Si ya está logueado y va a una ruta de guests → mandar al home
    if(to.meta.guestOnly && session) {
        return { name: 'home' }
    }
})

export default router;
