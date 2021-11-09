<script>
	import ProfileTabDetails from './components/profile-tab-details.vue'
	import ProfileTabPermissions from './components/profile-tab-permissions.vue'

	export default {
		name: 'organizationProfile',
		components: { ProfileTabPermissions, ProfileTabDetails },
		data () {
			return {
				tab:null,
				profile:{
					details:{

					},
					permissions:{

					}
				}
			}
		}
	}
</script>

<template>
	<v-card flat style="grid: none">

		<!-- Tabs header -->
		<v-tabs v-model="tab" class="test">
			<v-tab>
				<v-icon>
					mdi-pencil
				</v-icon>
				<v-card-text>
					Details
				</v-card-text>
			</v-tab>

			<v-tab>
				<v-icon>
					mdi-shield
				</v-icon>
				<v-card-text>
					Permissions
				</v-card-text>
			</v-tab>
		</v-tabs>

		<v-divider></v-divider>

		<!-- Tabs content -->
		<!-- Tab prop for currently selected tab. -->
		<v-tabs-items v-model="tab">
		  <!-- Profile details tab -->
		  <v-tab-item>
			<profile-tab-details :details="profile.details" />
		  </v-tab-item>

		  <!-- Profile permissions tab -->
		  <v-tab-item>
			<profile-tab-permissions :permissions="profile.permissions" />
		  </v-tab-item>
		</v-tabs-items>
	</v-card>
</template>


<style lang="scss" scoped>

.v-tab--active{
	color: #30cc70 !important;
}

</style>
