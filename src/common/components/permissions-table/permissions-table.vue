<script>
import FeatureRow from './components/feature-row.vue'

export default {
	name: 'permissionsTable',
	components: { FeatureRow },
	props: {
		permissions:{
			required: true
		}
	},
	data () {
		return {
			expand:[],
			headers:[
				{
					text: "Application feature",
					align: 'start',
					sortable: false,
					divider:true,
					width:"90%",
					value: 'name',
				},
				{
					text: "Available",
					align: 'center',
					sortable: false,
					divider:true,
					width:"5%",
					value: 'available',
				},
				{
					text: "Default",
					align: 'center',
					sortable: false,
					divider:true,
					width:"5%",
					value: 'default',
				}
			]
		}
	}
}
</script>

<template>
	<v-container  class="col-10 container-permissions-table">
		<v-data-table
			:headers="headers"
			:items="permissions"
			:expanded="expand"
			item-key="name"
			hide-default-footer
		>

			<template v-slot:top>
				<v-row style="padding-bottom: 30px">
					<v-col md="1">
						<v-container>
							<v-btn
								depressed
								color="#e7f9ef "
								large
								tile
							>
								Check all
							</v-btn>
						</v-container>
					</v-col>
					<v-col md="1" style="margin-right: 20px">
						<v-container>
							<v-btn
								depressed
								color="#e7f9ef "
								large
								tile
							>
								Uncheck all
							</v-btn>
						</v-container>
					</v-col>

					<v-col md="1" style="margin-right: 25px">
						<v-container>
							<v-btn
								depressed
								color="#e7f9ef  "
								large
								tile
							>
								Show details
							</v-btn>
						</v-container>
					</v-col>

					<v-col md="1" >
						<v-container>
							<v-btn
								depressed
								color="#e7f9ef "
								large
								tile
							>
								Collapse all
							</v-btn>
						</v-container>
					</v-col>

					<v-spacer></v-spacer>

					<v-col md="7">
						<v-container class="container-searchbar">
								<v-text-field
									v-model="search"
									class="searchbar"
									outlined
									dense
									label="Search"
									hide-details="true"
								></v-text-field>
						</v-container>
					</v-col>
				</v-row>
			</template>

			<template v-slot:header.available="{ header }">
				{{ header.text.toUpperCase() }}
			</template>

			<template v-slot:header.default="{ header }">
				{{ header.text.toUpperCase() }}
			</template>

			<template v-slot:body="{ items }">
				<feature-row
					v-for="feature in items"
					:feature="feature"
					:key="feature"
					:depth="0"
				/>
			</template>
		</v-data-table>
	</v-container>
</template>


<style lang="scss" scoped>

.container-permissions-table{
	margin: 0 0 0 50px;
}

.container-searchbar{
	padding-top: 15px;

	.searchbar{
		background-color: white;
	}
}

</style>


