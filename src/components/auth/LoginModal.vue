<script setup>
import { reactive, computed } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'

const emit = defineEmits(['close'])

// Methods
function closeModal(){
    emit('close')
}

const initialValues = reactive({
    email: '',
    password: ''
})

async function handleSubmit(values){
    console.log("Iniciando sesion fake")
}
</script>
<template>

    <div class="simple-container direction-column gap-16 grow-1">

        <div class="simple-container">
            <button 
                class="style-7 for-icon small surface-container-low rounded"
                v-on:click="closeModal"
                >
                <md-ripple></md-ripple>
                <md-icon>close</md-icon>
            </button>
        </div>

        <div class="simple-container direction-column grow-1 justify-around">

            <div class="simple-container direction-column gap-8">
                <span class="display-medium weight-500">
                    Iniciar sesión
                </span>
        
                <LoginForm 
                    v-bind:initial-values="initialValues"
                    v-on:submit="handleSubmit"
                />
            </div>

        </div>

    </div>


</template>