<template>
	<div class="layout-footer">
		by <img alt="Logo" style="pointer-events: none;" :src="footerImage()" height="20" class="mr-2" />
	</div>
</template>

<script>
	export default {
		name: "AppFooter",
		methods: {
			footerImage() {
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