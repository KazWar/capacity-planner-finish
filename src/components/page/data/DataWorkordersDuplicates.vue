<template>
	<div class="content-full">
		<div class="data-monitoring scrollable-y content-child content-footered" >
			<div class="table-content duplicated">
				<button class="button right red" @click="removeDuplicatedWO()">Delete duplicates</button>
				<table>
					<thead>
					<tr>
						<th>Omschrijving</th>
						<th>Materieelnummer</th>
						<th>Werkorder</th>
					</tr>
					</thead>
					<tbody>
					<template v-for="(item, key) in duplicatedWorkOrders">
						<tr class="single">
							<td colspan="1">Gedupliceerd door:</td>
							<td colspan="2"><span>{{ key }}</span></td>
						</tr>
						<tr v-for="wo in item" :id="wo.id">
							<td>{{ wo.description }}</td>
							<td>{{ wo.materialnumber }}</td>
							<td>{{ wo.wo }}</td>
						</tr>
					</template>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>
	import $snackbar from '@/modules/snackbar-module'
	export default {
		data () {
			return {
				duplicatedWorkOrders: null,
			}
		},
		beforeMount () {
			this.getDuplicatedWorkOrders()
		},
		methods: {
			removeDuplicatedWO () {
				this._api.removeWorkordersDuplicates().then((res) => {
					$snackbar.add('Werkorders verwijderd')
					this.getDuplicatedWorkOrders()
				})
			},
			getDuplicatedWorkOrders () {
				this._api.getWorkordersDuplicates().then((res) => {
					this.duplicatedWorkOrders = res
				})
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
