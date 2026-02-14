<script setup>
import { reactive, ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'

const props = defineProps({
    initialValues: {
        type: Object,
        default: () => ({
            email: '',
            password: '',
            repeatPassword: ''
        })
    },
    submitting: {
        type: Boolean,
        default: false,
    }
})

// Emits
const emit = defineEmits(['submit','cancel'])

// Form state
const formElement = ref(null)
const form = reactive({
    email: props.initialValues.email ?? '',
    password: props.initialValues.password ?? '',
    repeatPassword: props.initialValues.repeatPassword ?? ''
})
const { errors, hasErrors, clearError, validateForm } = useFormValidation()

// Methods
function onSubmit(){
    if(props.submitting) return

    const isValid = validateForm(formElement.value)
    if(!isValid) return
    emit('submit', {
        email: form.email,
        password: form.password,
        repeatPassword: form.repeatPassword
    })
}
</script>
<template>

    <form 
        ref="formElement"
        class="simple-container direction-column gap-24"
        v-on:submit.prevent="onSubmit"
        >
        
        <div class="simple-container direction-column gap-8">

            <div class="simple-container direction-column gap-4">
                <span class="label-large outline-text">Correo electrónico</span>
                <input
                    name="email"
                    type="email"
                    v-model="form.email"
                    v-bind:class="{error: errors.email }"
                    v-bind:disabled="submitting"
                    v-on:input="clearError('email')"
                    max-length="255"
                    required
                />
            </div>

            <div class="simple-container direction-column gap-4">
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

            <div class="simple-container direction-column gap-4">
                <span class="label-large outline-text">
                   Repetir contraseña
                </span>
                <input
                    name="repeatPassword"
                    v-model="form.repeatPassword"
                    v-bind:class="{error: errors.repeatPassword }"
                    v-bind:disabled="submitting"
                    v-on:input="clearError('repeatPassword')"
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
                Registrarse
                <md-icon class="dynamic">arrow_forward</md-icon>
            </button>
        </div>

        
    </form>

</template>