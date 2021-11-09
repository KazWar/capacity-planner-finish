<script>
import Treeselect from '@riophae/vue-treeselect'
import LocaleChanger from '@/common/components/locale-changer.vue'

export default {
	props: ['activeTab'],

	components: {
		LocaleChanger,
		'treeselect': Treeselect
	},
	data: function () {
		return {
			mobileNav: false,
			menuType: null,
			qrcs: {
				admin: {
					label: 'Handleiding',
				},
				other: {
					label: 'Handleiding',
				}
			},

			notifications: [],

			locations: [],

			locationId: null,

			lastApplicationTypeForNotifications: null,
		}
	},

	computed: {
		selectedLocationId () {
			return this.locationId
		},
		filteredLocations () {
			const filter = this.$route.meta.locationFilter
			const locations = this.parseValues(this.$store.getters.GET_LOCATIONS)
			return filter ? locations.filter(item => item.locationType.toLowerCase() === filter) : locations
		},
		applicationType () {
			return localStorage.getItem('applicationType')
		},
		tabs: function () {
			const routes = this.$router.options.routes
			const sb = routes.filter(item => item.meta && item.meta.type === 'SB')
			const all = routes.filter(item => item.meta && item.meta.type === 'ALL')
			const mbn = routes.filter(item => item.meta && item.meta.type === 'MBN')
			const ob = routes.filter(item => item.meta && item.meta.type === 'OB')
			const admin = routes.filter(item => item.meta && item.meta.type === 'ADMIN')
			switch (this.applicationType) {
				case 'SB':
					return [...sb, ...all]
				case 'MBN':
					return [...mbn, ...all]
				case 'OB':
					return [...ob, ...all]
				case 'ADMIN':
					return [...mbn, ...all, ...sb, ...ob, ...admin]
				default:
					return []
			}
		},
	},

	beforeCreate () {
		this.$store.dispatch('GET_LOCATIONS_FROM_API', {vm:this})
	},
	mounted () {
		this.locationId = +this.$store.getters['GET_CURRENT_LOCATION_ID']
	},
	methods: {
		openNewLocatioin (e) {
			const eventLocationId = +e
			const sessionLocationId = +sessionStorage.getItem('locationId')
			if (eventLocationId && eventLocationId !== sessionLocationId) {
				this.locationId = null
				const eventLocationName = this.filteredLocations.find(x => x.id === eventLocationId)
				localStorage.setItem('locationId', e)
				localStorage.setItem('locationName', eventLocationName.name || 'N/A')
				sessionStorage.setItem('locationId', null)
				window.location.reload()
			}
		},
		openMobileMenu(type){
			this.menuType = type;
			this.mobileNav = true;
		},

		/**
		 * Get the location name of the currently logged on user
		 */
		getLocationName () {
			return localStorage.getItem('locationName')
		},

		/**
		 * Get the full name of the currently logged on user
		 */
		getFullName () {
			return localStorage.getItem('userFirstName') + ' ' + localStorage.getItem('userLastName')
		},

		/**
		 * Logs the current user out of the application
		 */
		logout () {
			this._api.logout().then(res => {
				console.log('test')
				localStorage.removeItem('sessionId')
				localStorage.removeItem('locationId')
				localStorage.removeItem('locationName')
				localStorage.removeItem('userId')
				localStorage.removeItem('userEmail')
				localStorage.removeItem('userFirstName')
				localStorage.removeItem('userLastName')

				this.$router.push({
					name: 'LoginPlaceholder',
					params: {
						message: 'U bent succesvol uitgelogd.'
					}
				})
			})
		}
	}
}
</script>

