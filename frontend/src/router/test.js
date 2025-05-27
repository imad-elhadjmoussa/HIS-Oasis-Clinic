import { createRouter, createWebHistory } from "vue-router";
import UserPage from "../pages/Users/UsersList.vue";
import ReceptionPage from "../pages/Reception/ReceptionPage.vue";
import RolesServicesPage from "../pages/Roles & Services/RolesServicesPage.vue";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/Auth/LoginPage.vue";
import DashboardLayout from "../layout/AdminDashboardLayout.vue";
import ReceptionDashboardLayout from "../layout/ReceptionDashboardLayout.vue";
import CashierLayout from "../layout/CashierLayout.vue";
import CashierPage from "../pages/Cashier/CashierPage.vue";
import CashierPrestationsList from "../pages/Cashier/CashierPrestationsList.vue";
import CashierHistory from "../pages/Cashier/CashierHistory.vue";
import FacturationLayout from "../layout/FacturationLayout.vue";
import FacturationHome from "../pages/Facturation/FacturationHome.vue";
import Patient from "../pages/Facturation/patient.vue";
import FacturePatient from "../pages/Facturation/facturePatient.vue";
import Borderau from "../pages/Facturation/Borderau.vue";
import Step from "../pages/Facturation/step.vue";
import FichesList from "../pages/Reception/Fiche/MedicalRecordsList.vue";
import FicheDetails from "../pages/Reception/Fiche/MedicalRecordDetails.vue";
import PatientsList from "../pages/Reception/Patient/PatientsList.vue";
import PatientDetails from "../pages/Reception/Patient/PatientDetails.vue";
import PreferencesPage from "../pages/Preferences/PreferencesPage.vue";
import AdminDashboardLayout from "../layout/AdminDashboardLayout.vue";
import AdminHomePage from "../pages/Admin/AdminHomePage.vue";

// Function to check authentication
const isAuthenticated = () => !!localStorage.getItem("user");

// **Base Public Routes**
const routes = [
    {
        path: "/login",
        name: "Login",
        component: LoginPage,
        beforeEnter: (to, from, next) => {
            if (isAuthenticated()) next("/"); // Redirect logged-in users
            else next();
        },
    },
];

// **Admin Routes (Full Dashboard)**
const adminRoutes = {
    path: "/",
    // component: AdminDashboardLayout,
    component: AdminHomePage,
    meta: { requiresAuth: true, roles: ["Admin"] },
    children: [
        { path: "", name: "Home", component: HomePage },
        { path: "users", name: "Users", component: UserPage },
        { path: "roles-services", name: "RolesServices", component: RolesServicesPage },
        { path: "preferences", name: "Preferences", component: PreferencesPage },
        // {
        //     path: "reception",
        //     name: "Reception",
        //     component: ReceptionPage,
        //     children: [
        //         { path: "patients", name: "Patients", component: PatientsList },
        //         { path: "patients/:patientId/fiches", name: "Fiches", component: FicheList, props: true },
        //         { path: "patients/:patientId/fiches/:ficheId/prestations", name: "Prestations", component: PrestationList, props: true },
        //     ],
        // },
        // { path: "/reception", component: ReceptionPage, meta: { requiresAuth: true, roles: ["Admin"] } },
        // { path: "/patients", component: PatientsList, meta: { requiresAuth: true, roles: ["Admin"] } },
        // { path: "/patients/:patientId/fiches", component: FicheList, props: true, meta: { requiresAuth: true, roles: ["Reception"] } },
        // { path: "/patients/:patientId/fiches/:ficheId/prestations", component: PrestationList, props: true, meta: { requiresAuth: true, roles: ["Admin"] } },
    ],
};


// Reception routes
const receptionistRoutes = {
    path: "/",
    component: ReceptionDashboardLayout,
    meta: { requiresAuth: true, roles: ["Reception"] },
    children: [
        { path: "", name: "Home", component: ReceptionPage },
        {
            path: "patients",
            children: [
                { path: "", component: PatientsList },
                { path: ":id", component: PatientDetails },
            ]
        },
        {
            path: "fiches",
            children: [
                { path: "", component: FichesList },
                { path: ":id", component: FicheDetails },
            ]
        }
        // {path:"fiche-nav",component:FichesNav}
        // { path: "patients", component: PatientsList, meta: { requiresAuth: true, roles: ["Reception"] } },
        // { path: "/patients/:patientId/fiches", component: PatientFicheList, props: true, meta: { requiresAuth: true, roles: ["Reception"] } },
        // { path: "/patients/:patientId/fiches/:ficheId/prestations", component: PrestationList, props: true, meta: { requiresAuth: true, roles: ["Reception"] } },
        // { path: "fiches", component: FichesList, meta: { requiresAuth: true, roles: ["Reception"] } },
    ],
};

const cashierRoutes = {
    path: "/",
    component: CashierLayout,
    meta: { requiresAuth: true, roles: ["Cashier"] },
    children: [
        { path: '/', component: CashierPage },

        { path: '/fiches/ficheId/prestations', component: CashierPrestationsList },
        // { path: '/fiches/ficheId/prestations/history', component: CashierHistory }
    ]
};

const facturationRoutes = {
    path: "/",
    component: FacturationLayout,
    meta: { requiresAuth: true, roles: ["Facturation"] },
    children: [
        { path: '', component: Step },
        { path: 'home', component: FacturationHome },
        { path: 'patient', component: Patient },
        { path: 'patientF', component: FacturePatient, props: true },
        { path: 'borderau', name: 'Borderau', component: Borderau, props: true }
    ]
}

    ;

// Create router instance
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// **Flag to track added routes**
let routesAdded = false;

// **Global Route Guard for Dynamic Role-Based Routing**
router.beforeEach((to, from, next) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        if (to.path !== "/login") return next("/login"); // Redirect guests to login
        return next();
    }

    if (!routesAdded) {
        if (user.role === "Admin") {
            router.addRoute(adminRoutes);  // Load admin routes dynamically
        } else if (user.role === "Reception") {
            // receptionistRoutes.forEach(route => router.addRoute(route)); // Load receptionist routes dynamically
            router.addRoute(receptionistRoutes);
        } else if (user.role === "Cashier") {
            router.addRoute(cashierRoutes);
        } else if (user.role === "Facturation") {
            router.addRoute(facturationRoutes);
        }

        routesAdded = true;
        return next(to.fullPath); // Reload current route
    }

    next(); // Continue navigation
});



export default router;
