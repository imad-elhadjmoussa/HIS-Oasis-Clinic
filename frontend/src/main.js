import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { definePreset } from '@primeuix/themes';
import ToastService from 'primevue/toastservice';

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {fas } from '@fortawesome/free-solid-svg-icons';
import router from './router/router';
import ui from '@nuxt/ui/vue-plugin'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia';

import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary:{
            50: '{gray.50}',
            100: '{gray.100}',
            200: '{gray.200}',
            300: '{gray.300}',
            400: '{gray.400}',
            500: '{gray.500}',
            600: '{gray.600}',
            700: '{gray.700}',
            800: '{gray.800}',
            900: '{gray.900}',
            950: '{gray.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{gray.900}',
                    inverseColor: '#ffffff',
                    hoverColor: '{gray.800}',
                    activeColor: '{gray.700}'
                },
            },
        }
    }
});

library.add(fas);
const app = createApp(App)
app.use(router) 
app.use(PrimeVue, {
    theme: {
        preset: MyPreset, // Set a default theme
        options: {
            prefix: 'p', // Prefix for CSS classes
            darkModeSelector: false || 'none', // CSS class to apply for dark mode
        },
        
    }
});
app.use(PrimeVue)
app.use(ToastService);
app.use(ConfirmDialog);
app.use(ConfirmationService);
app.component('ConfirmDialog', ConfirmDialog);
app.use(createPinia()) 
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app')

