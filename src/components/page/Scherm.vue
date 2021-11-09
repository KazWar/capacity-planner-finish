<template>
    <div class="monitor">
        <div class="content content-full scrollable-x">
			<div class="content-child-full content-third-row">
				<div class="content-row monitor-row" v-for="(row, rowIndex) in rows" :key="rowIndex">
                        <div class="row-head">
                            {{row.column}}
                        </div>
                        <DynamicScroller
                            :items="sortAndFilter(row)"
                            :min-item-size="50"
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
                                    <fleet-status-wo
                                        :type="row.type"
                                        :locations="locations"
                                        :assetStatuses="rows"
                                        :data="item"
    									:workOrders="assetWorkOrders"
                                        :reasonMaintenanceList="reasonMaintenanceList"
                                        :canEditEquipment="false"
                                        :userRole="userRole"
                                        @changeAsset="changeAsset"
                                        @toggleWorkOrder="toggleWorkOrder"
                                        @openOptionsModal="openOptionsModal"
                                        :active="selectedAsset.id == item.id"
                                        :key="index"
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
						:paddingless="false"
						:borderless ="false"
						placeholder="Zoek naar stel/stam"
						v-model="assetSearchQuery"
						class="search-box"
						radius="sm"
						width="320"
						:searchable="true"
						:clearable="false"
						ref="searchInput"
					/>
				</div>

				<div class="flex-item">
					<TreeSelect
						v-model="selectedSeriesCode"
						:options="seriesCodeList"
						:multiple="true"
						:limitText="count => `en nog ${count}`"
						options-label="seriesCode"
						options-id="seriesCode"
						label="Alle materieelseries"
						:borderless="false"
						:selectSize="52"
						:selectWidth="250"
					/>
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
					/>
				</div>
			</div>
		</div>
		<modal class="modal-assign-sr" v-model="displayOptionsModal" title="Materieel verplaatsen">
                <div slot="content">
					<TreeSelect
						v-model="maintenanceStatus"
						:options="rows"
						options-label="title"
						options-id="title"
						title="Status"
						:selectSize="52"
					/>
					<TreeSelect
						v-model="maintenanceLocation"
						:options="locations"
						options-label="name"
						options-id="locationNumber"
						additionalSearch="station"
						title="Locatie"
						:selectSize="52"
					/>
					<TreeSelect
						v-if="asyncSelect"
						v-model="reasonMaintenance"
						:options="reasonMaintenanceList"
						options-label="reason"
						options-id="code"
						title="Reden binnenkomst"
						:selectSize="52"
					/>
					<TextInput
						:paddingless="true"
						placeholder="Memo"
						title="Memo"
						v-model="memo"
						:clearable="true"
						ref="searchInput"
					/>
                </div>
                <div slot="buttons">
                    <div class="button right" @click="saveOptions()">Opslaan</div>
                </div>
            </modal>
    </div>
</template>

<script>

