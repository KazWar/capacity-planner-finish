<template>
    <div class="login">
        <div class="login-modal">
            <div class="logo"></div>

            <div class="login-modal-title">Welkom bij Capaciteitsplanner</div>

            <form @submit.prevent.stop="attemptLogin()" class="login-modal-form">
                <div class="form-group">
                    <input type="email" placeholder="E-mailadres" :class="{'warning': formWarnings['email']}" v-model="email" autocomplete="email"/>
                    <md-tooltip md-direction="bottom" :style="{'display': formWarnings['email'] === '' ? 'none' : 'block'}">{{formWarnings['email']}}</md-tooltip>
                </div>
                <div class="form-group">
                    <input type="password" placeholder="Wachtwoord" autocomplete="username" :class="{'warning': formWarnings['password']}" v-model="password"/>
                    <md-tooltip md-direction="bottom" :style="{'display': formWarnings['password'] === '' ? 'none' : 'block'}">{{formWarnings['password']}}</md-tooltip>
                </div>
                <button type="submit">
                    <span>Aanmelden</span>
                    <div class="right">
                        <i class="fa fa-arrow-right"></i>
                    </div>
                </button>
            </form>

            <!--button class="forgot-password" @click="onForgotPassword()">
                <span class="arrow"><i class="fa fa-arrow-right"></i></span>
                <span class="content">Wachtwoord vergeten?</span>
            </button!-->
        </div>
    </div>
</template>

<script>
import $snackbar from '@/modules/snackbar-module'
import $loader from '@/modules/loader-module'

export default {
    data: function () {
        return {
            email: '',

            password: '',

            formWarnings: {
                'email': '',
                'password': ''
            }
        }
    },

    mounted: function () {
        var message = this.$route.params.message
        if (message) {
            $snackbar.addWarning(message)
        }
    },

    methods: {
        /**
         * When the forgot password button has been pressed
         */
        onForgotPassword () {
            $snackbar.add('Wachtwoord vergeten is nog niet geimplementeerd.')
        },

        /**
         * Attempt to login to the application
         */
        attemptLogin () {
            this.validateForm()

            if (this.isFormValidated()) {
                this.performLogin()
            }
        },

        /**
         * Perform the login
         */
        performLogin () {
            $loader.message = 'Authorizeren'
            this._api.login(this.email, this.password).then(res => {
                var session = res
                localStorage.setItem('sessionId', session.id)

                $loader.message = 'Gebruiker opzoeken'
                this._apigetUserDetail(session.userId).then(res => {
                    var user = res

                    $loader.message = 'Locatie opzoeken'
                    this._api.getLocationDetail(user.locationId).then(res => {
                        var location = res

                        localStorage.setItem('locationId', location.id)
                        localStorage.setItem('locationName', location.name)
                        localStorage.setItem('userId', user.id)
                        localStorage.setItem('userEmail', user.email)
                        localStorage.setItem('userFirstName', user.firstName)
                        localStorage.setItem('userLastName', user.lastName)
                        localStorage.setItem('applicationType', user.applicationType)

                        this.$router.push({
                            name: 'WorkOrders'
                        })

                        $snackbar.add('Welkom bij locatie ' + location.name + '!')
                        $loader.message = null
                        window.location.reload()
                    }).catch(response => {
                        $loader.message = null
                    })
                }).catch(response => {
                    $loader.message = null
                })
            }).catch(response => {
                switch (response.status) {
                    case 401:
                        $snackbar.addWarning('Verkeerde gebruikersnaam en/of wachtwoord.')
                    break
                }
                $loader.message = null
            })
        },

        /**
         * Validate the form
         */
        validateForm () {
            for (var warningPropertyName in this.formWarnings) {
                this.formWarnings[warningPropertyName] = ''
            }
            if (this.email.length === 0) {
                this.formWarnings.email = 'Gelieve een e-mailadres op te geven.'
                $snackbar.add(this.formWarnings.email)
            }
            if (this.password.length === 0) {
                this.formWarnings.password = 'Gelieve een wachtwoord op te geven.'
                $snackbar.add(this.formWarnings.password)
            }
        },

        /**
         * Check if the form is validated
         */
        isFormValidated () {
            for (var warningPropertyName in this.formWarnings) {
                var warningPropertyValue = this.formWarnings[warningPropertyName]
                if (warningPropertyValue !== '') {
                    return false
                }
            }
            return true
        }
    }
}
</script>
<style lang="scss" scoped>
@import "../../assets/scss/variables";

