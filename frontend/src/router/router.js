import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import { useUserStore } from './../stors/user'; // Import the user store

import UserPage from '../pages/Users/UsersList.vue';
import ReceptionPage from '../pages/Reception/ReceptionPage.vue';
import LoginPage from '../pages/Auth/LoginPage.vue';
import ReceptionDashboardLayout from '../layout/ReceptionDashboardLayout.vue';
import PatientsList from '../pages/Reception/Patient/PatientsList.vue';
import PatientDetails from '../pages/Reception/Patient/PatientDetails.vue';
import UsersLayout from '../layout/UsersLayout.vue';
import AdminHomePage from '../pages/Admin/AdminHomePage.vue';
import MedicalRecordDetails from '../pages/Reception/MedicalRecord/MedicalRecordDetails.vue';
import MedicalRecordList from '../pages/Reception/MedicalRecord/MedicalRecordsList.vue';
import PreferencesDashboardLayout from '../layout/PreferencesDashboardLayout.vue';
import CashierPage from '../pages/Cashier/CashierPage.vue';
import CashierPrestationsList from '../pages/Cashier/CashierPrestationsList.vue';
import CashierLayout from '../layout/CashierLayout.vue';
import AgreementDashboardLayout from '../layout/AgreementDashboardLayout.vue';
import Companies from '../components/company/pages/Companies.vue';
import Contracts from '../components/contract/pages/Contracts.vue';
import Company from '../components/company/pages/Company.vue';
import Contract from '../components/contract/pages/Contract.vue';
import Annex from '../components/annex/pages/Annex.vue';
import Avenant from '../components/avenant/pages/Avenant.vue';
import SettingPage from '../pages/Setting/SettingPage.vue';
import SpecialtiesList from '../pages/Preferences/SpecialtiesList.vue';
import PrestationsPage from '../pages/Preferences/PrestationsPage.vue';
import DoctorsPage from '../pages/Preferences/DoctorsPage.vue';
import WaitingRoomsPage from '../pages/Preferences/WaitingRoomsPage.vue';
import ModalityPage from '../pages/Preferences/ModalityPage.vue';
import Dashbord from '../components/dashbord/Dashbord.vue';


// Base Public Routes
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        beforeEnter: async (to, from, next) => {
            const userStore = useUserStore();
            await userStore.fetchSession();
            if (userStore.isAuthenticated) next('/'); // If already logged in, redirect to home
            else next(); // Otherwise, allow login page
        }
    },
];

// Admin Routes
const adminRoutes = [
    { path: '/', component: AdminHomePage },
    {
        path: '/users',
        component: UsersLayout,
        children: [
            { path: '', name: 'Users', component: UserPage },
        ]
    },
    {
        path: '/reception',
        component: ReceptionDashboardLayout,
        children: [
            { path: '', component: ReceptionPage },
            { path: 'patients', name: 'Patients', component: PatientsList },
            { path: 'patients/:id', name: 'PatientDetails', component: PatientDetails },
            { path: 'medical-records', name: 'MedicalRecords', component: MedicalRecordList },
            { path: 'medical-records/:id', name: 'MedicalRecord', component: MedicalRecordDetails },
            { path: 'settings', name: 'Settings', component: SettingPage },
        ]
    },
    ,
    {
        path: '/preferences',
        component: PreferencesDashboardLayout,
        children: [
            { path: 'specialties', component: SpecialtiesList },
            { path: 'prestations', component: PrestationsPage },
            { path: 'doctors', component: DoctorsPage },
            { path: 'waiting-rooms', component: WaitingRoomsPage },
            { path: 'modalities', component: ModalityPage },
            // { path: 'settings', name: 'Settings', component: SettingPage },
        ]
    },
    {
        path: '/cashier',
        component: CashierLayout,
        children: [
            { path: '', component: CashierPage },
            { path: 'fiches/:ficheId/prestations', component: CashierPrestationsList }
        ]
    },
    {
        path: '/conventionoffice',
        component: AgreementDashboardLayout,
        children: [
            { path: 'companies', component: Companies },
            // { path: 'contracts', component: Contracts },
            { path: 'company/:id', component: Company },
            { path: 'contract/:id', component: Contract },
            { path: 'Annex/:id', component: Annex },
            { path: 'Avenant/:id', component: Avenant },
            { path: '', component: Dashbord },
        ]
    }
];

// Reception Routes
const receptionistRoutes = {
    path: '/',
    component: ReceptionDashboardLayout,
    children: [
        { path: '', component: ReceptionPage },
        { path: 'patients', component: PatientsList },
        { path: 'patients/:id', component: PatientDetails },
        { path: 'medical-records', component: MedicalRecordList },
        { path: 'medical-records/:id', component: MedicalRecordDetails },
        // { path: 'settings', name: 'Settings', component: SettingPage },
    ],
};

const convRoutes = {
    path: '/',
    component: AgreementDashboardLayout,
    children: [
        { path: 'companies', component: Companies },
        // { path: 'contracts', component: Contracts },
        { path: 'company/:id', component: Company },
        { path: 'contract/:id', component: Contract },
        { path: 'Annex/:id', component: Annex },
        { path: 'Avenant/:id', component: Avenant },
        { path: '', component: Dashbord },
    ]
}

//contracts route
const contractsRoutes = [
    { path: '/', redirect: '/companies' },
    { path: '/companies', component: Companies },
    { path: '/contracts', component: Contracts },
    {
        path: '/company/:id',
        component: Company,
    },
    {
        path: '/contract/:id',
        component: Contract,
    },
    {
        path: '/Annex/:id',
        component: Annex,
    },
    {
        path: '/Avenant/:id',
        component: Avenant,
    }
];


// cashier routes
const cashierRoutes = {
    path: '/',
    component: CashierLayout,
    children: [
        { path: '', component: CashierPage },
        { path: 'fiches/:ficheId/prestations', component: CashierPrestationsList }
    ]
};


// Create router instance
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Track if dynamic routes have been added
let routesAdded = false;

// Global route guard
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    await userStore.fetchSession(); // Ensure session is fetched

    // Allow login page without checking session
    if (to.path === '/login') return next();

    if (userStore.isAuthenticated) {
        console.log(userStore.role);
        if (!routesAdded) {
            if (userStore.role === 'Admin') {
                adminRoutes.forEach(route => router.addRoute(route)); // Add admin routes dynamically
            } else if (userStore.role === 'Reception') {
                router.addRoute(receptionistRoutes); // Add receptionist routes dynamically
            } else if (userStore.role === 'Cashier') {
                router.addRoute(cashierRoutes); // Add cashier routes dynamically
            }else if (userStore.role === 'Convention') {
                router.addRoute(convRoutes); // Add conv routes dynamically
            }
            routesAdded = true;
            return next(to.fullPath); // Retry original route after adding new routes
        }
        next(); // Continue navigation if routes are already added
    } else {
        next('/login'); // If not authenticated, redirect to login
    }
});

export default router;
