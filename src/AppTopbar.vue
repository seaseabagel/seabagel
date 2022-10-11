<template>
	<div class="layout-topbar">
		<router-link to="/" class="layout-topbar-logo">
			<img alt="Logo" style="pointer-events: none;" :src="topbarImage()" />
			<span>FTTracker</span>
		</router-link>
		<button  v-if="isAuthenticated" class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
			<i class="pi pi-bars"></i>
		</button>
		<button class="p-link layout-topbar-menu-button layout-topbar-button"
			v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', 
			leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true}">
			<i class="pi pi-ellipsis-v"></i>
		</button>
		<ul class="layout-topbar-menu hidden lg:flex origin-top">
			<li>
				<button class="p-link layout-topbar-button" @click="changeCurrentTheme">
					<i class="pi pi-cog"></i>
					<span>Theme</span>
				</button>
			</li>
		</ul>
	</div>
</template>

<script>

import EventBus from './AppEventBus';
import { useAuth0 } from '@auth0/auth0-vue';

export default {
	setup() {
      const { isAuthenticated } = useAuth0();

      return {
        isAuthenticated
      };
    },
	data() {
		return {
			theme: 'saga-orange',
			returnValue: 0,
			userTheme: {}
		}
	},
	created(){
		this.getTheme()
	},
    methods: {
		getTheme(){
			if(localStorage.getItem('currentTheme') !== null){
				this.theme = JSON.parse(localStorage.getItem('currentTheme')).theme
				this.changeTheme(this.theme, this.isDark(this.theme))
			}
		},
		changeCurrentTheme(){
			this.returnValue = {
				0: 1,
				1: 2,
				2: 0,
			}[this.returnValue] || 0;
			this.theme = {
				0: 'saga-orange',
				1: 'vela-orange',
				2: 'arya-orange',
			}[this.returnValue] || 0;
			this.changeTheme(this.theme, this.isDark(this.theme))
		},
		isDark(x){
			switch(x) {
				case 'saga-orange':
					return false
				case 'vela-orange': 
					return true
				case 'arya-orange':
					return true
			}
		},
		changeTheme(theme, dark) {
			this.userTheme.theme = theme
			this.userTheme.dark = dark
			localStorage.setItem('currentTheme', JSON.stringify(this.userTheme));
			EventBus.emit('theme-change', { theme: theme, dark: dark });
		},
        onMenuToggle(event) {
            this.$emit('menu-toggle', event);
        },
		onTopbarMenuToggle(event) {
            this.$emit('topbar-menu-toggle', event);
        },
		topbarImage() {
			return this.$appState.darkTheme ? 'images/logo-white.svg' : 'images/logo-dark.svg';
		}
    },
	computed: {
		darkTheme() {
			return this.$appState.darkTheme;
		}
	}
}
</script>