<template>
    <nav id="navigation">
        <div class="navigation-container">
            <div class="navigation-top">
                <img src="/static/img/oxplus-logo.png" alt="Logo OXplus" style="width: 210px; height: 45px;">
                <span>Capaciteitsplanner | {{applicationType}}</span>

                <div class="navigation-right">
					<div class="navigation-right-location" v-if="applicationType !== 'MBN'">
						<TreeSelect
							:value="selectedLocationId"
							:options="filteredLocations"
							options-label="name"
							label=""
							:borderless="false"
							:clearable="false"
							:searchable="true"
							:selectSize="52"
							:selectWidth="200"
                            :hideUnknown="true"
                            additionalSearch="station"
							@input="openNewLocatioin"
						/>
                    </div>
					<div class="navigation-right-user">
                        <div class="navigation-right-user-left">
                            <span :style="{'line-height': applicationType === 'MBN' ? '40px' : 'auto'}">{{getFullName()}}</span>
                            <span v-if="applicationType !== 'MBN'">Locatie {{getLocationName()}}</span>
                        </div>
						<div class="navigation-right-user-right">
                            <icon name="gebruiker" color="rgb(0, 40, 108)" :size="60" :style="{
                                transform: 'translate(12.5px, -15px)',
                                'margin-right': 0
                            }"/>
                        </div>
						<div class="navigation-right-user-menu">
                            <button @click="logout()">Uitloggen</button>
                        </div>
                    </div>
                </div>
            </div>

            <span class="m-button user" @click="openMobileMenu('profile')" v-if="menuType == null">
                <icon name="gebruiker" size="40" color="#00286c"/>
            </span>

            <div class="navigation-bottom">
                <router-link  v-for="(tab, index) in tabs" :key="index" :to="tab.path" >
                    {{tab.meta.title}}
					<template v-if="applicationType === 'ADMIN' && tab.meta.dynamicTitle">
						{{tab.meta.type}}
					</template>
                </router-link>
            </div>

			<locale-changer></locale-changer>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
@import "../assets/scss/variables";

$wireframeOpacity: 0;

