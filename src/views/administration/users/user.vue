<script>
import UserTabsItems from './components/user-tabs-items.vue'
import { mapGetters, mapState } from 'vuex'
import { User } from '@/common/model'

export default {
		name: 'User',
		components: { UserTabsItems },
		data () {
			return {
				tab:null
			}
		},

		computed:{
			...mapGetters('users',['getUserById']),
			...mapState('user',['current']),

			user() {
				const id = this.$route.params.id

				if (id === "new"){
					// Create an empty user
					return new User().new()
				} else if(id){
					// If this isn't a new user, retrieve the user from the state.
					return this.getUserById(id)
				} else {
					// If nothing no route parameter is passed on.
					return this.current
				}
			}
		}

	}
</script>

<template>
	<v-card flat style="grid: none">

		<!-- Tabs header -->
		<!--This can be extracted to a separate component once I figure out two-way data binding.-->
		<v-tabs v-model="tab">
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

			<v-tab>
				<v-icon>
					mdi-cog
				</v-icon>
				<v-card-text>
					Preferences
				</v-card-text>
			</v-tab>
		</v-tabs>

		<v-divider></v-divider>

		<!-- Tabs content -->
		<user-tabs-items :tab="tab" :user="user"></user-tabs-items>

	</v-card>
</template>

<style lang="scss" scoped>

.v-tab--active{
	color: #30cc70 !important;
}

</style>