.login {
	background-color: map-get($colors, default-blue);
	background-image: url('/static/img/background-login.jpg');
	background-size: cover;
	background-position: center;
	width: 100vw;
	height: 100vh;

	.login-modal {
		background: map-get($colors, default-yellow);

		position: absolute;

		@media(min-width: map-get($screen, min-width)) {
			width: 400px;
			height: 400px;
			right: 50px;
			bottom: 50px;
		}

		@media(max-width: map-get($screen, max-width)) {
			width: 80%;
			max-width: 400px;
			height: 400px;
			max-height: 400px;
			left: 50%;
			top: 50%;
			-moz-transform: translate(-50%, -50%);
			-o-transform: translate(-50%, -50%);
			-webkit-transform: translate(-50%, -50%);
			transform: translate(-50%, -50%);
		}

		padding: 30px 20px;

		img, .logo {
			position: relative;
			width: 20%;
			background: url(/static/img/oxplus-logo.png) center center no-repeat;
			background-size: contain;
			height: 50px;
		}

		.login-modal-title {
			font-weight: 300;
			font-size: 1.4em;
			color: map-get($colors, default-blue);
			margin-top: 15px;
		}

		.login-modal-form {
			margin-top: 30px;

			.form-group {
				&:not(:first-child) {
					margin-top: 10px;
				}

				input {
					width: 100%;
					padding: 15px 10px;
					background: white;
					border: 0;
					color: map-get($colors, dark-grey);
					border-left: 2px solid white;
					font-size: 1.1em;

					&.warning {
						border-left: 2px solid map-get($colors, default-red);
						color: map-get($colors, default-red);
					}

					&:focus {
						&:not(.warning) {
							border-color: rgba(map-get($colors, light-blue), 0.8);
							border-left: 2px solid map-get($colors, light-blue);
							color: map-get($colors, light-blue);
						}
						&.warning {
							border-color: rgba(map-get($colors, default-red), 0.8);
							border-left: 2px solid map-get($colors, default-red);
							color: map-get($colors, default-red);
						}
						outline: 0 none;
					}
				}
			}

			button {
				position: relative;
				margin-top: 10px;
				display: block;
				width: 100%;
				background: map-get($colors, light-blue);
				color: map-get($colors, light-grey) * 1.2;

				font-size: 1.1em;
				border: 0;
				border-bottom: 2px solid map-get($colors, light-blue) / 1.2;

				span, .right {
					vertical-align: top;
				}

				span {
					display: inline-block;
					position: relative;
					text-align: center;
					width: 100%;
					height: 100%;
					padding: 10px 0;
				}

				.right {
					position: absolute;
					display: inline-block;
					vertical-align: top;
					right: 15px;
					top: 10px;
					transition: all 0.3s ease;
				}

				&:hover {
					cursor: pointer;
					background: map-get($colors, light-blue) / 1.2;
					border-bottom: 2px solid map-get($colors, light-blue) / 1.5;

					.right {
						right: 12.5px;
					}
				}
			}
		}

		.forgot-password {
			border: 0;
			background: none;
			color: map-get($colors, default-blue);
			font-size: 1em;
			margin-top: 25px;

			.arrow {
				margin-right: 10px;
				transition: all 0.3s ease;
			}

			&:hover {
				cursor: pointer;

				.arrow {
					margin-left: 5px;
					margin-right: 5px;
				}

				.content {
					border-bottom: 1px solid map-get($colors, default-blue);
				}
			}
		}
	}
}
</style>
