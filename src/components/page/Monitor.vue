<script>
import $cache from '@/modules/cache-module'
import $loader from '@/modules/loader-module'
import MonitorWo from '@/components/MonitorWo.vue'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { mapState } from 'vuex'

export default {
	components: {
		WorkOrderMonitor: () => import('@/components/WorkOrders/WorkOrderMonitor.vue'),
		WorkOrdersQualificationsModal: () => import('@/components/modals/WorkOrdersQualificationsModal.vue'),
		WorkOrdersEquipmentsTypesModal: () => import('@/components/modals/WorkOrdersEquipmentsTypesModal.vue'),
		WorkOrdersLocationTypeModal: () => import('@/components/modals/WorkOrdersLocationTypeModal.vue'),
		WorkOrdersLeadTimeModal: () => import('@/components/modals/WorkOrdersLeadTimeModal.vue'),
		'monitor-wo': MonitorWo,
		'treeselect': Treeselect
	},
	data: function () {
		return {
			selectedWorkOrder: null,
			//filters
			selectedLocationId: [],
			materialSearchQuery: '',
			selectedSeriesCode: [],
			selectedNtLocationType: [],
			selectedDateFilter: localStorage.getItem('selectedDateFilter') || 'Alle werkorders',

			serviceRequests: [],

			sortedServiceRequests: [
				{
					title: 'Nog te beoordelen',
					type: 'mbn-monitor-unassigned',
					data: [],
					activeId: null
				}, {
					title: 'Toegewezen',
					type: 'mbn-monitor-assigned',
					data: [],
					activeId: null
				}, {
					title: 'Geweigerd',
					type: 'mbn-monitor-declined',
					data: [],
					activeId: null
				}, {
					title: 'Logistiek',
					type: 'mbn-monitor-logistic',
					data: [],
					activeId: null
				}
			],

			declineReasonsServiceRequest: [
				{
					id: 'A',
					name: 'Geen kennis/bevoegdheid/opleiding'
				},
				{
					id: 'B',
					name: 'Onvoldoende tijd/korte overstand'
				},
				{
					id: 'C',
					name: 'Overdracht dienst'
				},
				{
					id: 'C2',
					name: 'Diagnoseopdracht MBN'
				},
				{
					id: 'D',
					name: 'Geen onderdelen aanwezig'
				},
				{
					id: 'E',
					name: 'Geen outillage/gereedschap'
				},
				{
					id: 'F',
					name: 'Noodherstelling uitgevoerd'
				},
				{
					id: 'G',
					name: 'Weersomstandigheden'
				},
				{
					id: 'H',
					name: 'Materieel niet afgekomen'
				},
				{
					id: 'I',
					name: 'Geen assistentie aanwezig'
				},
				{
					id: 'J',
					name: 'Geen geschikt behandelspoor'
				},
				{
					id: 'K',
					name: 'Geen oorzaak gevonden'
				},
				{
					id: 'L',
					name: 'Geen defect aangetroffen'
				},
				{
					id: 'M',
					name: 'Milieuregelgeving'
				}
			],

			rows: [
				{
					id: 1,
					title: 'Nog te beoordelen',
					type: 'mbn-monitor-unassigned',
					selectedFilter: null,
					activeId: null
				}, {
					id: 2,
					title: 'Toegewezen',
					type: 'mbn-monitor-assigned',
					selectedFilter: null,
					activeId: null
				}, {
					id: 3,
					title: 'Geweigerd',
					type: 'mbn-monitor-declined',
					selectedFilter: null,
					activeId: null
				}, {
					id: 4,
					title: 'Logistiek',
					type: 'mbn-monitor-logistic',
					selectedFilter: null,
					activeId: null
				}
			],

			amountOfColumns: null,

			seriesCodeList: [],


			warningButtonOptions: {
				active: false,
				text: 'Waarschuwing'
			},

			dateFilters: [{
				id: 'Alle werkorders',
				name: 'Alle werkorders'
			}, {
				id: 'Werkorders met aflopende Q',
				name: 'Werkorders met aflopende Q'
			}],

			ntLocationTypes: [],

			equipmentTypes: [],
			equipment: [],
			qualifications: [],
			assetId: null,


			//modals
			displayModalQualifications: false,
			displayModalEquipment: false,
			displayLocationType: false,
			displayLeadTimeMinutesModal: false,

			selectedItem: null,
			selectedType: null,
			selectedQualifications: [],
			selectedEquipments: [],

			newQualification: null,
			newEquipmentType: null,
			locationType: null,
			leadTimeMinutes: null,

			updatePage: null
		}
	},

	mounted: function () {
		if(!this.dateFilters.some(e => e.id === this.selectedDateFilter)){
			this.selectedDateFilter = 'Alle werkorders'
		}

		this.updateData();
		this.updatePage = setInterval(() => {
			this.updateData();
		}, 5 * 60 * 1000)
	},

	computed: {
		...mapState('guardian',['current']),

		locationList () {
			const locations = this.$store.getters.GET_GENERATED_LOCATIONS
			return locations
		},
		locationsWholeList () {
			return this.$store.getters.GET_LOCATIONS
		},
		filterQualifications () {
			let arr = this._.clone(this.qualifications, true);

			for(let i in this.selectedQualifications) {
				this._.remove(arr, {id: this.selectedQualifications[i]});
			}

			return arr;
		},
		filterEquipmentTypes () {
			let arr = this._.clone(this.equipmentTypes, true);

			for(let i in this.selectedEquipments){
				this._.remove(arr, {id: this.selectedEquipments[i]});
			}

			return arr;
		}
	},

	watch: {
		selectedNtLocationType: function(){
			this.sortAndFilter();
			localStorage.setItem('selectedNtLocationType', this.selectedNtLocationType)
		},

		selectedDateFilter: function(){
			this.sortAndFilter(this.selectedDateFilter);
			localStorage.setItem('selectedDateFilter', this.selectedDateFilter)
		},
		selectedSeriesCode: function(){
			this.sortAndFilter();
			localStorage.setItem('selectedSeriesCode', this.selectedSeriesCode)
		},
		selectedLocationId: function(){
			this.sortAndFilter();
			localStorage.setItem('selectedLocationId', JSON.stringify(this.selectedLocationId))
		},
		materialSearchQuery: function(){
			this.sortAndFilter();
			localStorage.setItem('materialSearchQuery', this.materialSearchQuery)
		},
		warningButtonOptions: function(){
			this.sortAndFilter();
		},
		newQualification: function () {
			if (this.newQualification !== null && this.newQualification !== undefined) {
				this.selectedQualifications.push(this.newQualification);
				// this.newQualification = null
				const self = this
				setTimeout(function () {
					self.newQualification = null
				},1)
			}
		},
		newEquipmentType: function () {
			if (this.newEquipmentType !== null) {
				this.selectedEquipments.push(this.newEquipmentType);
				this.newEquipmentType = null;
			}
		}
	},

	methods: {
		toggleWorkOrder (id) {
			this.selectedWorkOrder = id
		},
		updateWorkOrders (wo) {
			const index = this.serviceRequests.indexOf(this.serviceRequests.find(item => item.id === wo.id))
			this.serviceRequests[index] = wo
			this.sortAndFilter()
		},
		getStoredFilters(){
			this.selectedLocationId = JSON.parse(localStorage.getItem('selectedLocationId')) || [];
			this.materialSearchQuery = localStorage.getItem('materialSearchQuery') || '';

			if(localStorage.getItem('selectedSeriesCode') == 'null' || !localStorage.getItem('selectedSeriesCode') || localStorage.getItem('selectedSeriesCode') == 'undefined'){
				this.selectedSeriesCode = []
			} else {
				this.selectedSeriesCode = localStorage.getItem('selectedSeriesCode').split(',')
			}

			if(localStorage.getItem('selectedNtLocationType') == 'null'
				|| !localStorage.getItem('selectedNtLocationType')
				|| localStorage.getItem('selectedNtLocationType') == 'undefined'){
				this.selectedNtLocationType = []
			} else {
				this.selectedNtLocationType = localStorage.getItem('selectedNtLocationType').split(',')
			}
		},
		deleteEquipment(id){
			let wo = _.find(this.serviceRequests, {'id': this.selectedItem.id});

			for(let i in wo.equipmentTypesIds){
				if(wo.equipmentTypesIds[i] == id){
					wo.equipmentTypesIds.splice(i, 1);
					this.selectedItem = wo;
					break;
				}
			}
			this.saveWorkorder();
		},
		async saveWorkorder(){
			delete this.selectedItem.tasks;
			this.selectedItem.equipmentTypeManual = true;
			let wo = this._.find(this.serviceRequests, {'id': this.selectedItem.id});

			if(this.leadTimeMinutes){
				wo.totalLeadTimeMinutes = this.leadTimeMinutes;
			}

			if(this.locationType){
				wo.ntLocationType = this.locationType;
			}

			wo.qualificationIds = this.selectedQualifications;
			wo.equipmentTypesIds = this.selectedEquipments;
			wo.equipmentTypeManual = true;
			await this._api.createWorkOrder(this.selectedItem)
				.then(res => {
					this.leadTimeMinutes = null;
					this.locationType = null;
				})
		},
		openEquipmentModal(data){
			this.selectedItem = this._.find(this.serviceRequests, {'id': data.data.id});
			this.selectedType = data.type;
			this.selectedEquipments = this.selectedItem.equipmentTypesIds || [];
			this.displayModalEquipment = true;
		},
		getEquipmentObject(id){
			return _.find(this.equipmentTypes, {'id': id});
		},
		openQualificationsModal(data){

			this.selectedItem = _.find(this.serviceRequests, {'id': data.data.id});
			this.selectedType = data.type;
			this.selectedQualifications = this.selectedItem.qualificationIds || [];
			this.displayModalQualifications = true
		},
		getQualificationObject(id){
			return _.find(this.qualifications, {'id': id});
		},
		deleteQualification(id){
			for(let i in this.selectedQualifications){
				if(this.selectedQualifications[i] == id){
					this.selectedQualifications.splice(i, 1);
					break;
				}
			}
			this.saveWorkorder();
		},
		openLocationTypeModal(data){
			this.locationType = null;

			this.selectedItem = _.find(this.serviceRequests, {'id': data.data.id});
			this.selectedType = data.type;

			this.getLocationTypeObject(data.data.ntLocationType);
			this.displayLocationType = true
		},
		openLeadTimeMinutesModal(data){
			this.selectedItem = _.find(this.serviceRequests, {'id': data.data.id});
			this.selectedType = data.type;
			this.leadTimeMinutes = this.selectedItem.totalLeadTimeMinutes;

			this.displayLeadTimeMinutesModal = true
		},
		getLocationTypeObject(ntLocationType){
			for(let i in this.ntLocationTypes){
				if(this.ntLocationTypes[i].name === ntLocationType){
					this.locationType = this.ntLocationTypes[i].name;
					break;
				}
			}
		},
		toggleActive(obj){
			for(let i in this.sortedServiceRequests){
				let row = this.sortedServiceRequests[i];

				if(row.type == obj.type && row.activeId !== obj.id){
					row.activeId = obj.id;
				} else {
					row.activeId = null;
				}
			}
		},
		async updateQualifications (callback = () => {}) {
			const cacheLocations = $cache.qualifications.getList['default']
			if (cacheLocations) {
				this.qualifications = cacheLocations
			} else {
				await this._api.getQualificationList()
					.then(res => {
						this.qualifications = res
						$cache.qualifications.getList['default'] = this.qualifications
						callback()
					}).catch(err => {
						console.log(err)
						$loader.message = null
						$loader.error = true;
					})

			}
		},
		async updateEquipment (callback = () => {}) {
			const cacheLocations = $cache.equipment.getList['default']
			if (cacheLocations) {
				this.equipment = cacheLocations
			} else {
				await this._api.getEquipmentList()
					.then(res => {
						this.equipment = res
						$cache.equipment.getList['default'] = this.qualifications
						callback()
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
						$loader.error = true;
					})

			}
		},
		checkIfCanEdit(type){
			if(type == 'mbn-monitor-unassigned'){
				return true;
			} else {
				return false;
			}

		},
		async onWorkOrderChange (eventArgs) {
			await this._api.saveWorkOrder(eventArgs.detail.workOrder)
		},
		getNtLocationTypes(){
			this._api.getLocationTypeList()
				.then(res => {
					this.ntLocationTypes = res.map(e => ({
						id: e.name,
						name: e.name
					}))
					$loader.message = null
				}).catch(response => {
				this.ntLocationTypes = []
				$loader.message = null
				$loader.error = true;
			})
		},
		toggleWarningItems(){
			if(this.warningButtonOptions.active){
				this.warningButtonOptions = {
					active: false
				}

				this.sortedServiceRequests[1].data
			} else {
				this.warningButtonOptions = {
					active: true
				}
			}
		},
		async updateEquipmentTypes(){
			await this._api.getEquipmentTypesList()
				.then(res => {
					this.equipmentTypes = res
					$loader.message = null
				})
				.catch(err => {
					console.log(err)
					$loader.message = null
					$loader.error = true;
				})
		},
		generateSeriesCodeList(){
			this.seriesCodeList = [];
			for(let i = 0; i < this.serviceRequests.length; i++){
				let currentSeriesCode = this.serviceRequests[i].seriesCode;

				this.seriesCodeList.push({
					id: currentSeriesCode,
					name: currentSeriesCode
				});
			}

			this.seriesCodeList = this._.uniqBy(this.seriesCodeList, 'name');
			this.seriesCodeList = this._.orderBy(this.seriesCodeList, ['name'], ['asc']);
		},
		filterByWarning(arr){
			if(this.warningButtonOptions.active){
				return arr.filter(x => x.serviceRequestWarning || x.notCompletedWarning)
			} else {
				return arr;
			}
		},
		sortAndFilter(row){
			//unassigned
			this.sortedServiceRequests[0].data = this.applyFilters(
				this.serviceRequests.filter(x => x.isUnAssigned)
			);
			this.sortedServiceRequests[0].data = this.sortedServiceRequests[0].data.sort((a, b) => {
				var dateA = new Date(a.arrivalDate), dateB = new Date(b.arrivalDate);
				return dateA - dateB;
			});

			//assigned
			this.sortedServiceRequests[1].data = this.applyFilters(
				this.serviceRequests.filter(x => x.isAssigned)
			);

			for(let i in this.sortedServiceRequests[1].data){
				let obj = this.sortedServiceRequests[1].data[i];

				let trainSchedules = obj.trainSchedule;
				let arrivalDate = obj.arrivalDate;

				let selectedSchedule = "3000-08-15T09:12:00.000Z";

				for (let i in trainSchedules){
					let trainSchedule = trainSchedules[i];

					if(this.$moment(trainSchedule.departureDate) > this.$moment(arrivalDate)){
						selectedSchedule = trainSchedule.departureDate;
						break;
					}
				}

				obj.compareDate = selectedSchedule;
			}

			this.sortedServiceRequests[1].data = this._.sortBy(this.sortedServiceRequests[1].data, function(dateObj) {
				return new Date(dateObj.compareDate);
			});

			this.sortedServiceRequests[1].data = this.filterByWarning(this.sortedServiceRequests[1].data);

			//declined
			this.sortedServiceRequests[2].data = this.applyFilters(
				this.serviceRequests.filter(x => x.isDeclined)
			);

			//logistic
			this.sortedServiceRequests[3].data = this.applyFilters(
				this.serviceRequests.filter(x => x.isLogistic)
			);
		},
		getTrainscheduleDates(arrivalDate, trainSchedules){
			let selectedTrainschedule;
			for(let i in trainSchedules){
				let trainSchedule = trainSchedules[i];
				if(this.$moment(trainSchedule.departureDate) > this.$moment(arrivalDate)){
					selectedTrainschedule = trainSchedule.departureDate;
				} else {
					selectedTrainschedule = "2100-08-15T09:12:00.000Z"
				}
			}
			return selectedTrainschedule;
		},
		getUsedKnoppuntLocationIds(usedLocationIds){
			let usedLocationsArr = this.locationsWholeList.filter(x => {
				return usedLocationIds.includes(x.id);
			});
			let usedKnoppuntArr = usedLocationsArr.map(a => a.knoopPunt);
			usedKnoppuntArr = usedKnoppuntArr.filter(x => x);
			let usedKnoppunt = this.locationsWholeList.filter(x => {
				return usedKnoppuntArr.includes(x.knoopPunt);
			});
			const usedKnoppuntLocationIds = Array.from(new Set(usedKnoppunt.map(x => x.id).concat(usedLocationIds)));

			return usedKnoppuntLocationIds;
		},
		applyFilters(arr){
			let res = [];
			for(let i in arr){
				let workOrder = arr[i];

				if(this.checkIfMatches(workOrder) && this._.includes(workOrder.materialNumber.toLowerCase(), this.materialSearchQuery.toLowerCase())){
					res.push(workOrder);
				}
			}

			return res;
		},
		sortByDate(arr){
			return arr.sort(function(a, b) {
				var dateA = new Date(a.arrivalDate), dateB = new Date(b.arrivalDate);
				return dateB - dateA;
			});
		},
		checkDateFilter(date){
			let givenDate = this.$moment(date);
			let maxDate = this.$moment().set({hour:0,minute:0,second:0,millisecond:0}).add(1, 'days');
			return this.$moment(givenDate).isBefore(this.$moment(maxDate))
		},
		checkIfMatches(wo){
			if(
				(this.selectedSeriesCode.includes(wo.seriesCode) || this._.isEmpty(this.selectedSeriesCode)) &&
				(this.selectedLocationId.includes(wo.repairLocationId) || this._.isEmpty(this.selectedLocationId)) &&
				(this.selectedNtLocationType.includes(wo.ntLocationType) || this._.isEmpty(this.selectedNtLocationType) ||
					(this.selectedNtLocationType.includes('Leeg') && wo.ntLocationType == "")) &&
				((this.selectedDateFilter == 'Werkorders met aflopende Q' && this.checkDateFilter(wo.overDueDate))  || this.selectedDateFilter == 'Alle werkorders')){

				return true;

			} else {
				return false;
			}

			// return true;


		},
		/**
		 * Updates all of the data
		 */
		updateData () {
			this.updateServiceRequests(() => {
				$loader.message = 'Locaties ophalen'
				this.updateEquipmentTypes();
				this.generateSeriesCodeList();
				this.getNtLocationTypes();
				this.updateQualifications();
				this.updateEquipment();
				this.getStoredFilters();
			})
		},

		/**
		 * Updates all the service windows
		 * @param {Void} callback the callback on success
		 */
		async updateServiceRequests (callback = () => {}) {
			await this._api.getWorkOrdersMonitorList()
				.then(res => {
					this.serviceRequests = res;
					this.sortAndFilter()
					callback()
				})
				.catch(err => {
					console.log(err)
					$loader.message = null
					$loader.error = true
				})
		},

		async revertServiceRequest (eventArgs) {
			await this._api.undoDeclineStatus(eventArgs.detail.workOrder.serviceRequest.id, eventArgs.detail.workOrder.usedLocationIds)
				.then((response) => {
					//
				})
			for(let i in this.sortedServiceRequests){
				this.sortedServiceRequests[i].activeId = null
			}

			let index = _.findIndex(this.serviceRequests, { id: eventArgs.detail.workOrder.id })
			this.serviceRequests.splice(index, 1);

			this.sortAndFilter();
		}
	},
	beforeDestroy () {
		clearInterval(this.updatePage)
	}
}
</script>

