<template>
	<div class="data" :key="this.$route.fullPath">
		<div class="content">
			<div class="content-sidebar">
				<div class="content-sidebar-left">
					<div
						class="scrollable-y content-child content-footered">
						<Sidebar
							:items="sideBarItems"
							@toggleDeletionModal="toggleDeletionModal"
						/>
					</div>
				</div>
				<div
					class="content-sidebar-right"
					:class="{'scrollable-x' : $route.path === '/data-maximo-logs'}"
				>
					<router-view
						ref="dataChild"
					/>
				</div>
			</div>

		</div>
		<div class="footer">
			<div class="flex-wrap flex-right">
				<button
					class="button-orange"
					v-if="footerButton"
					@click="$refs.dataChild.footerButtonMethod"
				>
					{{footerButton}}
				</button>
				<TreeSelect
					v-if="footerFilter"
					v-model="footerFilterDataSelected"
					:options="footerFilterData"
					options-label="label"
					options-id="id"
					label="Filter"
					:borderless="false"
					:multiple="false"
					:limit="1"
					:limitText="count => `en nog ${count}`"
					:defaultExpandLevel="1"
					:selectSize="52"
					:selectWidth="200"
					:disableBranchNodes="true"
					size="lg"
				/>
			</div>
		</div>

		<modal v-model="displayDeletionModal" title="Werkorder verwijderen" v-if="displayDeletionModal">
			<div slot="content">
				<TextInput
					:paddingless="true"
					placeholder="Werkordernummer invoeren"
					v-model="workOrderForDelete"
				/>
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<span class="link" @click="toggleDeletionModal()">Annuleren</span>
				<button class="button right red" @click="confirmWoDeletion()">Verwijderen</button>
			</div>
		</modal>

	</div>
</template>

<script>

import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'

export default {
	components: {
		Sidebar: () => import('@/components/Sidebar')
	},
	data: function () {
		return {
			footerButton: null,
			footerFilter: null,
			footerFilterData: [],
			footerFilterDataSelected: null,
			displayDeletionModal: false,
			workOrderForDelete: '',
			selectedTab: 'location',
			sideBarItems: [
				{
					title: 'Locaties',
					icon: 'lokatie',
					link: 'data-locations'
				},
				{
					title: 'Normtijden',
					icon: 'klok',
					link: 'data-material'
				},
				{
					title: 'Prioriteitscore',
					icon: 'percentage',
					link: 'data-priority-factor'
				},
				{
					title: 'Upload',
					icon: 'document',
					link: 'data-upload'
				},
				{
					title: 'Upload Handleiding',
					icon: 'document',
					link: 'data-upload-manual'
				},
				{
					title: 'Upload Draaiboeken',
					icon: 'document',
					link: 'data-upload-draaiboek'
				},
				{
					title: 'Werkorder duplicaten',
					link: 'data-workorders-duplicates'
				},
				{
					title: 'Settings',
					link: 'data-settings'
				},
				{
					title: 'Klus type',
					link: 'data-location-type'
				},
				{
					title: 'Reasons maintenance',
					link: 'data-reason-maintenance'
				},
				{
					title: 'Data Monitoring',
					link: 'data-monitoring'
				},
				{
					title: 'OB Assignment Data',
					link: 'data-assignment-ob'
				},
				{
					title: 'Assets Settings',
					link: 'data-assets-settings'
				},
				{
					title: 'Maximo Logs',
					link: 'data-maximo-logs'
				},
				{
					title: 'Werkorder verwijderen',
					icon: 'sluiten',
					color: 'red',
					action: 'toggleDeletionModal'
				}
			],
		}
	},
	mounted: function () {
		this.footerButton = !_.isEmpty(this.$refs) ? this.$refs.dataChild._data.footerButton : null
		this.footerFilter = !_.isEmpty(this.$refs) ? this.$refs.dataChild._data.footerFilter : false
		this.footerFilterData = !_.isEmpty(this.$refs) ? this.$refs.dataChild._data.footerFilterData : []
	},
	methods: {
		setSideBarChildrens (e) {
			const sideBar = _.cloneDeep(this.sideBarItems)
			this.sideBarItems = sideBar
		},
		toggleDeletionModal () {
			this.displayDeletionModal = !this.displayDeletionModal
			this.workOrderForDelete = ''
		},
		confirmWoDeletion () {
			this.displayDeletionModal = !this.displayDeletionModal
			this._api.deleteWorkorder(this.workOrderForDelete)
				.then(res => {
					console.log(res)
					$snackbar.add('Werkorder verwijderd')
					$loader.message = null
				})
				.catch(err => {
					console.log(err)
					$loader.message = null
				})
		}
	}
}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
