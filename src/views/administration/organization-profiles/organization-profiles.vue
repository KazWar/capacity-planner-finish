<script>
import data from "@/data/demo/organization-profiles.json"

export default {
	name: 'Profiles',

	data () {
		return {
			search:'',
			tableData:data,
			singleExpand: false,
			headers:[
				{
					text:"Level",
					align:"start",
					value:"levelIcon",
				},
				{
					text:"Name",
					value:"name",
				},
				{
					text:"Description",
					value:"description",
				},
				{
					text:"Parent",
					value:"parent",
				},
				{
					text:"Status",
					value:"status",
				},
				{
					text:"Created on",
					value:"createdOn",
				},
				{
					text:"Updated on",
					value:"updatedOn",
				},
				{
					text:"Updated by",
					value:"updatedBy",
				},
				{ text: 'Actions', value: 'actions', sortable: false, align: "end" },
			]
		}
	},

	methods:{
		//Possible global method?
		navigate(route, id){
			this.$router.push(
				{
					name:route,
					params: {
						id:id
					}
				}
			)
		}
	}
}
</script>

<template>
	<div>
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
				<v-col md="1" class="column-button-add-profile ml-auto">
					<v-btn
						depressed
						color="success"
						large
					>
						Add profile
					</v-btn>
				</v-col>
			</v-row>
		</v-container>

		<v-divider></v-divider>

		<v-data-table
      		class="table-profiles"
			:headers="headers"
			:items="tableData"
			:items-per-page="5"
			:search="search"
			item-key="name"
		>
			<!-- Icon for user level -->
			<template #item.levelIcon="{ item }">
				<v-icon :color="item.color">
					{{ item.levelIcon }}
				</v-icon>
			</template>


			<!-- Clickable user name for direct profile editing -->
			<template #item.name="{ item }">
				<v-tooltip bottom open-delay="1" transition="fade-transition">
					<template v-slot:activator="{ on, attrs }">
							<label
								v-on="on"
								v-bind="attrs"
								@click="navigate(`profile`,`${item.name}`)"
								class="user-edit">
								{{ item.name }}
							</label>
					</template>
					<span>Edit the profile: {{item.name}}</span>
				</v-tooltip>
			</template>

			<!-- Clickable parent name for direct profile editing -->
			<template #item.parent="{ item }">
				<v-tooltip bottom open-delay="1" transition="fade-transition">
					<template v-slot:activator="{ on, attrs }">
						<label
							v-on="on"
							v-bind="attrs"
							@click="item.parent"
							class="user-edit">
							{{ item.parent }}
						</label>
					</template>
					<span>Edit the parent profile: {{item.parent}}</span>
				</v-tooltip>
			</template>

			<!-- Status  -->
			<template #item.status="{ item }">
				{{ item.status ? "Active": "False"}}
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

		<v-divider></v-divider>

		<router-view></router-view>
	</div>
</template>


<style lang="scss">
/* non-scoped styles for overriding default behaviour of the UI framework */
.v-data-table {
  &.table-profiles {
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

	.column-button-add-profile{
		padding-top: 10px;
	}
}

</style>
