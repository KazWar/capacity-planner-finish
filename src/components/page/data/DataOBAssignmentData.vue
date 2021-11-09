<template>
	<div class="content-full">
		<div class="data-monitoring">
			<h1 class="section-title">OB toewijzingsbeheer</h1>
			<div class="actions">
				<button class="upload-btn" @click="displayObAssignmentDataModal = true">
					Uploaden
				</button>
			</div>

			<b-table
				:data="obAssignmentDataFilter"
				:paginated="obAssignmentTableOptions.paginated"
				:per-page="obAssignmentTableOptions.perPage"
				:sort-icon="obAssignmentTableOptions.sortIcon"
				:pagination-simple="true"
				default-sort="shift"
				class="sortable-table ob-assignment-data"
			>
				<template slot-scope="props">

					<b-table-column field="shift" label="Dienst" sortable>
						<!-- {{ props.row.shift }} -->
						<input type="text" v-model="props.row.shift">
					</b-table-column>

					<b-table-column field="maintenancePosition" label="Positie onderhoud" sortable>
						<!-- {{ props.row.maintenancePosition }} -->
						<input type="text" v-model="props.row.maintenancePosition">
					</b-table-column>

					<b-table-column field="track" label="Spoor" sortable>
						<!-- {{ props.row.track }} -->
						<input type="text" v-model="props.row.track">
					</b-table-column>

					<b-table-column field="workCluster" label="Clusters" sortable>
						<!-- {{ props.row.workCluster }} -->
						<input type="text" v-model="props.row.workCluster">
					</b-table-column>

					<b-table-column field="description" label="Omschrijving" sortable>
						{{ props.row.description }}
						<!-- <input type="text" v-model="props.row.description"> -->
					</b-table-column>

					<b-table-column field="mechanicType" label="Vakgroep" sortable>
						<!-- {{ props.row.mechanicType }} -->
						<input type="text" v-model="props.row.mechanicType">
					</b-table-column>
				</template>
			</b-table>
		</div>
		<modal v-model="displayObAssignmentDataModal" title="OB toewijzingsbeheer" v-if="displayObAssignmentDataModal">
			<div slot="content" style="padding-top: 10px;">
				<TextInput  placeholder="Materieel serie" v-model="assignmentObSeriesCode" />
				<TextInput  placeholder="Deel serie" v-model="assignmentObConstructionType" />
				<div class="file-upload">
					<button class="upload-btn" @click="onClickUploader()">
						<template v-if="!selectedObAssignmentFile.name">
							Select file
						</template>
						<template v-else>
							{{selectedObAssignmentFile.name}}
						</template>
						<input type="file" @change="handleObAssignmentSelectedFile" accept=".xlsx, .xls">
					</button>
				</div>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="uploadObAssignmentData()">Opslaan</button>
			</div>
		</modal>
	</div>
</template>

<script>
	import $loader from '@/modules/loader-module'
	import $snackbar from '@/modules/snackbar-module'
	export default {
		props: ['footerFilterDataSelected'],
		data () {
			return {
				footerFilter: true,
				obAssignmentTableOptions: {
					paginated: false,
					perPage: 0,
					currentPage: 1,
					defaultSortDirection: 'asc',
					sortIcon: "chevron-up"
				},
				obAssignmentData: [],
				displayObAssignmentDataModal: false,
				assignmentObSeriesCode: null,
				assignmentObConstructionType: null,
				footerFilterData: [],
				selectedObAssignmentFile: {
					name: null,
					content: null
				},

			}
		},
		watch: {

		},
		computed: {
			obAssignmentDataFilter () {
				let selected = this.footerFilterDataSelected;

				let res;
				if (selected && selected !== null) {
					let constructionType = _.find(this.obAssignmentData, {id:selected}).constructionType;
					res = this.obAssignmentData.filter(x => x.constructionType == constructionType)
				} else {
					res = this.obAssignmentData
				}
				return res;
			}
		},
		beforeMount () {
			this.getObAssignmentData()
		},
		methods: {
			onClickUploader (event) {
				let inputFileElement = this.$el.querySelector('input[type="file"]')
				if (inputFileElement) {
					inputFileElement.click()
				}
			},
			handleObAssignmentSelectedFile (e) {
				this.selectedObAssignmentFile = {
					name: e.target.files[0].name,
					content: e.target.files[0]
				}
			},
			uploadObAssignmentData () {
				if (!this.selectedObAssignmentFile.name) {
					$snackbar.addWarning('No file provided.')
					return
				}

				let uploadOptions = {
					seriesCode: this.assignmentObSeriesCode,
					file: this.selectedObAssignmentFile.content,
					constructionType: this.assignmentObConstructionType
				}

				$container.uploadObAssignmentData(uploadOptions).then(response => {
					$snackbar.add('OB Assignment data uploaded')
					this.selectedObAssignmentFile = {
						name: null,
						content: null
					}

					this.assignmentObSeriesCode = null
					this.assignmentObConstructionType = null

					this.displayObAssignmentDataModal = false
					this.getObAssignmentData()
					$loader.message = null
				})
			},
			getObAssignmentData () {
				this._api.getAssetAssignmentDataList().then(res => {
					this.obAssignmentData = res
					this.generateObAssignmentSelect()
				})
			},
			generateObAssignmentSelect () {
				let data = _.uniq(this.obAssignmentData.map(i => i.seriesCode))

				let result = []

				for (let i in data) {
					let group = data[i]
					let groupObject = {
						id: group,
						label: group,
						children: _.uniqBy(this.obAssignmentData.map(i => ({
							id: i.id,
							label: i.constructionType,
							seriesCode: i.seriesCode
						})).filter(x => {
							return x.seriesCode == group
						}), 'label')
					}

					result.push(groupObject)
				}

				this.footerFilterData = result
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
