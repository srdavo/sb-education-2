<script setup>
import { ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import LoginModal from '@/components/auth/LoginModal.vue'
import RegisterModal from '@/components/auth/RegisterModal.vue'

const modalStore = useModalStore()

// Methods

function openLoginModal(){

    const originButton = event.currentTarget

    modalStore.open(
        LoginModal,
        {
            absolute:true
        },
        'increased slim h-auto',
        originButton,
     
    )
}

function openRegisterModal(){

    const originButton = event.currentTarget

    modalStore.open(
        RegisterModal,
        {
            absolute:true
        },
        'increased slim h-auto',
        originButton,
     
    )
}   

</script>
<template>

    <div class="view simple-container align-center">

        <div class="simple-container direction-column grow-1 width-100 height-100 max-width-1200 justify-center">

            <div class="border-radius-32 overflow-hidden position-relative height-0-100">

                <div class="content-container simple-container justify-right direction-column padding-32">

                    <div class="simple-container direction-column gap-24 z-index-1">
                        <span class="main-title">sb education</span>
                        <div class="simple-container gap-8 direction-row-column">
    
                            <button 
                                v-on:click="openLoginModal"
                                class="style-7 primary-container on-primary-container-text rounded weight-500 flex-0-1 simple-container justify-center"
                                >
                                Iniciar sesión
                            </button>
                            <button 
                                v-on:click="openRegisterModal"
                                class="style-7 surface-container rounded weight-500 flex-0-1 simple-container justify-center"
                                >
                                Crear cuenta
                            </button>
    
                        </div>
                    
                    </div>
                </div>

                <img src="/public/imagelanding.webp" class="image" alt="ilustración bonita">
            </div>

        </div>

    </div>


</template>

<style scoped>
.content-container{
    position:absolute;
    inset:0;
}
.content-container::before{
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 80%);
    z-index:0;
}

.main-title{
    font-size:120px;
    font-weight:600;
    line-height:0.8;
    color:rgba(255,255,255,0.8);
    /* mix-blend-mode: overlay; */
}

.image{
    width:100%;
    height: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    object-position: 0 -200px;
}

@media only screen and (max-width: 680px){
    .image{
       aspect-ratio: unset;
        object-position: center;
    }
    .main-title{
        font-size: 60px;
    }
}

</style>