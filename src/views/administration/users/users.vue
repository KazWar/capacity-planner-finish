<script>
	import { mapState, mapActions } from 'vuex'

	export default {
		name: 'Users',
		data () {
			return {
				search:'',
				headers:[
					{
						text:"Level",
						value:"profile",
					},
					{
						text:"User",
						value:"fullName",
					},
					{
						text:"Description",
						value:"description"
					},
					{
						text:"Login",
						value:"username",
					},
					{
						text:"Level",
						value:"profile",
					},
					{
						text:"Phone",
						value:"phoneNr",
					},
					{
						text:"Status",
						value:"active",
					},
					{
						text:"Created on",
						value:"createdOn",
					},
					{
						text:"Updated On",
						value:"updatedOn",
					},
					{ text: 'Actions', value: 'actions', sortable: false, align: "end" },
				]
			}
		},

		computed: {
			...mapState('users',['allUsers'])
		},

		methods: {
			...mapActions('users',['saveUser']),

			addUser: function (){
				this.$router.push({name:'user', params:{ id: "new" }})
			},

			rowClick: function (item, row) {
				this.$router.push({name:'user', params:{ id:item.id }})
			},
		}
	}
</script>

<template>
	<div style="grid: none">
		<v-container fluid class="container-searchbar">
			<v-row>
				<v-col md="3">
					<v-text-field
						v-model="search"
						class="searchbar"
						outlined
						dense
						label="Search"
						hide-details="true"
					></v-text-field>
				</v-col>
				<v-col md="1" class="column-button-add-user ml-auto">
					<v-btn
						depressed
						color="success"
						large
						@click="addUser()"
					>
						Add user
					</v-btn>
				</v-col>
			</v-row>
		</v-container>

		<v-divider></v-divider>

		<v-data-table
			class="table-users"
			:headers="headers"
			:items="this.allUsers"
			:items-per-page="5"
			:search="search"
			item-key="id"
			@click:row="rowClick"
		>

			<!-- Icon for user level -->
			<template #item.levelIcon="{ item }">
				<v-icon :color="item.color">
				</v-icon>
			</template>

			<!-- Clickable user name to navigate to the user profile -->
			<template #item.user="{ item }">
				<v-tooltip bottom open-delay="1" transition="fade-transition">
					<template v-slot:activator="{ on, attrs }">
						<label
							v-on="on"
							v-bind="attrs"
							@click="item.user"
							class="user-edit">
							{{ item.user }}
						</label>
					</template>
					<span>Edit the user: {{item.user}}</span>
				</v-tooltip>
			</template>

			<!-- Clickable email for opening mail client to send mail to the recipient  -->
			<template #item.login="{ item }">
				<a target="_blank" :href="`mailto:${item.login}`">
					{{ item.login }}
				</a>
			</template>

			<!-- Status toggle  -->
			<template #item.active="{ item }">
				{{ item.active ? "Active": "Disabled"}}
			</template>

			<!-- Item actions -->
			<template v-slot:item.actions="{ item }">
				<v-icon
					class="mr-2"
					@click=""
				>
					mdi-dots-vertical
				</v-icon>
			</template>
		</v-data-table>
	</div>
</template>

<style lang="scss">
/* non-scoped styles for overriding default behaviour of the UI framework */
.v-data-table {
	&.table-users {
		th {
			font-size: 14px !important;
		}

		tr:hover {
			cursor: pointer !important;
		}
	}
}

</style>

<style lang="scss" scoped>

.user-edit{
	&:hover{
		text-decoration: underline dotted gray;
		cursor: pointer;
	}
}

.container-searchbar{
	background-color: whitesmoke;

	.searchbar{
		background-color: white;
	}

	.column-button-add-user{
		padding-top: 10px;
	}
}

</style>
