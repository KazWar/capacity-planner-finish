<template>
    <div class="monitor">
        <navigation activeTab="Monitor"/>

        <page-content>
            <div class="monitor-container">
                <div class="monitor-table">
                    <div class="monitor-row" v-for="(row, rowIndex) in sortedServiceRequests">
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
                            :min-item-size="50"
                            class="row-content"
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
                                    <monitor-wo
                                        :type="row.type"
                                        :locations="locationsWholeList"
                                        :locationTypes="ntLocationTypes"
                                        :data="item"
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
                                        :active="row.activeId"
                                        :key="row.type + index"
                                    />
                                </DynamicScrollerItem>
                            </template>
                        </DynamicScroller>
                    </div>
                </div>
            </div>
            <div class="monitor-bottom-container">
                <div class="monitor-bottom">

                    <div class="monitor-bottom-right">
                        <picker
                            direction="up"
                            type="select"
                            selectType="round"
                            :selectSize="52"
                            label="Klus type"
                            v-model="selectedNtLocationType"
                            :values="ntLocationTypes"
                            selectIdProperty="name"
                            selectValueProperty="name"/>
                        <div
                            class="icons"
                            style="margin-right: -10px"
                            v-if="selectedNtLocationType !== null"
                            @click="selectedNtLocationType = null">
                            <icon
                                name="plus"
                                size="40"
                                transition="none"
                                :colors="{default: '#0079d3', hover: '#003082'}"
                                style="margin-top: -5px; margin-right: -0px; transform: rotate(-45deg); -o-transform: rotate(-45deg); -moz-transform: rotate(-45deg); -webkit-transform: rotate(-45deg);"/>
                        </div>
                    </div>
                    <div class="monitor-bottom-right">
                        <picker
                            direction="up"
                            type="select"
                            selectType="round"
                            :selectSize="52"
                            label="Filter"
                            v-model="selectedDateFilter"
                            :values="dateFilters"
                            selectIdProperty="id"
                            selectValueProperty="name"/>
                    </div>
                    <div class="monitor-bottom-right">
                        <picker
                            direction="up"
                            type="select"
                            selectType="round"
                            :selectSize="52"
                            label="Materieel"
                            v-model="selectedSeriesCode"
                            :values="seriesCodeList"
                            selectIdProperty="name"
                            selectValueProperty="name"/>
                        <div
                            class="icons"
                            style="margin-right: -10px"
                            v-if="selectedSeriesCode !== null"
                            @click="selectedSeriesCode = null">
                            <icon
                                name="plus"
                                size="40"
                                transition="none"
                                :colors="{default: '#0079d3', hover: '#003082'}"
                                style="margin-top: -5px; margin-right: -0px; transform: rotate(-45deg); -o-transform: rotate(-45deg); -moz-transform: rotate(-45deg); -webkit-transform: rotate(-45deg);"/>
                        </div>
                    </div>
                    <div class="monitor-bottom-right">
                        <picker
                            direction="up"
                            type="select"
                            selectType="round"
                            :selectSize="52"
                            v-model="selectedLocationId"
                            :values="locations"
                            label="Alle locaties"
                            selectIdProperty="id"
                            selectValueProperty="name"/>
                        <div
                            class="icons"
                            style="margin-right: -10px"
                            v-if="selectedLocationId !== null"
                            @click="selectedLocationId = null">
                            <icon
                                name="plus"
                                size="40"
                                transition="none"
                                :colors="{default: '#0079d3', hover: '#003082'}"
                                style="margin-top: -5px; margin-right: -0px; transform: rotate(-45deg); -o-transform: rotate(-45deg); -moz-transform: rotate(-45deg); -webkit-transform: rotate(-45deg);"/>
                        </div>
                    </div>
                    <div class="search-box">
                        <input type="text" placeholder="Zoek naar stel/stam" v-model="materialSearchQuery">
                        <icon name="zoeken" size="40" color="#0079D3"/>
                    </div>
                </div>
            </div>
        </page-content>

        <modal class="modal-qualifications" v-model="displayModalQualifications" title="Benodigde kwalificaties">
            <div slot="content">
                <template>
                    <ul v-if="selectedQualifications.length > 0">
                        <li v-for="id in selectedQualifications">
                            <span>{{getQualificationObject(id).name}} <span>({{getQualificationObject(id).externalId}})</span></span>

                            <button class="button" @click="deleteQualification(id)" v-if="selectedType == 'mbn-monitor-unassigned'">
                                <icon
                                    name="sluiten"
                                    :size="40" :colors="{'default': '#C5C5CB', 'hover': '#DC0000'}"
                                />
                            </button>
                        </li>
                    </ul>
                    <template v-else-if="selectedQualifications.length == 0 && selectedType !== 'mbn-monitor-unassigned'">
                        Er zijn nog geen kwalificaties toegewezen aan deze taak/werkorder.
                    </template>
                    <picker icon="ladder" label="Kwalificatie toevoegen" :values="filterQualifications" v-model="newQualification" selectValueProperty="name" selectIdProperty="id" v-if="selectedType == 'mbn-monitor-unassigned'"/>
                </template>
            </div>
            <div slot="buttons">
                <div class="button right" @click="saveWorkorder(); displayModalQualifications = false" v-if="selectedType == 'mbn-monitor-unassigned'">Opslaan</div>
                <div class="button right" @click="displayModalQualifications = false" v-else>OK</div>
            </div>
        </modal>

        <modal class="modal-equipment" v-model="displayModalEquipment" title="Benodigde outillage">
            <div slot="content">
                <template>
                    <ul v-if="selectedEquipments.length > 0">
                        <li v-for="id in selectedEquipments">
                            <span>{{getEquipmentObject(id).name}}</span>

                            <button class="button" @click="deleteEquipment(id)" v-if="selectedType == 'mbn-monitor-unassigned'">
                                <icon
                                    name="sluiten"
                                    :size="40" :colors="{'default': '#C5C5CB', 'hover': '#DC0000'}"
                                />
                            </button>
                        </li>
                    </ul>
                    <template v-else-if="selectedEquipments.length == 0 && selectedType !== 'mbn-monitor-unassigned'">
                        Er zijn nog geen outillage toegewezen aan deze taak/werkorder.
                    </template>
                    <picker icon="ladder" label="Outillage toevoegen" :values="filterEquipmentTypes" v-model="newEquipmentType" selectValueProperty="name" selectIdProperty="id" v-if="selectedType == 'mbn-monitor-unassigned'"/>
                </template>
            </div>
            <div slot="buttons">
                <div class="button right" @click="saveWorkorder(); displayModalEquipment = false" v-if="selectedType == 'mbn-monitor-unassigned'">Opslaan</div>
                <div class="button right" @click="displayModalEquipment = false" v-else>OK</div>
            </div>
        </modal>

        <modal class="modal-equipment" v-model="displayLocationType" title="Klus type">
            <div slot="content">
                <ul v-if="selectedType !== 'mbn-monitor-unassigned'">
                    <li>
                        <span>
                            {{locationType}}
                        </span>
                    </li>
                </ul>
                <picker icon="ladder" label="Klustype selecteren" :values="ntLocationTypes" v-model="locationType" selectValueProperty="name" selectIdProperty="name" v-else/>
            </div>
            <div slot="buttons">
                <div class="button right" @click="saveWorkorder(); displayLocationType = false" v-if="selectedType == 'mbn-monitor-unassigned'">Opslaan</div>
                <div class="button right" @click="displayLocationType = false" v-else>OK</div>
            </div>
        </modal>

        <modal class="modal-leadtime" v-model="displayLeadTimeMinutesModal" title="Doorlooptijd aanpassen">
            <div slot="content">
                <picker icon="klok" label="Kies een doorlooptijd" suffix="min" :step="5" v-model="leadTimeMinutes" type="number" minValue="0" :value="leadTimeMinutes"/>
            </div>
            <div slot="buttons">
                <div class="button right" @click="saveWorkorder(); displayLeadTimeMinutesModal = false">Opslaan</div>
            </div>
        </modal>
    </div>
