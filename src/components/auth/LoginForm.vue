<script setup>
import { reactive, ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'

const props = defineProps({
    initialValues: {
        type: Object,
        default: () => ({
            email: '',
            password: ''
        })
    },
    submitting: {
        type: Boolean,
        default: false,
    }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// Form state
const formElement = ref(null)
const form = reactive({
    email: props.initialValues.email ?? '',
    password: props.initialValues.password ?? ''
})
const { errors, hasErros, clearError, validateForm } = useFormValidation()

// Methods
function onSubmit(){
    if(props.submitting) return

    const isValid = validateForm(formElement.value)
    if(!isValid) return

    emit('submit', {
        email: form.email.trim(),
        password: form.password.trim()
    })
}
</script>
<template>

    <form
        ref="formElement"
        class="simple-container direction-column gap-24"
        autocomplete="off"
        v-on:submit.prevent="onSubmit"
        >

        <div class="simple-container direction-column gap-8">

            <div class="simple-container direction-column gap-8">
                <span class="label-large outline-text">
                    Correo electrónico
                </span>
                <input
                    name="email"
                    v-model="form.email"
                    v-bind:class="{error: errors.email }"
                    v-bind:disabled="submitting"
                    v-on:input="clearError('email')"
                    type="text"
                    max-length="255"
                    required
                />
            </div>
            
            <div class="simple-container direction-column gap-8">
                <span class="label-large outline-text">
                   Contraseña
                </span>
                <input
                    name="password"
                    v-model="form.password"
                    v-bind:class="{error: errors.password }"
                    v-bind:disabled="submitting"
                    v-on:input="clearError('password')"
                    type="password"
                    max-length="255"
                    required
                />
            </div>
        </div>
        

        <div class="simple-container direction-column">
            <button 
                class="simple-container weight-600 position-relative justify-between style-7 padding-24 primary-container on-primary-container-text"
                type="submit"
                v-bind:disabled="submitting"
    
                >
                <md-ripple></md-ripple>
                Iniciar sesión
                <md-icon class="dynamic">arrow_forward</md-icon>
            </button>
        </div>


    </form>

</template>