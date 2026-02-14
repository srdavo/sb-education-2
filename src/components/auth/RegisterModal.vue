<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['close'])
const router = useRouter()
const { signUp } = useAuth()

// State
const submitting = ref(false)
const errorMessage = ref('')

const initialValues = reactive({
    email: '',
    password: '',
    repeatPassword: ''
})

// Methods
function closeModal(){
    emit('close')
}

async function handleSubmit(values){
    if(values.password !== values.repeatPassword){
        errorMessage.value = 'Las contraseñas no coinciden'
        return
    }

    submitting.value = true
    errorMessage.value = ''

    try {
        await signUp({ email: values.email, password: values.password })
        emit('close')
        router.push({ name: 'home' })
    } catch(error) {
        errorMessage.value = error.message
    } finally {
        submitting.value = false
    }
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
                <span class="display-medium weight-500">Crear cuenta</span>
                <RegisterForm
                    :initial-values="initialValues"
                    v-bind:submitting="submitting"
                    v-on:submit="handleSubmit"
                />

                <span v-if="errorMessage" class="label-large error-text">
                    {{ errorMessage }}
                </span>
                
            </div>
        </div>

    </div>

</template>