<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, signOut } = useAuth()

async function handleSignOut(){
    await signOut()
    router.push({ name: 'landing' })
}
</script>
<template>
    <div class="view simple-container direction-column gap-16">

        <div class="simple-container justify-between align-center">
            <span class="title-large weight-500">Home</span>
            <button 
                class="style-7 small surface-container rounded weight-500"
                v-on:click="handleSignOut"
                >
                <md-ripple></md-ripple>
                Cerrar sesión
            </button>
        </div>

        <span class="body-large outline-text">{{ user?.email }}</span>

    </div>
</template>