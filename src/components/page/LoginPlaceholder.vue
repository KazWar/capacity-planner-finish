<template>
	<div class="login-placeholder">
		<div class="login-container">
			<template  v-if="!error">
				<h1 class="success" v-html="msg.success"></h1>
			</template>
			<template v-else>
				<h1>{{ msg.error }}</h1>
				<button @click="redirectToNS">Inloggen</button>
			</template>
		</div>
	</div>
</template>

<script>
	import $snackbar from '@/modules/snackbar-module'
	import $loader from '@/modules/loader-module'
	export default {
		data: function () {
			return {
				msg: {
					success: 'U bent succesvol ingelogd',
					error: 'Welkom bij Capaciteitsplanner',
				},
				error: false
			}
		},
		mounted(){
			this.checkStatus();
		},
		methods: {
			getToken() {
				var vars = {};
				window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
					vars[key] = value;
				});
				return vars;
			},
			checkStatus(){
				let token = this.getToken().access_token;

				console.log(token)
				if(!token){
					this.error = true;
				} else {
					localStorage.setItem('sessionId', token);
					this._api.getMyInfo(token)
						.then(res => {
							const user = res
							const location = user.location
							$loader.message = 'Locatie opzoeken'
							localStorage.setItem('locationId', location.id)
							localStorage.setItem('locationName', location.name)
							localStorage.setItem('userId', user.id)
							localStorage.setItem('userEmail', user.email)
							localStorage.setItem('userFirstName', user.firstName)
							localStorage.setItem('userLastName', user.lastName)
							localStorage.setItem('applicationType', user.applicationType)
							$snackbar.add('Welkom bij locatie ' + location.name + '!')
							$loader.message = null
							setTimeout(() => {
								$loader.message = null
								window.location.reload();
							}, 2000)
						})
						.catch(response => {
							$loader.message = null
						})
				}
			},
			redirectToNS(){
				window.location.href = $http.socketBase + '/auth/saml';
			}
		}
	}
</script>

<style lang="scss" scoped>
.login-placeholder{
	position: relative;
	width: 100vw;
	height: 100vh;
	background-image: url('/static/img/background-login.jpg');
	background-size: cover;
	background-position: center;
	.login-container{
		position: absolute;
		left: 50%;
		top: 50%;
		width: 350px;
		height: 150px;
		border-radius: 2px;
		transform: translate(-50%, -50%);
		background: #fff;
		padding: 15px;
		text-align: center;
		box-shadow: 0 0 15px rgba(0,0,0,.2);
		h1{
			float: left;
			width: 100%;
			color: #0079d3;
			&.success{
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				font-size: 16px;
				line-height: 32px;
			}
		}
		button{
			display: inline-block;
			line-height: 35px;
			font-size: 16px;
			color: #fff;
			background: #0079d3;
			text-align: center;
			border: none;
			height: 35px;
			border-radius: 2px;
			padding: 0 15px;
			cursor: pointer;
			position: absolute;
			bottom: 15px;
			left: 50%;
			transform: translateX(-50%);
		}
	}
}
</style>
