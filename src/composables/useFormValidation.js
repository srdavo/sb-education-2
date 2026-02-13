import { reactive, computed } from 'vue'

export function useFormValidation(){

    const errors = reactive({})

    function setError(field, value){
        errors[field] = !!value
    }
    function clearError(field){
        errors[field] = false
    }

    const hasErrors = computed(() => Object.values(errors).some(Boolean))

    function validateForm(formElement, extraValidations = {}) {
        if(!formElement) return false

        const valid = formElement.checkValidity()

        const elements = Array.from(formElement.elements).filter(el => el?.name)
        for( const el of elements ){
            setError(el.name, !el.validity.valid)
        }

        for (const [field, fn] of Object.entries(extraValidations)) {
            const ok = fn()
            setError(field, !ok)
        }

        return valid && !Object.entries(extraValidations).some(([_, fn]) => fn() === false)
    }

    return {
        errors,
        hasErrors,
        setError,
        clearError,
        validateForm
    }
}