export default {
    components: {
        FleetStatusWo: () => import('@/components/FleetStatusWo')
    },
    data: function () {
        return {
			assetWorkOrders: [],
			todayDate: this.$moment(),
			selectedAsset: {},
			asyncSelect: false,
            userRole: localStorage.getItem('applicationType'),
            options: {
                scrollbars: false,
                interactiveScrollbars: true,
                probeType: 3,
                mouseWheel: true,
                mouseWheelSpeed: 2
            },
            displayOptionsModal: false,
            activeMobileTab: 0,
            selectedLocationId: null,
            selectedSeriesCode: null,

            responseData: [],
            items: [],

            // assetTypes: [],
            seriesCodeList: [],

            serviceRequests: [],

            rows: [{
                id: 1,
                title: 'NBVD', //NBVD
                column: 'Onttrokken',
                type: 'mbn-monitor-nbvd',
                selectedFilter: null
            }, {
                id: 2,
                title: 'OVERSTAND', //Overstand
                column: 'Overstand',
                type: 'mbn-monitor-overstand',
                selectedFilter: null
            }, {
                id: 3,
                title: 'BVD', //BVD
                column: 'In dienst',
                type: 'mbn-monitor-bvd',
                selectedFilter: null
            }],

            amountOfColumns: null,

            reasonMaintenanceList: null,
            activeId: null,
            maintenanceStatus: null,
            reasonMaintenance: null,
            maintenanceLocation: null,
            memo: null,
            assetId: null,
            assetSearchQuery: '',
        }
    },
    watch: {
        assetSearchQuery(){
            this.filterAssetList();
        }
    },
	computed: {
    	locations () {
			return this.$store.getters.GET_UPDATED_LOCATIONS
		},
		locationList () {
			return this.$store.getters.GET_UPDATED_GENERATED_LOCATIONS
		}
	},
    mounted: function () {
        this.getList();
        this.getReasonMaintenanceList();
    },

    created(){
        window.addEventListener("keydown", this.focusSearchField)
    },

    methods: {
        focusSearchField(event){
            if ((event.ctrlKey || event.metaKey || event.keyCode == 91 || event.keyCode == 93 ) && event.keyCode === 70) {
                event.preventDefault();
                this.$refs.searchInput.$refs.inputField.focus()
            }
        },
        filterAssetList(){
            if(this.assetSearchQuery !== ''){
                let query = this.assetSearchQuery;
                let data = _.filter(this.responseData, (o) => _.includes(o.serialNumber, query));
                this.items = data;
            } else {
                this.items = this.responseData;
            }
            this.getSeriesCodeList();
        },
        saveOptions(){
            let obj = {
                data: {
                    reasonMaintenance: this.reasonMaintenance,
                    maintenanceLocation: this.maintenanceLocation,
                    maintenanceStatus: this.maintenanceStatus,
                    memo: this.memo,
                    id: this.assetId,
                    assetStatus: this.maintenanceStatus
                }
            }
			const maintenanceLocations = ['MAT', 'TRANS', 'BUIT']
            if (!maintenanceLocations.some(item => item === obj.data.maintenanceLocation)) {
				console.log(obj.data.maintenanceLocation)
                obj.data.maintenanceLocationObjectId = this.getLocationIdByLocationNumber(parseInt(obj.data.maintenanceLocation)).id;
            }
            if (this.reasonMaintenance) {
                obj.data.manualReasonMaintenance = true;
            }

            console.log(obj)

            this._api.saveAsset(obj).then(res => {
                this.displayOptionsModal = false;

                this.changeAsset(obj.data);
            })
        },
        getLocationIdByLocationNumber(locationNumber){
            return _.find(this.locations, {locationNumber: locationNumber});
        },
        changeAsset(data){
            let asset = _.find(this.items, {'id': data.id});

            asset.reasonMaintenance = data.reasonMaintenance;
            asset.maintenanceLocation = data.maintenanceLocation;
            asset.maintenanceStatus = data.maintenanceStatus;
            asset.memo = data.memo;
        },
        openOptionsModal(data){
            this.maintenanceStatus = data.maintenanceStatus;
            this.reasonMaintenance = data.reasonMaintenance;
            this.memo = data.memo;
            this.assetId = data.id;
            this.maintenanceLocation = data.maintenanceLocation;

            if(this.maintenanceLocation && /^\d+$/.test(this.maintenanceLocation)){
                this.maintenanceLocation = parseInt(this.maintenanceLocation);
            }

            this.displayOptionsModal = true;
        },
		toggleWorkOrder (id) {
        	this.selectedAsset = this.selectedAsset.id === id ? {} : this.items.find(item => item.id === id)
			if (this.selectedAsset.id) {
				this.getAssetWorkOrders(id)
			}
        },

		getAssetWorkOrders (id) {
				this._api.getWorkOrdersAsset(id).then(res => {
					this.assetWorkOrders = res
				})
		},
        changeAsset(data){
            _.filter(this.items, {id: data.id})[0].reasonMaintenance = data.reasonMaintenance;
            _.filter(this.items, {id: data.id})[0].maintenanceLocation = data.maintenanceLocation;
            _.filter(this.items, {id: data.id})[0].maintenanceStatus = data.maintenanceStatus;
            _.filter(this.items, {id: data.id})[0].memo = data.memo;
        },
        getReasonMaintenanceList(){
            this._api.getReasonMaintenancesList().then(res => {
                this.reasonMaintenanceList = res
                this.asyncSelect = true
            })
        },
        sortAndFilter(row){
            let arr;
            if(row.type == 'mbn-monitor-nbvd'){
                arr = _.filter(this.items, ['maintenanceStatus', 'NBVD']);
            } else if (row.type == 'mbn-monitor-overstand'){
                arr = _.filter(this.items, ['maintenanceStatus', 'OVERSTAND']);
            } else if (row.type == 'mbn-monitor-bvd'){
                arr = _.filter(this.items, ['maintenanceStatus', 'BVD']);
            }

            return this.checkIfMatches(this.sortByWarningIcons(this.sortByColor(this.sortByAflopendeInzetbaarheid(this.sortByColor(arr)))));
        },
        sortByColor(arr){
            let red = [];
            let purple = [];
            let other = [];

            for(let i in arr) {
                let item = arr[i];
                if(arr[i].currentFleetControlStatus == 'Onder Bewaking') {
                    purple.push(item);
                } else if(arr[i].currentFleetControlStatus == 'Niet Inzetbaar') {
                    red.push(item);
                } else {
                    other.push(item);
                }
            }

            // red = this.sortByWarningIcons(red);
            // purple = this.sortByWarningIcons(purple);
            // other = this.sortByWarningIcons(other);

            return [
                ...red,
                ...purple,
                ...other
            ]
        },
        sortByAflopendeInzetbaarheid(arr){
            let topArr = [];
            let otherArr = [];

            for(let i in arr) {
                let item = arr[i];
                if(item.aflopendeInzetbaarheid && this.getMaintanceLocationName(item.maintenanceLocation) == 'MAT') {
                    topArr.push(item);
                } else {
                    otherArr.push(item);
                }
            }

            let result = [...topArr, ...otherArr]

            return result;
        },
        getMaintanceLocationName(maintenanceLocation){
            let result;
			const maintenanceLocations = ['MAT', 'TRANS', 'BUIT']
			result = maintenanceLocations.find(item => maintenanceLocation === item)
			if (!result) {
                for(let i = 0; i < this.locations.length; i++){
                    if(this.locations[i].id){
                        if(parseInt(maintenanceLocation) == this.locations[i].locationNumber){
                            result = this.locations[i].name;
                            break;
                        }
                    }
                }
            }

            // console.log(result, maintenanceLocation);
            return result;
        },
        getMaintanceLocationId(maintenanceLocation){
            let result;
			const maintenanceLocations = ['MAT', 'TRANS', 'BUIT']
			result = maintenanceLocations.find(item => maintenanceLocation === item)
			if (!result) {
                for(let i = 0; i < this.locations.length; i++){

                    // console.log(maintenanceLocation, this.locations[i].locationNumber);
                    if(this.locations[i].id){
                        if(parseInt(maintenanceLocation) == this.locations[i].locationNumber){
                            result = this.locations[i].id;

                            break;
                        }
                    }
                }
            }

            // console.log(result, maintenanceLocation);
            return result;
        },
        sortByWarningIcons(arr){
            let redWarning = [];
            let greyWarning = [];
            let other = [];

            for(let i in arr){
                let item = arr[i];

                if(item.notAtTheLocation){
                    greyWarning.push(item);
                } else if (item.aflopendeInzetbaarheid && this.getMaintanceLocationName(item.maintenanceLocation) == 'MAT'){
                    redWarning.push(item);
                } else {
                    other.push(item);
                }
            }

            let result = [...redWarning, ...greyWarning, ...other]
            return result;
        },
        checkIfMatches(arr){
            let filterArr = [];

            for(let i in arr){
                let wo = arr[i]

                if(
                    (
						this._.isEmpty(this.selectedLocationId) ||
						(wo.maintenanceLocation && this.selectedLocationId.includes(this.getMaintanceLocationId(wo.maintenanceLocation)))
                    ) && (
						this._.isEmpty(this.selectedSeriesCode) ||
						(wo.seriesCode && this.selectedSeriesCode.includes(wo.seriesCode))
                    )
                ){
                    filterArr.push(wo)
                }
            }
            return filterArr;
        },
        getList(){
            let filter = '["LOC", "EENHEID"]'

            this._api.getAssetsList(filter).then(res => {
                this.responseData = res
                this.items = this.responseData;


                // TEST
                // for(let i in this.responseData){
                //     let item = this.items[i];
                //     let rand = Math.floor(Math.random() * Math.floor(4));
                //     let rand2 = Math.floor(Math.random() * Math.floor(3));
				//
                //     if(rand2 == 0){
                //         item.aflopendeInzetbaarheid = '123'
                //         item.maintenanceLocation = 'MAT'
                //     } else if (rand2 == 1){
                //         item.notAtTheLocation = true;
                //     }
				//
                //     if(rand == 0){
                //         item.currentFleetControlStatus = 'Onder Bewaking'
                //     } else if (rand == 1){
                //         item.currentFleetControlStatus = 'Niet Inzetbaar'
                //     } else if (rand == 2){
                //         item.currentFleetControlStatus = 'Inzetbaar'
                //     } else {
                //         item.currentFleetControlStatus = ''
                //     }
                // }

                this.getSeriesCodeList();
            })
        },
        getSeriesCodeList(){
            let temp = [];
            for(let i = 0; i < this.items.length; i++){
                let current = this.items[i];
                let currentSeriesCode = current.seriesCode;
                if(current.seriesCode !== null){
                    temp.push({
                        "seriesCode": currentSeriesCode.toString()
                    });
                }
            }

            this.seriesCodeList = _.uniqBy(temp, 'seriesCode');

            this.seriesCodeList = _.orderBy(this.seriesCodeList, ['seriesCode'],['asc'])
        }
    },

    beforeDestroy() {
        window.removeEventListener("keydown", this.focusSearchField);
    },
}
</script>

<style lang="scss" scoped src="../../assets/scss/pages/schremm.scss"/>
