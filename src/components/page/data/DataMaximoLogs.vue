<template>
		<div class="content-full maximo-logs">
			<div class="data-monitoring">
				<h1>Maximo logs</h1>
				<DateTimePicker
					label="Selecteer data"
					icon="kalender"
					v-model="maximoLogsDate"
					class="picker-container"
					onlyDate="true"
				/>
				<b-table
					:data="maximoLogsData"
					:paginated="maximoTableOptions.paginated"
					:per-page="maximoTableOptions.perPage"
					:default-sort-direction="maximoTableOptions.defaultSortDirection"
					:sort-icon="maximoTableOptions.sortIcon"
					:pagination-simple="true"
					default-sort="arrivalDate"
					class="maximo-logs"
				>
					<template slot-scope="props">
						<b-table-column field="method" label="Method" sortable>
							{{props.row.method}}
						</b-table-column>

						<b-table-column field="url" label="URL" sortable>
							{{props.row.url}}
						</b-table-column>

						<b-table-column field="retries" label="Retries" sortable>
							{{props.row.retries}}
						</b-table-column>

						<b-table-column field="createdAt" label="Created" sortable>
							{{ $moment(props.row.createdAt).format('DD-MM-YYYY HH:mm').toString() }}
						</b-table-column>

						<b-table-column field="updatedAt" label="Updated" sortable>
							{{ $moment(props.row.updatedAt).format('DD-MM-YYYY HH:mm').toString() }}
						</b-table-column>

						<b-table-column field="endpoint" label="Endpoint" sortable>
							{{props.row.endpoint}}
						</b-table-column>

						<b-table-column field="isSent" label="Is sent" sortable>
							{{props.row.isSent}}
						</b-table-column>

						<b-table-column field="locationId" label="Location ID" sortable numeric>
							{{props.row.locationId}}
						</b-table-column>

						<b-table-column field="object" label="Object" sortable>
							{{props.row.object}}
						</b-table-column>

						<b-table-column field="res" label="Res" sortable>
							{{checkMaximoResponse(JSON.stringify(props.row.res), props.row.isSent)}}
						</b-table-column>

						<b-table-column field="data.expectedArrivalDate" label="Expected arrival" sortable>
							<template v-if="props.row.data">
								{{$moment(props.row.data.expectedArrivalDate).format('DD-MM-YYYY HH:mm').toString()}}
							</template>
						</b-table-column>

						<b-table-column field="data.relocateReason" label="Relocate reason" sortable>
							<template v-if="props.data">
								{{props.row.data.relocateReason}}
							</template>
						</b-table-column>

						<b-table-column field="data.remark1Code" label="Remark 1 code" sortable>
							<template v-if="props.data">
								{{props.row.data.remark1Code}}
							</template>
						</b-table-column>

						<b-table-column field="data.repairFacility" label="Repair facility" sortable>
							<template v-if="props.data">
								{{props.row.data.repairFacility}}
							</template>
						</b-table-column>

						<b-table-column field="data.tripNumber" label="Trip number" sortable>
							<template v-if="props.data">
								{{props.row.data.tripNumber}}
							</template>
						</b-table-column>

						<b-table-column field="data.workLocation" label="Work location" sortable>
							<template v-if="props.data">
								{{props.row.data.workLocation}}
							</template>
						</b-table-column>

						<b-table-column field="data.workorderNumber" label="Workorder number" sortable>
							<template v-if="props.data">
								{{props.row.data.workorderNumber}}
							</template>
						</b-table-column>

						<b-table-column field="data.objectId" label="Object Id" sortable>
							<template v-if="props.row.objectId">
								{{JSON.stringify(props.row.objectId)}}
							</template>
						</b-table-column>
					</template>
				</b-table>
			</div>
		</div>
</template>

<script>
	import $date from '@/modules/date-module'
	import env from '@/env'
	export default {
		data () {
			return {
				footerButton: 'Export Maximo logs',
				maximoLogsDate: $date.toDateString(new Date()).substring(0, 11) + '00:00:00',
				maximoLogsData: [],
				maximoTableOptions: {
					paginated: true,
					perPage: 50,
					currentPage: 1,
					defaultSortDirection: 'asc',
					sortIcon: 'chevron-up'
				},
			}
		},
		watch: {
			maximoLogsDate: function () {
				if (this.maximoLogsDate == null) {
					this.maximoLogsDate = $date.toDateString(new Date()).substring(0, 11) + '00:00:00'
				}
				this.getMaximoLogs()
			},
		},
		mounted () {
			this.getMaximoLogs();
		},
		methods: {
			footerButtonMethod () {
				this.exportMaximoLogs()
			},
			exportMaximoLogs () {
				window.open(env.apiURL + '/maximo/exportLogs?date=' + this.maximoLogsDate.substring(0, 10) + '&access_token=' + localStorage.getItem('sessionId'));
			},
			getMaximoLogs () {
				let date = this.maximoLogsDate.substring(0, 11)

				this._api.getMaximoLogs(date).then(res => {
					this.maximoLogsData = res
				})
			},
			checkMaximoResponse(str, isSent){
				if(str.includes('{"Error":{') || !isSent){
					return str;
				} else {
					return 'Succesvol'
				}
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