</template>

<script>
    import $workOrder from '@/modules/api/api-workorder'
    import $serviceRequest from '@/modules/api/api-service-request'
    import $cache from '@/modules/cache-module'
    import $loader from '@/modules/loader-module'
    import $location from '@/modules/api/api-location'
    import $locationType from '@/modules/api/api-location-type'
    import $equipmentType from '@/modules/api/api-equipment-type'

    import $equipment from '@/modules/api/api-equipment'
    import $qualification from '@/modules/api/api-qualification'

    import MonitorWo from '@/components/MonitorWo'
    export default {
        components: {
            'monitor-wo': MonitorWo
        },
        data: function () {
            return {
                activeMobileTab: 0,
                selectedLocationId: null,

                locations: [],

                locationsWholeList: [],

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
                equipmentTypes: null,
                materialSearchQuery: '',

                seriesCodeList: [],
                selectedSeriesCode: null,

                warningButtonOptions: {
                    active: false,
                    text: 'Waarschuwing'
                },

                dateFilters: [{
                    id: 0,
                    name: 'Alle werkorders'
                }, {
                    id: 1,
                    name: ' Werkorders met aflopende Q'
                }],
                selectedDateFilter: 0,

                selectedNtLocationType: null,
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
                leadTimeMinutes: null
            }
        },

        mounted: function () {
            this.updateData();

            setInterval(() => {
                this.updateData();
            }, 5 * 60 * 1000)

        },

        computed: {
            filterQualifications () {
                let arr = _.clone(this.qualifications, true);

                for(let i in this.selectedQualifications){
                    _.remove(arr, {id: this.selectedQualifications[i]});
                }

                return arr;
            },
            filterEquipmentTypes () {
                let arr = _.clone(this.equipmentTypes, true);

                for(let i in this.selectedEquipments){
                    _.remove(arr, {id: this.selectedEquipments[i]});
                }

                return arr;
            }
        },

        watch: {
            selectedNtLocationType: function(){
                this.sortAndFilter();
            },

            selectedDateFilter: function(){
                this.sortAndFilter();
            },
            selectedSeriesCode: function(){
                this.sortAndFilter();
            },
            selectedLocationId: function(){
                this.sortAndFilter();
            },
            materialSearchQuery: function(){
                this.sortAndFilter();
            },
            warningButtonOptions: function(){
                this.sortAndFilter();
                console.log(this.warningButtonOptions);
            },
            newQualification: function () {
                if (this.newQualification !== null) {
                    this.selectedQualifications.push(this.newQualification);
                    this.newQualification = null;
                }
            },
            newEquipmentType: function () {
                if (this.newEquipmentType !== null) {
                    this.selectedEquipments.push(this.newEquipmentType);
                    this.newEquipmentType = null;
                    // let equipmentTypeObject = _.find(this.equipmentTypes, {'id': this.newEquipmentType});
                    // this.selectedEquipments.push(equipmentTypeObject);
                    // this.selectedItem.equipmentTypesIds.push(this.newEquipmentType);

                    // let wo = _.find(this.serviceRequests, {'id': this.selectedItem.id});
                    // wo = this.selectedItem;
                    // this.newEquipmentType = null;
                }
            },
            // locationType: function(){
            //     if(this.locationType !== null){
            //         let wo = _.find(this.serviceRequests, {'id': this.selectedItem.id});
            //         wo.ntLocationType = this.locationType;
            //     }
            // },
            // leadTimeMinutes: function(){
            //     if(this.leadTimeMinutes !== null){
            //         let wo = _.find(this.serviceRequests, {'id': this.selectedItem.id});
            //         wo.totalLeadTimeMinutes = this.leadTimeMinutes;
            //     }
            // }

            //


        },

        methods: {
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
            saveWorkorder(){
                delete this.selectedItem.tasks;
                this.selectedItem.equipmentTypeManual = true;
                let wo = _.find(this.serviceRequests, {'id': this.selectedItem.id});

                if(this.leadTimeMinutes){
                    wo.totalLeadTimeMinutes = this.leadTimeMinutes;
                }

                if(this.locationType){
                    wo.ntLocationType = this.locationType;
                }

                wo.qualificationIds = this.selectedQualifications;
                wo.equipmentTypesIds = this.selectedEquipments;
                wo.equipmentTypeManual = true;

                $workOrder.put(this.selectedItem).then((response) => {
                    this.leadTimeMinutes = null;
                    this.locationType = null;
                });
            },
            openEquipmentModal(data){
                this.selectedItem = _.find(this.serviceRequests, {'id': data.data.id});
                this.selectedType = data.type;
                this.selectedEquipments = this.selectedItem.equipmentTypesIds;
                this.displayModalEquipment = true;
            },
            getEquipmentObject(id){
                return _.find(this.equipmentTypes, {'id': id});
            },
            openQualificationsModal(data){

                this.selectedItem = _.find(this.serviceRequests, {'id': data.data.id});
                this.selectedType = data.type;
                this.selectedQualifications = this.selectedItem.qualificationIds;
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
            updateQualifications (callback) {
                let cacheKey = 'default'
                let promise = $cache.qualifications.getList[cacheKey]
                    ? Promise.resolve({data: JSON.stringify($cache.qualifications.getList[cacheKey])})
                    : $qualification.getList()

                promise.then(response => {
                    $cache.qualifications.getList[cacheKey] = JSON.parse(response.data)
                    this.qualifications = $cache.qualifications.getList[cacheKey]

                    if (callback) {
                        callback()
                    }
                }).catch(response => {
                    $loader.message = null
                })
            },
            updateEquipment (callback) {
                let cacheKey = 'default'
                let promise = $cache.equipment.getList[cacheKey]
                    ? Promise.resolve({data: JSON.stringify($cache.equipment.getList[cacheKey])})
                    : $equipment.getList()

                promise.then(response => {
                    $cache.equipment.getList[cacheKey] = JSON.parse(response.data)
                    this.equipment = $cache.equipment.getList[cacheKey]

                    if (callback) {
                        callback()
                    }
                }).catch(response => {
                    $loader.message = null
                })
            },
            checkIfCanEdit(type){
                if(type == 'mbn-monitor-unassigned'){
                    return true;
                } else {
                    return false;
                }

            },
            onWorkOrderChange (eventArgs) {
                $workOrder.put(eventArgs.detail.workOrder)
            },
            getNtLocationTypes(){
                this.ntLocationTypes = []
                $locationType.getList().then(response => {
                    this.ntLocationTypes = JSON.parse(response.data)
                    // this.ntLocationTypes.unshift({
                    //     id: null,
                    //     name: 'Leeg'
                    // });
                    $loader.message = null
                }).catch(response => {
                    $loader.message = null
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
            updateEquipmentTypes(){
                $equipmentType.getList().then(response => {
                    this.equipmentTypes = JSON.parse(response.data)
                    $loader.message = null
                }).catch(response => {
                    $loader.message = null
                })
            },
            activateMobileTab(type){
                this.activeMobileTab = type;
            },
            generateSeriesCodeList(){
                this.seriesCodeList = [];
                let arr = [];
                for(let i = 0; i < this.serviceRequests.length; i++){
                    let currentSeriesCode = this.serviceRequests[i].seriesCode;

                    this.seriesCodeList.push({
                        id: i,
                        name: currentSeriesCode
                    });
                }

                this.seriesCodeList = _.uniqBy(this.seriesCodeList, 'name');
                this.seriesCodeList = _.orderBy(this.seriesCodeList, ['name'], ['asc']);
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
                    this.serviceRequests.filter(x =>
                        x.serviceRequest && x.serviceRequest.declinedStatus !== true && (x.workLocationId == null || x.repairLocationId == null || x.arrivalDate == null) &&
                        ((x.ntLocationType == null || x.ntLocationType == "") && x.MBN == 1))
                );
                this.sortedServiceRequests[0].data = this.sortedServiceRequests[0].data.sort((a, b) => {
                    var dateA = new Date(a.arrivalDate), dateB = new Date(b.arrivalDate);
                    return dateA - dateB;
                });

                //assigned
                this.sortedServiceRequests[1].data = this.applyFilters(
                    this.serviceRequests.filter(x => {
                        let searchWo = this.serviceRequests.filter(y => {
                            return y.workLocationId == x.workLocationId &&
                            y.materialNumber == x.materialNumber &&
                            y.bRegeling == true
                        });

                        let usedKnoppuntLocationIds = this.getUsedKnoppuntLocationIds(x.usedLocationIds);

                        return x.serviceRequest &&
                        // (x.repairLocation && parseInt(x.asset.maintenanceLocation) == parseInt(x.repairLocation.locationNumber)) &&
                        x.workLocationId !== null && x.repairLocationId !== null && x.arrivalDate !== null &&
                        x.serviceRequest.declinedStatus !== true &&
                        (x.ntLocationType !== null || x.ntLocationType !== "") &&
                        x.trainSchedule && x.trainSchedule.length > 0 &&
                        (   (searchWo && searchWo.length > 0) ||
                            (x.NTKENMERK1 && x.NTKENMERK1.toUpperCase().indexOf('B') !== -1) ||
                            (x.repairLocation && parseInt(x.asset.maintenanceLocation) == parseInt(x.repairLocation.locationNumber)) ||
                            (usedKnoppuntLocationIds && usedKnoppuntLocationIds.includes(x.repairLocationId))
                        )
                    })
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
                        }
                    }

                    obj.compareDate = selectedSchedule;
                }

                this.sortedServiceRequests[1].data = _.sortBy(this.sortedServiceRequests[1].data, function(dateObj) {
                    return new Date(dateObj.compareDate);
                });

                this.sortedServiceRequests[1].data = this.filterByWarning(this.sortedServiceRequests[1].data);

                //declined
                this.sortedServiceRequests[2].data = this.applyFilters(
                    this.serviceRequests.filter(x =>
                        x.serviceRequest && x.serviceRequest.declinedStatus === true && (x.ntLocationType !== null || x.ntLocationType !== ""))
                );

                //logistic
                this.sortedServiceRequests[3].data = this.applyFilters(
                    this.serviceRequests.filter(x => {
                        let searchWo = this.serviceRequests.filter(y => {
                            return y.repairLocationId == x.repairLocationId &&
                            y.materialNumber == x.materialNumber &&
                            y.bRegeling == true
                        });

                        let usedKnoppuntLocationIds = this.getUsedKnoppuntLocationIds(x.usedLocationIds);

                        return x.serviceRequest && (!searchWo || searchWo.length == 0) &&
                            (x.repairLocation && parseInt(x.asset.maintenanceLocation) !== parseInt(x.repairLocation.locationNumber)) &&
                            x.repairLocationId !== null && x.arrivalDate !== null &&
                            x.serviceRequest.declinedStatus !== true &&
                            (x.ntLocationType !== null || x.ntLocationType !== "") &&
                            !(x.NTKENMERK1 && x.NTKENMERK1.toUpperCase().indexOf('B') !== -1) &&
                            (!x.trainSchedule || x.trainSchedule.length === 0 ||
                            (usedKnoppuntLocationIds && !usedKnoppuntLocationIds.includes(x.repairLocationId)))
                    })
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

                    if(this.checkIfMatches(workOrder) && _.includes(workOrder.materialNumber.toLowerCase(), this.materialSearchQuery.toLowerCase())){
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

                let result = false;

                if(givenDate < maxDate){
                    result = true;
                }

                return result;
            },
            checkIfMatches(wo){
                // if(this.selectedSeriesCode !== null){
                //     console.log(wo.seriesCode, this.selectedSeriesCode)
                // }

                if((this.selectedSeriesCode === null || wo.seriesCode == this.selectedSeriesCode) &&
                    (wo.repairLocationId === this.selectedLocationId || this.selectedLocationId === null) &&
                    (wo.ntLocationType == this.selectedNtLocationType || this.selectedNtLocationType == null) ||
                    (wo.ntLocationType == "" && this.selectedNtLocationType == 'Leeg') &&
                    (this.selectedDateFilter == 1 && this.checkDateFilter(wo.overDueDate) || this.selectedDateFilter == 0)){

                    return true;

                    // if(this.selectedDateFilter == 1){
                    //     if(this.checkDateFilter(wo.overDueDate)){
                    //         return true;
                    //     } else {
                    //         return false;
                    //     }
                    // } else {
                    //     return true;
                    // }

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
                    this.updateLocations(()=> {
                        this.updateLocationsWholeList();
                        this.updateEquipmentTypes();
                        this.generateSeriesCodeList();
                        this.getNtLocationTypes();
                        this.updateQualifications();
                        this.updateEquipment();
                    })
                })
            },

            /**
             * Updates all the service windows
             * @param {Void} callback the callback on success
             */
            updateServiceRequests (callback) {

                let cacheKey = 'default'
                //let promise = $cache.workOrders.getListServiceRequestsMBN[cacheKey]
                //    ? Promise.resolve({data: JSON.stringify($cache.workOrders.getListServiceRequestsMBN[cacheKey])})
                //    : $workOrder.getListServiceRequestsMBN(undefined, null, null)
                let promise = $workOrder.getListServiceRequestsMBN(undefined, null, null)

                promise.then(response => {
                    this.serviceRequests = JSON.parse(response.data);
                    this.sortAndFilter();

                    if (callback) {
                        callback()
                    }
                }).catch(response => {
                    $loader.message = null
                })
            },

            /**
             * Update the list of locations
             * @param {Void} callback the callback on success
             */
            updateLocations (callback) {
                let cacheKey = 'default'
                let promise = $cache.locations.getList[cacheKey]
                    ? Promise.resolve({data: JSON.stringify($cache.locations.getList[cacheKey])})
                    : $location.getList()

                promise.then(response => {
                    $cache.locations.getList[cacheKey] = JSON.parse(response.data)
                    this.locations = [{
                        id: null,
                        name: 'Toon alle locaaties'
                    }]
                    this.locations = this.locations.concat($cache.locations.getList[cacheKey])
                    this.locations = this.sortLocations(this.locations);
                    setTimeout(() => {
                        $loader.message = null
                    }, 1000)

                    if (callback) {
                        callback()
                    }
                }).catch(response => {
                    $loader.message = null
                })
            },
            updateLocationsWholeList(){
                $location.getWholeList().then(response => {
                    this.locationsWholeList = JSON.parse(response.data)
                }).catch(response => {
                    $loader.message = null
                })
            },
            revertServiceRequest (eventArgs) {
                $serviceRequest.undoDecline(eventArgs.detail.workOrder.serviceRequest.id, eventArgs.detail.workOrder.usedLocationIds).then((response) => {
                    //
                })
                let index = _.findIndex(this.serviceRequests, { id: eventArgs.detail.workOrder.id })
                this.serviceRequests.splice(index, 1);
                this.selectedItem = null;
            }
        }
    }
</script>

<style lang="scss" scoped>
    $wireframeOpacity: 0;
    #page-content{
        float: left;
        width: 100%;
        position: relative;
        clear: both;
        height: 100%!important;
        padding-bottom: 0;
    }
    .monitor {
        #page-content {
            position: relative;
            height: calc(100vh - 215px)!important;
            .monitor-container {
                background: rgba(red, $wireframeOpacity);
                max-width: 100%;
                overflow: scroll;
                position: absolute;
                z-index: 0;

                .monitor-table {
                    height: 100%;
                    display: block;
                    width: 2150px;
                    background: rgba(blue, $wireframeOpacity);

                    .monitor-row {
                        margin-top: 30px;
                        background: rgba(red, $wireframeOpacity);
                        display: inline-block;
                        vertical-align: top;

                        .row-head {
                            padding: 20px 0;
                            height: 70px;
                            line-height: 30px;
                            color: #003082;
                            font-family: 'Open Sans', sans-serif;
                            font-size: 16px;

                            .row-head-right {
                                float: right;

                                >* {
                                    display: inline-block;
                                    vertical-align: top;
                                }

                                .icons {
                                    &:hover {
                                        cursor: pointer;
                                    }
                                }
                                .toggle{
                                    float: right;
                                    width: 130px;
                                    text-align: center;
                                    font-size: 12px;
                                    border: 1px solid #003082;
                                    cursor: pointer;
                                    border-radius: 5px;
                                    padding-left: 25px;
                                    position: relative;
                                    color: #DC0000;
                                    margin-right: 18px;

                                    .icons{
                                        position: absolute;
                                        left: 0;
                                        top: 0;
                                    }
                                    &.active{
                                        // outline: 1px solid #DC0000;
                                        border: 2px solid #DC0000!important;
                                        color: #DC0000;
                                        font-weight: 600;
                                        top: -1px;
                                        width: 131px;
                                    }

                                }
                            }
                        }

                        .row-content {
                            background: rgba(green, $wireframeOpacity);
                        }

                        .work-order-container {
                            width: 500px;
                            .work-order {
                                width: 500px;
                            }
                        }

                        &:not(:first-child) {
                            margin-left: 50px;
                        }
                    }
                }
            }
        }
        .monitor-bottom-container {
            border-top: 2px solid #d2d2d4;
            background: white;
            width: 100%;
            height: 125px;
            position: fixed;
            bottom: 0;
            left: 0;
            z-index: 0;

            .monitor-bottom {
                padding: 0 150px;

                .monitor-bottom-right {
                    float: right;
                    padding: 36.5px 0;
                    margin-left: 15px;

                    * {
                        vertical-align: middle;
                        display: inline-block;
                    }

                    .icons {
                        &:hover {
                            cursor: pointer;
                        }
                    }
                }
                .search-box{
                    float: right;
                    width: 300px;
                    margin: 36.5px 0;
                    border: 1px solid #0079d3;
                    border-radius: 10px;
                    &:after{
                        display: none;
                    }
                }
            }
        }
    }

    .monitor{
        #page-content{
            float: left;
            width: 100%;
            clear: both;
            height: calc(100vh - 126px);
            .monitor-container{
                width: 100%;
                float: left;
                clear: both;
                max-width: 100%;
                height: 100%;
                overflow: hidden;
                position: relative;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
            .monitor-table{
                width: 100%!important;
                position: relative;

                .monitor-row{
                    width: calc(100% / 4 - 10px)!important;
                    margin: 0!important;
                    margin-right: 10px!important;
                    height: 100%;
                    position: relative;
                    &:after{
                        display: block;
                        width: 17px;
                        background: #e6e6e9;
                        content: '';
                        height: 100%;
                        right: 0;
                        top: 0;
                        position: absolute;
                        z-index: 15;
                    }
                    .row-content{
                        float: left;
                        position: relative;
                        width: 100%;
                        height: calc(100% - 94px);
                        overflow-y: scroll;
                        .work-order-container{
                            width: calc(100% - 17px) !important;
                            .left{
                                width: 100%!important;
                                ul li:nth-child(2){
                                    display: none!important;
                                    width: 0px!important;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    ::v-deep .vue-recycle-scroller__item-wrapper {
        position: relative;
    }
    ::v-deep .vue-recycle-scroller__item-view {
        position: absolute;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
    }

    .modal-content {
        .picker-container{
            float: left;
            width: 100%;
            clear: both;
        }
        ul{
            float: left;
            width: 100%;
            clear: both;
            margin: 0 0 10px 0;
            li{
                float: left;
                clear: both;
                width: 100%;
                position: relative;
                font-size: 13px;
                border-bottom: 1px solid rgba(0,0,0,.1);
                padding: 8px 0;
                margin: 0;
                > span{
                    width: 100%;
                    float: left;
                    span{
                        float: right;
                        margin-right: 50px;
                    }
                }
                .button{
                    width: 30px;
                    height: 30px;
                    position: absolute;
                    right: 5px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    .icons{
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        margin: 0;
                        transform: translate(-50%, -50%);
                    }
                }
            }
        }
    }
</style>
