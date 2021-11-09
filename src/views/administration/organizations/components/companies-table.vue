<script>
import PermissionsTable from './permissions-table.vue'
export default {
	name: 'CompaniesTable',
	components: { PermissionsTable },
	props:[ 'data' ],
	data () {
		return {
			search:'',
			tableData:this.data,
			singleExpand: false,
			headers:[
				{
					text:"Organization",
					align:"start",
					value:"name",
				},
				{
					text:"Profile",
					value:"name",
				},
				{
					text:"Status",
					value:"name",
				},
				{
					text:"Administrator",
					value:"name",
				},
				{
					text:"Created on",
					value:"name",
				},
				{
					text:"Updated on",
					value:"name",
				},
				{
					text:"Updated by",
					value:"name",
				},
				{ text: 'Actions', value: 'actions', sortable: false, align: "end" },
			]
		}
	}
}
</script>

<template>
	<div>
		<v-container fluid class="container-searchbar">
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
		</v-container>

		<v-divider></v-divider>

		<v-data-table
			:headers="headers"
			:items="tableData"
			:items-per-page="5"
			:search="search"
			item-key="name"
			show-expand
		>


			<!-- Expand item button -->
			<template v-slot:expanded-item="{ headers, item }" >
				<td :colspan="headers.length">
					<permissions-table
						:permissions="item.permissions">
					</permissions-table>
				</td>
			</template>

			<!-- Clickable organisation name -->
			<template
				#item.name="{ item }"
			>
				<a target="_blank" :href="`tel:${item.name}`">
					{{ item.name }}
				</a>
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

<style lang="scss" scoped>

.container-searchbar{
	padding: 0;
	background-color: whitesmoke;

	.searchbar{
		background-color: white;
	}
}

</style>