#navigation {
	grid-area: header;
	font-family: 'Open Sans', sans-serif;
	background: white;
	border-bottom: 2px solid map-get($colors, default-grey);
	padding: 0 110px;

	.navigation-container {
		.navigation-top {
			padding: 25px 20px;
			padding-bottom: 33px;
			padding-right: 10px;

			img {
				width: 90px;
				height: auto;
				vertical-align: top;
			}

			span {
				display: inline-block;
				padding-top: 7.5px;
				margin-left: 30px;
				font-weight: 200;
				font-size: 1.75em;
				color: map-get($colors, dark-blue);
			}

			.navigation-right {
				float: right;
				padding-right: 0;

				.navigation-right-search, .navigation-right-user, .navigation-right-notifications, .navigation-right-location {
					display: inline-block;
					vertical-align: top;
				}

				.navigation-right-search {
					.navigation-right-search-left, .navigation-right-search-right {
						display: inline-block;
						vertical-align: top;
					}

					.navigation-right-search-left {
						input {
							border: 0;
							height: 40px;
							width: 220px;
							font-size: 1.1em;
							border-bottom: 2px solid map-get($colors, default-blue);
							color: #ccc;

							&::-webkit-input-placeholder { /* Chrome/Opera/Safari */
								color: #ccc;
								transition: all 0.3s ease;
							}
							&::-moz-placeholder { /* Firefox 19+ */
								color: #ccc;
								transition: all 0.3s ease;
							}
							&:-ms-input-placeholder { /* IE 10+ */
								color: #ccc;
								transition: all 0.3s ease;
							}
							&:-moz-placeholder { /* Firefox 18- */
								color: #ccc;
								transition: all 0.3s ease;
							}

							&:focus {
								border-color: rgba(map-get($colors, default-blue), 0.8);
								color: map-get($colors, default-blue);
								outline: 0 none;

								&::-webkit-input-placeholder { /* Chrome/Opera/Safari */
									font-size: 0.9em;
								}
								&::-moz-placeholder { /* Firefox 19+ */
									font-size: 0.9em;
								}
								&:-ms-input-placeholder { /* IE 10+ */
									font-size: 0.9em;
								}
								&:-moz-placeholder { /* Firefox 18- */
									font-size: 0.9em;
								}
							}
						}
					}

					.navigation-right-search-right {
						button, a {
							background: none;
							padding: 0 10px;
							border: 0;

							i {
								padding-top: 5px;
								padding-bottom: 5px;
								font-size: 30px;
								color: map-get($colors, default-blue);
							}
						}
					}
				}

				.navigation-right-user {
					position: relative;
					margin-left: 40px;
					padding: 5px 10px;
					height: 50px;

					.navigation-right-user-left, .navigation-right-user-right {
						display: inline-block;
						vertical-align: top;
					}

					.navigation-right-user-left {
						span {
							margin-left: 0;
							display: block;
							padding-top: 0;

							&:first-child {
								font-size: 1.2em;
								font-weight: bold;
								text-align: right;
							}

							&:nth-child(2) {
								font-size: 1.1em;
								text-align: right;
							}
						}
					}

					.navigation-right-user-right {
						margin-top: 5px;
						margin-left: -10px;

						i {
							font-size: 30px;
							color: map-get($colors, default-blue);
						}
					}

					.navigation-right-user-menu {
						display: none;
						overflow-y: hidden;
						background: #eee;
						position: absolute;
						top: 50px;
						width: 100%;
						right: 0;
						padding: 10px;
						padding-top: 0;
						z-index: 1000;
						box-sizing: border-box;

						button, a, span {
							display: block;
							width: 100%;
							background: #0079d3;
							text-align: center;
							color: #eee;
							margin: 0;
							border: 0;
							font-size: 16px;
							padding: 10px 0;

							&:hover {
								cursor: pointer;
								background: #00286c;
								text-decoration: none;
							}

							&:not(:first-child) {
								margin-top: 5px;
							}
						}

						span{
							font-weight: 500;
						}

						&:hover {
							cursor: initial;
						}
					}

					&:hover {
						cursor: pointer;
						background: #eee;

						.navigation-right-user-menu {
							display: block;
						}
					}
				}

				.navigation-right-notifications, .navigation-right-notifications-menu-extra-padding-bottom, .navigation-right-notifications-menu-extra-padding-left, .navigation-right-notifications-menu-extra-padding-right {
					&:hover {
						.navigation-right-notifications-menu, .navigation-right-notifications-menu-caret-container, .navigation-right-notifications-menu-extra-padding-bottom, .navigation-right-notifications-menu-extra-padding-left, .navigation-right-notifications-menu-extra-padding-right {
							display: block;
						}

						.icon-container {
							background: #eee;
						}
					}
				}

				.navigation-right-notifications {
					position: relative;
					padding: 0 10px;
					margin-left: 10px;
					z-index: 1000000000;
					user-select: none;
					-moz-user-select: none;
					-webkit-user-select: none;
					-o-user-select: none;

					.icon-container {
						width: 100%;
						height: 100%;

						&:hover {
							cursor: pointer;
						}
					}

					.navigation-right-notifications-menu-extra-padding-bottom {
						display: none;
						height: 20px;
						position: absolute;
						width: 500px;
						right: 0;
						top: 100%;
						background: rgba(blue, $wireframeOpacity);

						&:hover {
							cursor: default;
						}
					}

					.navigation-right-notifications-menu-extra-padding-left {
						display: none;
						height: 70px;
						position: absolute;
						width: 260px;
						right: 240px;
						top: 0%;
						background: rgba(red, $wireframeOpacity);

						&:hover {
							cursor: default;
						}
					}

					.navigation-right-notifications-menu-extra-padding-right {
						display: none;
						height: 70px;
						position: absolute;
						width: 70px;
						right: 70px;
						top: 0%;
						background: rgba(purple, $wireframeOpacity);

						&:hover {
							cursor: default;
						}
					}

					.navigation-right-notifications-menu-caret-container {
						display: none;
						position: absolute;
						top: 100%;
						left: 50%;
						width: 30px;
						height: 30px;
						transform: translate(-50%, 5px);
						-o-transform: translate(-50%, 5px);
						-webkit-transform: translate(-50%, 5px);
						-moz-transform: translate(-50%, 5px);

						&:hover {
							cursor: default;
						}

						.navigation-right-notifications-menu-caret {
							position: absolute;
							width: 100%;
							height: 100%;
							background: white;
							transform: rotate(45deg);
							box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
							-o-box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
							-moz-box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
							-webkit-box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
							border: 0.5px solid rgba(#aaa, 0.5);
						}
						.navigation-right-notifications-menu-box-shadow-hider {
							position: absolute;
							width: 100%;
							height: 100%;
							margin-top: 0.5px;
							background: white;
							transform: rotate(45deg);
						}
					}

					.navigation-right-notifications-menu {
						display: none;
						position: fixed;
						top: 60px;
						transform: translateY(15px);
						background: white;
						width: 500px;
						right: 130px;
						padding: 25px 0 ;
						box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
						-o-box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
						-moz-box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
						-webkit-box-shadow: 1px 2px 4px rgba(#AAAAAA, 0.5);
						border: 0.5px solid rgba(#aaa, 0.5);
						box-sizing: border-box;
						max-height: 510px;
						overflow: hidden;
						// Hide scrollbar in all browsers except firefox
						.navigation-right-notifications-menu-content::-webkit-scrollbar {
							width: 5px;
							height: 5px;
						}

						.navigation-right-notifications-menu-content {
							overflow-y: scroll;
							max-height: 460px;
							position: relative;
							width: calc(100% + 17px);
							&:hover {
								cursor: default;
							}
							.notification-item{
								padding-left: 15px;
								padding-right: 15px;
							}
						}
					}
				}
			}
		}

		.navigation-bottom {
			display: flex;
			margin-left: 25px;
			flex-wrap: wrap;

			button, a {
				font-family: Arial,serif;
				text-decoration: none;
				position: relative;
				border: 0;
				background: transparent;
				color: map-get($colors, light-blue);
				line-height: 17px;
				font-size: 14px;
				text-align: left;
				padding-bottom: 5px;
				box-sizing: border-box;
				border-bottom: 3px solid transparent;

				&.router-link-active {
					border-bottom: 3px solid map-get($colors, light-blue);
					color: map-get($colors, light-blue);
				}

				&:not(:first-child) {
					margin-left: 40px;
				}

				&:hover {
					cursor: pointer;
					border-bottom: 3px solid map-get($colors, light-blue);
					color: map-get($colors, light-blue);
					text-decoration: none;
				}

				.badge {
					position: absolute;
					right: -20px;
					top: -10px;
					border-radius: 100%;
					width: 20px;
					height: 20px;
					line-height: 20px;
					text-align: center;
					font-size: 0.7em;
					font-weight: bold;
					background: map-get($colors, default-yellow);
				}
			}
		}
	}
}
@media only screen and (max-width : 1791px) {
	#navigation {
		.navigation-container{
			.navigation-bottom{
				a {
					font-size: 13px !important;
					&:not(:first-child) {
						margin-left: 13px !important;
					}
				}
			}
		}
	}
}
@media only screen and (max-width : 1400px) {
	#app {
		#navigation{
		padding: 15px 15px 0px 15px;
		width: 100%;
		max-width: 1600px;
		margin: 0 auto;
		height: 112px;
		position: relative;
		border: none;
		box-shadow: 0 4px 2px -2px rgba(0, 0, 0, .1);
		.navigation-container{
			float: left;
			width: 100%;
			clear: both;
		}
		.navigation-top{
			padding: 0;
			.navigation-right{
				float: right;

				.navigation-right-location{
					.picker-container{
						.picker-round{
							border-radius: 0;
							line-height: 40px!important;
							height: 40px!important;
							.left{
								line-height: 38px;
								padding: 0 5px 0 10px;
							}
							.right{
								margin: 0!important;
								padding: 0;
							}
						}
						.picker-menu-container{
							width: 320px;
							position: absolute;
							right: 0;
							top: 100%;
						}
					}
				}
				.navigation-right-user{
					height: 40px;
					padding: 5px 10px;
					top: -5px;
					&:hover{
						background: #eeeeee;
					}
					.navigation-right-user-left{
						position: relative;
						z-index: 999;
						span{
							text-align: left;
						}
					}
					.navigation-right-user-right{
						width: 40px;
						height: 40px;
						margin: 0!important;
						position: relative;
						.icons{
							width: 40px!important;
							height: 40px!important;
							position: absolute;
							left: 0;
							top: 0;
							transform: none!important;
						}
					}
					.navigation-right-user-menu{
						top: 40px;
						padding-top: 15px;
						z-index: 15;
					}
				}
				.navigation-right-notifications{
					width: 40px;
					height: 40px;
					padding: 0;
					z-index: 1;
					.icon-container{
						.icons{
							width: 40px!important;
							height: 40px!important;
						}
					}
					.navigation-right-notifications-menu{
						top: 40px;
						right: 13px;
					}
				}
			}
		}
		.navigation-bottom{
			float: left;
			clear: both;
			width: 100%;
			margin: 0;
			margin-top: 20px;
			margin-bottom: 0;
			button{
				font-size: 16px;
				margin-left: 0;
				padding: 0 5px;
				position: relative;
				line-height: 40px;
				margin-left: 5px;
				top: 3px;
				&:after{
					width: 0;
					height: 2px;
					background: #0079d3;
					content: '';
					position: absolute;
					left: 0;
					bottom: 0px;
					display: block;
					z-index: 9999;
					transition-duration: .2s;
				}
				&:first-child{
					margin-left: 0;
					padding-left: 0;
				}
				&:hover, &.selected{
					border: none;
					&:after{
						width: 100%;
					}
				}
			}
		}
	}
	}
}
@media only screen and (max-width : 1190px) {
	#navigation {
		.navigation-container{
			.navigation-bottom{
				a {
					text-align: center;
					max-width: 131px;
					display: flex;
					align-items: flex-end;
					font-size: 12px !important;
					&:not(:first-child) {
						margin-left: 11px !important;
					}
				}
			}
		}
	}
}

@media only screen and (max-width : 1090px) {
	#navigation {
		.navigation-container{
			.navigation-bottom{
				a {
					&:not(:first-child) {
						margin-left: 6px !important;
					}
				}
			}
		}
	}
}

</style>
