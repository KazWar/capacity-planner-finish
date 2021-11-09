<template>
	<div class="content-full">
		<div class="data-monitoring scrollable-y content-child content-footered" >
			<div class="actions">
				<button class="upload-btn" @click="uploadScenarios('scenarios', ['ADMIN'])" v-if="selectedFile.name">
					Upload
				</button>
				<button class="upload-btn" @click="onClickUploader()">
					<template v-if="!selectedFile.name">
						Select file
					</template>
					<template v-else>
						{{selectedFile.name}}
					</template>
					<input type="file" @change="handleSelectedFile" accept=".xlsx, .xls">
				</button>
			</div>
			<b-table
				:data="scenarios"
				:paginated="scenariosTableOptions.paginated"
				:per-page="scenariosTableOptions.perPage"
				:default-sort-direction="scenariosTableOptions.defaultSortDirection"
				:sort-icon="scenariosTableOptions.sortIcon"
				:pagination-simple="true"
				default-sort="arrivalDate"
				class="sortable-table scenarios-table"
			>
				<template slot-scope="props">
					<b-table-column field="scenarioId" label="Draaiboek ID" sortable>
						{{ props.row.scenarioId }}
					</b-table-column>
					<b-table-column field="reason" label="Materieelserie" sortable>
						{{ props.row.seriesCode }}
					</b-table-column>
					<b-table-column field="reason" label="Reden binnenkomst" sortable>
						{{ props.row.reason }}
					</b-table-column>
					<b-table-column field="locationNumber" label="Locatie" sortable>
						{{ props.row.locationNumber }}
					</b-table-column>
					<b-table-column field="startDay" label="Startdag" sortable>
						{{ props.row.startDay }}
					</b-table-column>
					<b-table-column field="startTime" label="Starttijd" sortable>
						{{ props.row.startTime }}
					</b-table-column>
					<b-table-column field="endDay" label="Einddag" sortable>
						{{ props.row.endDay }}
					</b-table-column>
					<b-table-column field="endTime" label="Eindtijd" sortable>
						{{ props.row.endTime }}
					</b-table-column>
					<b-table-column field="maintenanceHours" label="Uren onderhoud" sortable>
						{{ props.row.maintenanceHours }}
					</b-table-column>
				</template>
			</b-table>
		</div>
	</div>
</template>

<script>
	import $loader from '@/modules/loader-module'
	import $snackbar from '@/modules/snackbar-module'
	export default {
		data () {
			return {
				selectedFile: {
					name: null,
					content: null
				},
				scenarios: [],
				scenariosTableOptions: {
					paginated: false,
					perPage: 0,
					currentPage: 1,
					defaultSortDirection: 'asc',
					sortIcon: 'chevron-up'
				}
			}
		},
		beforeMount () {
			this.getScenarios()
		},
		methods: {
			uploadScenarios (container, access) {
				if (!this.selectedFile.name) {
					$snackbar.addWarning('Gelieve een bestand te kiezen.')
					return
				}
				let accessRoles = access
				let uploadOptions = {
					file: this.selectedFile.content
				}
				// TODO container change
				$container.uploadScenarios(uploadOptions).then(response => {
					$snackbar.add('Draaiboek geüpload')
					this.selectedFile = {
						name: null,
						content: null
					}
					this.getScenarios()
					$loader.message = null
				})
			},
			getScenarios () {
				this._api.getScenariosList().then((res) => {
					this.scenarios = res
				})
			},
			onClickUploader (event) {
				let inputFileElement = this.$el.querySelector('input[type="file"]')
				if (inputFileElement) {
					inputFileElement.click()
				}
			},
			handleSelectedFile (e) {
				this.selectedFile = {
					name: e.target.files[0] ? e.target.files[0].name : null,
					content: e.target.files[0]
				}
			}
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
