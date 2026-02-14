import { ref, readonly } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const user = ref(null)
const session = ref(null)
const loading = ref(true)

// Escuchar cambios de auth (se ejecuta una sola vez globalmente)
supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
    user.value = _session?.user ?? null
    loading.value = false
})

export function useAuth() {

    async function signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    async function signUp({ email, password }) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        return data
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    return {
        user: readonly(user),
        session: readonly(session),
        loading: readonly(loading),
        signIn,
        signUp,
        signOut,
    }
}