<template>
    <div class="monitor">
		<div class="content content-full scrollable-x scrollable-show">
			<div class="content-child-full content-fourth-row">
				<div class="content-row monitor-row content-footered" v-for="(row, rowIndex) in sortedServiceRequests">
					<div class="row-head">
						{{row.title}} ({{row.data.length}})
						<template v-if="rowIndex == 1">
							<div class="row-head-right">
								<span class="toggle" :class="{'active': warningButtonOptions.active}" @click="toggleWarningItems()">
									<icon
										name="alert"
										size="30"
										transition="none"
										color="#DC0000" />
									Waarschuwing
								</span>
							</div>
						</template>
					</div>
					<DynamicScroller
						:items="row.data"
						:min-item-size="35"
						class="row-content scrollable-y content-child-row content-footered"
						:buffer="400">
						<template v-slot="{ item, index, active }">
							<DynamicScrollerItem
								:item="item"
								:active="active"
								:size-dependencies="[
								  item.message,
								]"
								:data-index="index"
								class="testClass">
								<WorkOrderMonitor
									:guardian="current"
									:type="row.type"
									:locations="locationsWholeList"
									:locationTypes="ntLocationTypes"
									:workOrder="item"
									:equipmentTypes="equipmentTypes"
									:equipmentList="equipment"
									:qualificationList="qualifications"
									:canEditEquipment="checkIfCanEdit(row.type)"
									:canEditQualification="checkIfCanEdit(row.type)"
									:warningsOnly="warningButtonOptions.active"
									:declineReasonsServiceRequest="declineReasonsServiceRequest"
									@toggleActive="toggleActive"
									@openQualificationsModal="openQualificationsModal"
									@openEquipmentModal="openEquipmentModal"
									@openLocationTypeModal="openLocationTypeModal"
									@openLeadTimeMinutesModal="openLeadTimeMinutesModal"
									@revertServiceRequest="revertServiceRequest"
									:isSelected="item.id === selectedWorkOrder"
									:active="row.activeId"
									:key="row.type + index"
									@toggleWorkOrder="toggleWorkOrder"
                                    :wrapperClass="'dynamic-scroller-item'"
								/>
							</DynamicScrollerItem>
						</template>
					</DynamicScroller>
				</div>
			</div>
		</div>
		<div class="footer">
			<div class="flex-wrap flex-right">
				<div class="flex-item">
					<TextInput
						:borderless="false"
						:paddingless="false"
						radius="sm"
						placeholder="Zoek naar stel/stam"
						v-model="materialSearchQuery"
						class="search-box"
						:searchable="true"
						:clearable="false
					"/>
				</div>
				<div class="flex-item">
					<TreeSelect
						v-model="selectedLocationId"
						:options="locationList"
						options-label="label"
						options-id="id"
						additionalSearch="station"
						label="Alle locaties"
						:borderless="false"
						:multiple="true"
						:limit="1"
						:limitText="count => `en nog ${count}`"
						:flat="true"
						:autoSelectDescendants="true"
						:autoDeselectDescendants="true"
						:defaultExpandLevel="1"
						:selectSize="52"
						:selectWidth="350"
						size="lg"
					/>
				</div>
				<div class="flex-item">
					<TreeSelect
						v-model="selectedSeriesCode"
						:options="seriesCodeList"
						options-label="name"
						options-id="id"
						label="Materieel"
						:multiple="true"
						:limit="1"
						:limitText="count => `en nog ${count}`"
						:flat="true"
						:borderless="false"
						:selectSize="52"
						:selectWidth="250"
						size="lg"
					/>
				</div>
				<div class="flex-item">
					<TreeSelect
						v-model="selectedDateFilter"
						:options="dateFilters"
						:clearable="false"
						options-label="name"
						options-id="id"
						label="Filter"
						:borderless="false"
						:selectSize="52"
						:selectWidth="250"
						size="lg"
					/>
				</div>
				<div class="flex-item">
					<TreeSelect
						v-model="selectedNtLocationType"
						:options="ntLocationTypes"
						options-label="name"
						options-id="id"
						label="Klus type"
						:borderless="false"
						:multiple="true"
						:limit="1"
						:limitText="count => `en nog ${count}`"
						:flat="true"
						:selectSize="52"
						:selectWidth="250"
						size="lg"
					/>
				</div>
			</div>
		</div>


        <modal class="modal-leadtime" v-model="displayLeadTimeMinutesModal" title="Doorlooptijd aanpassen">
            <div slot="content">
				<TextInput
					:paddingless="true"
					icon="klok"
					:number="true"
					suffix="min"
					:step="5"
					placeholder="Kies een doorlooptijd"
					v-model="leadTimeMinutes"
					minValue="0"
				/>
            </div>
            <div slot="buttons">
                <div class="button right" @click="saveWorkorder(); displayLeadTimeMinutesModal = false">Opslaan</div>
            </div>
        </modal>
		<WorkOrdersQualificationsModal
			:qualificationList="qualifications"
			:canEditQualification="false"
			@updateWorkOrder="updateWorkOrders"
		/>
		<WorkOrdersEquipmentsTypesModal
			:equipmentList="equipmentTypes"
			:canEditEquipment="true"
			@updateWorkOrder="updateWorkOrders"
		/>
		<WorkOrdersLocationTypeModal
			:locationTypes="ntLocationTypes"
			:canEditEquipment="true"
			@updateWorkOrder="updateWorkOrders"
		/>
		<WorkOrdersLeadTimeModal
			@updateWorkOrder="updateWorkOrders"
		/>
    </div>
</template>

<style lang="scss" scoped src="../../assets/scss/pages/monitor.scss"/>
