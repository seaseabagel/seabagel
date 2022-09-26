import { createRouter, createWebHistory } from "vue-router";
    import View from "@/components/View"
    import Login from "@/components/Login"
    import Admin from "@/components/Admin"
    import App from './App.vue';

    export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { 
            path: "/", 
            name: 'app',
            component: App,
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: View
                },
                { 
                    path: "/login",
                    name: 'Login',
                    component: Login
                },
                { 
                    path: "/admin",
                    name: 'Admin',
                    component: Admin
                }
            ]
        }
    ]
});
