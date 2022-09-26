<template>
    <div class="card surface-0 flex align-items-center justify-content-center overflow-hidden">
        <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
            <div class="col-12 mt-5 xl:mt-0 text-center">
                
            </div>
            <div class="col-12 xl:col-6" style="border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 30%);">
                <div class="h-full w-full m-0 py-7 px-4" style="border-radius:53px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
                    <div class="text-center mb-5">
                        <img :src="'layout/images/logo-' + logoColor + '.svg'" alt="Sakai logo" class="mb-5" style="width:81px; height:60px;">
                        <div class="text-900 text-3xl font-medium mb-3">Welcome, {{userName}}!</div>
                        <span class="text-600 font-medium">{{isLogin}}</span>
                    </div>
                
                    <div class="w-full md:w-10 mx-auto">
                      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-fluid">
                          <Button type="submit" :disabled="isAuthenticated == true" label="Login" class="mt-2"  @click="login" />
                          <Button type="submit" :disabled="isAuthenticated == false"  label="Log out" class="mt-2"  @click="logout" />
                      </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect, user, isAuthenticated } = useAuth0();
      const { logout } = useAuth0();

      return {
        login: () => {
          loginWithRedirect();
        },
        logout: () => {
          logout({ returnTo: 'https://not-test-vue-tracker.onrender.com/' });
        },
        isAuthenticated,
        user
      };
    },
    computed: {
        logoColor() {
            if (this.$appState.darkTheme) return 'white';
            return 'dark';
        },
        isLogin(){
            return !this.isAuthenticated ? 'Sign in to continue' : 'Admin panel is ready'
        },
        userName(){
            return !this.isAuthenticated ? 'Guest' : this.user.nickname
        }
    }
  };
</script>
<style lang="scss" scoped>
.pi-eye {
    transform:scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform:scale(1.6);
    margin-right: 1rem;
}
</style>