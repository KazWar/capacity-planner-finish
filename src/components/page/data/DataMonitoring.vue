<template>
	<div class="content-full">
		<div class="data-monitoring scrollable-y content-child content-footered" >
			<h1>Monitoring data stroom</h1>
			<DateTimePicker label="Selecteer data"  icon="kalender" v-model="selectedDate" class="picker-container" onlyDate="true" />
			<table>
				<thead>
				<tr>
					<th>Berichttype</th>
					<th>Succesvol</th>
					<th>Mislukt</th>
					<th>Datum</th>
					<th>Laatst geüpdatet</th>
					<th>Datum laatste bericht</th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="(row, index) in data" :key="index" :id="row.id">
					<td>{{row.messageType}}</td>
					<td>{{row.success}}</td>
					<td>{{row.failure}}</td>
					<td>{{$moment(row.day).format('YYYY-MM-DD')}}</td>
					<td>{{getTimestampOrDash(row.updatedAt)}}</td>
					<td>{{getTimestampOrDash(row.timestampReceived)}}</td>
				</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	import $date from '@/modules/date-module'
	export default {
		data () {
			return {
				selectedDate: $date.toDateString(new Date()).substring(0, 11) + '00:00:00',
				data: [],
				messages: {
					processed: {
						success: 0,
						fail: 0
					},
					interface: {
						success: 0,
						fail: 0
					},
					maximo: {
						success: 0,
						fail: 0
					}
				},
			}
		},
		watch: {
			selectedDate: function () {
				if (this.selectedDate == null) {
					this.selectedDate = $date.toDateString(new Date()).substring(0, 11) + '00:00:00'
				}
				this.getDataMonitoring()
			},
		},
		beforeMount () {
			this.getDataMonitoring()
		},
		methods: {
			getDataMonitoring () {
				this._api.getInterfaceUsage(this.selectedDate.substring(0, 11)).then(res => {
					this.data = res
					for (let i = 0; i < this.data.length; i++) {
						let current = this.data[i]

						if (current.messageType == 'maximo') {
							this.messages.maximo.success += current.success
						} else if (current.messageType == 'handleNTT') {
							this.messages.maximo.success += current.success
						}
					}
				})
			},
			getTimestampOrDash (timestamp) {
				return timestamp ? this.$moment(timestamp).format('YYYY-MM-DD HH:mm') : '-'
			}
		}

	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
