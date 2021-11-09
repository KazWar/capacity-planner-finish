<style lang="scss" scoped>
    @import "../../assets/scss/variables";

    $alpha: 0.33;

    .fade {
        opacity: $alpha;
    }

    .filters {
        padding-top: 25px;
        padding-bottom: 25px;
        height: 50px;
        overflow: hidden;
        max-height: 50px;
        width: 100%;
        box-sizing: content-box;

        .filters-left {
            float: left;
        }

        .filters-right {
            float: right;
        }

        .filter-button {
            display: inline-block;
            vertical-align: top;
            width: 80px;
            height: 50px;
            border-radius: 10px;
            color: #C5C5CB;
            border: 2px solid #C5C5CB;
            font-size: 18px;
            text-align: center;
            line-height: 46px;
            box-sizing: border-box;
            position: relative;

            @media (max-width: 1899px) {
                width: 50px;

                span {
                    &:nth-child(2) {
                        display: none;
                    }
                }

                &.big {
                    max-width: 180px;
                }
            }

            &.big {
                width: 220px;
            }

            &.selected {
                color: #0079d3;
                border: 2px solid #0079D3;
            }

            &:not(:first-child) {
                margin-left: 10px;
            }

            &:hover {
                cursor: pointer;
                color: #0079d3;
                border: 2px solid #0079D3;
            }
        }
    }

    #trains {
        #page-content {
            padding-top: 0;

            &:nth-child(3) {
                position: fixed;
                bottom: 0;
                left: 0;
                background: white;
                width: 100%;
                text-align: right;
                height: 125px;
                padding-bottom: 0;
                border-top: 2px solid #C5C5CB;
                z-index: 1000000000;

                button {
                    padding: 0 35px;
                    font-size: 16px;
                    margin-top: 31.25px;
                    font-family: 'Open Sans';
                    height: 62.5px;
                    line-height: 62.5px;
                    box-sizing: padding-box;

                    & {
                        $color: #0079D3;
                        background-color: $color;
                        border: 0;
                        border-bottom: 2px solid #045A9A;
                        color: #fff;

                        &:hover {
                            background-color: $color * 1.2;
                        }
                    }
                    &:hover {
                        cursor: pointer;
                    }
                }
            }
        }

        .work-orders {
            z-index: 10000;
            padding: 35px 0;
            // padding-top: 100px;
            padding-top: 25px;
            width: 620px;
            margin-right: 30px;
            overflow-y: scroll;
            overflow-x: hidden;
            float: left;
            box-sizing: content-box;
            position: relative;
            height: calc(100vh - 333px);
            // .work-order-container{
            //     height: 100%;
            // }
        }

        .scrollbar-hide {
            background: #e6e6e9;
            z-index: 100000;
            margin-left: 620px;
            position: absolute;
            height: 100%;
        }

        .right {
            overflow: hidden;
            position: absolute;
            left: 0;
            margin-left: 780px;
            border-right: 900px solid #e6e6e9;
            border-left: 30px solid #e6e6e9;
            width: 100%;
            padding-top: 0;
            height: 74vh;
            .right-content{
                float: left;
                width: calc(100% + 17px);
                padding-right: 17px;
                position: relative;
                height: 100%;
                overflow: hidden;
                overflow-y: scroll;
            }
            // overflow-y: auto;
            h1{
                width: 100%;
                display: block;
                line-height: 35px;
                font-size: 16px;
                font-weight: 400;
                color: #003082;
                line-height: 30px;
                vertical-align: middle;
            }


            .chart {
                margin-bottom: 15px;
                &:not(:first-child):not(:nth-child(2)) {
                    margin-top: 5px;
                }

            }
        }
    }

    .search-box{
        width: 100%;
        height: 50px;
        background: #fff;
        position: relative;
        .search-container{
            float: left;
            width: calc(100% - 205px);
            position: relative;
        }
        > .icons{
            position: absolute;
            right: -10px;
            top: 9px;
            width: 30px;
            height: 30px;
            margin-left: 15px;
            cursor: pointer;
        }

    }

    button.disabled{
        opacity: .5;
        pointer-events: none;
        cursor: not-allowed;
    }
</style>

<template>
    <div id="trains" class="workorders-page">
        <page-content>
            <div class="m-tabs">
                <ul>
                    <li @click="activateMobileTab(0)" :class="{'active': activeMobileTab == 0}">
                        Werkorders
                    </li>

                    <li @click="activateMobileTab(1)" :class="{'active': activeMobileTab == 1}">
                        Overstanden
                    </li>

                    <li @click="activateMobileTab(2)" :class="{'active': activeMobileTab == 2}" v-if="selectedWorkOrder">
                        Geweigerd
                    </li>

                    <li @click="activateMobileTab(3)" :class="{'active': activeMobileTab == 3}" v-if="selectedWorkOrder">
                        Logistiek
                    </li>
                </ul>
            </div>
            <div class="work-orders" :class="{'m-visible': activeMobileTab == 0}">
                <div class="work-order-container">
                    <div class="filters" :class="{'m-visible': activeMobileTab == 0}">
                        <div class="filters-left">
                            <div class="filter-button big" :class="{'selected': workOrderFilter === 0}" @click="workOrderFilter = 0">
                                Belemmerend
                                <badge  :value="counts.mandatory"/>
                            </div>
                            <div class="filter-button big" :class="{'selected': workOrderFilter === 1}" @click="workOrderFilter = 1">
                                Waarschuwing
                                <badge :value="counts.watched"/>
                            </div>
                            <div class="filter-button big" :class="{'selected': workOrderFilter === 2}" @click="workOrderFilter = 2">
                                Overig
                                <badge :value="counts.others"/>
                            </div>
                        </div>
                    </div>
                    <div class="search-box">
						<TextInput :paddingless="false" :borderless ="false" placeholder="Zoek naar stel/stam" v-model="materialSearchQuery" class="search-box" :searchable="true" :clearable="false"/>
                        <picker
                            direction="bottom"
                            type="select"
                            selectType="round"
                            class="picker-custom"
                            :selectSize="40"
                            v-model="filterByWorkType"
                            :values="workTypes"
                            label="Werk type"
                            selectIdProperty="name"
                            selectValueProperty="name"/>
                        <div
                            class="icons"
                            v-if="filterByWorkType !== null"
                            @click="filterByWorkType = null">
                            <icon
                                name="plus"
                                size="40"
                                transition="none"
                                :colors="{default: '#0079d3', hover: '#003082'}"
                                style="margin-top: -5px; margin-right: -0px; transform: rotate(-45deg); -o-transform: rotate(-45deg); -moz-transform: rotate(-45deg); -webkit-transform: rotate(-45deg);"/>
                        </div>
                    </div>



                    <work-order
                        :getQualifiedMechanicsForTask="getQualifiedMechanicsForTask"
                        :initializeOnStart="initializeWorkOrderId === workOrder.id"
                        :tasksSelectable="true" type="work-order"
                        :canEditTask="true"
                        :canEditEquipment="true"
                        :canEditLeadTime="true"
                        :equipmentList="equipment"
                        :selectTaskId="selectTaskId"
                        :selectedTaskIds="selectedTaskIds"
                        :startDateChart="startDate"
                        :displayHoursChart="displayHours"
                        :workOrder="workOrder"
                        :mechanics="mechanics"
                        :statusFlag="checkStatusFlag(workOrder)"
                        :listenSentToMaximo="listenSentToMaximo"
                        @reinitWorkOrders="reinitWorkOrders"
                        @preventPlaning="preventPlaningWos"
                        :class="{'selected': isWorkOrderSelected(workOrder), 'first': filteredWorkOrderIds[0] === workOrder.id}"
                        v-for="(workOrder, index) in workOrders" :key="index"
                        v-if="((selectedMaterialNumber == workOrder.materialNumber || selectedMaterialNumber == null) && _.includes(workOrder.materialNumber.toLowerCase(), materialSearchQuery.toLowerCase()) && (workOrder.type == filterByWorkType || filterByWorkType == null) && checkIfWorkorderMatchesCategory(workOrder))"/>

                        <!-- filteredWorkOrderIds.indexOf(workOrder.id) !== -1 -->
                </div>
            </div>
            <div class="scrollbar-hide"></div>

            <div class="right">
                <div class="right-content">
                    <div class="filters" :class="{'m-visible': activeMobileTab !== 0}">
                        <div class="filters-left m-hide">
                            <div class="filter-button big" :class="{'selected': workOrderFilter === 0}" @click="workOrderFilter = 0">
                                Belemmerend
                                <badge  :value="counts.mandatory"/>
                            </div>
                            <div class="filter-button big" :class="{'selected': workOrderFilter === 1}" @click="workOrderFilter = 1">
                                Waarschuwing
                                <badge :value="counts.watched"/>
                            </div>
                            <div class="filter-button big" :class="{'selected': workOrderFilter === 2}" @click="workOrderFilter = 2">
                                Overig
                                <badge :value="counts.others"/>
                            </div>
                        </div>
                        <div class="filters-right">
                            <div class="filter-button" :class="{'selected': displayHours === 8}" @click="changeDisplayHours(8)">
                                <span>8</span><span> uur</span>
                            </div>
                            <div class="filter-button" :class="{'selected': displayHours === 16}" @click="changeDisplayHours(16)">
                                <span>16</span> <span> uur</span>
                            </div>
                            <div class="filter-button" :class="{'selected': displayHours === 24}" @click="changeDisplayHours(24)">
                                <span>24</span> <span> uur</span>
                            </div>
                        </div>
                    </div>
                    <h1 class="m-hide">Overstanden</h1>
                    <chart
                        :visualizeCurrentHour="true"
                        :id="chartIds.trains"
                        :selectable="true"
                        :maxRows="maxRows.trains"
                        :labels="labels.trains"
                        :displayHours="displayHours"
                        :startDate="startDate"
                        :overlays="overlays.trains"
                        :selectedTaskIds="selectedTaskIds"
                        :offsetHours="offsetHours"
                        :broadcastScrollEvents="true"
                        :chartStatus="true"
                        :class="{'m-visible': activeMobileTab == 1}" class="big"/>
                    <h1>Monteurs</h1>
                    <chart
                        :visualizeCurrentHour="true"
                        :id="chartIds.mechanics"
                        :selectable="true"
                        :maxRows="maxRows.mechanics"
                        :labels="labels.mechanics"
                        :displayHours="displayHours"
                        :startDate="startDate"
                        :hideHours="true"
                        :overlays="overlays.mechanics"
                        :selectedTaskIds="selectedTaskIds"
                        :offsetHours="offsetHours"
                        :broadcastScrollEvents="true"
                        type="mechanics"
                        :chartStatus="true"
                        :selectedWorkorder="selectedWorkorder"
                        :class="{'m-visible': activeMobileTab == 2}"/>

                    <h1>Outillage</h1>
                    <chart :visualizeCurrentHour="true" :id="chartIds.equipment" :maxRows="maxRows.equipment" :labels="labels.equipment" :displayHours="displayHours" :chartStatus="true" :startDate="startDate" :hideHours="true" :overlays="overlays.equipment" :selectedTaskIds="selectedTaskIds" :offsetHours="offsetHours" :broadcastScrollEvents="true" :hide="!isEquipmentChartVisible()" :class="{'m-visible': activeMobileTab == 3}"/>
                </div>

            </div>
        </page-content>

        <page-content>
            <button @click="confirmPlan()" :class="{'disabled': preventFastButtonClicks}">
                Plan bevestigen
            </button>
        </page-content>

        <modal v-model="displayConflictsModal" :title="null" :noPadding="true">
            <div slot="content">
                <div class="content-left" :style="{'margin-left': '-20px', 'margin-top': '-10px'}">
                    <icon name="alert" :size="60" color="rgb(255, 120, 0)"/>
                </div>
                <div class="content-right">
                    <p v-if="amountOfConflicts !== 1">Er bevinden zich <span style="font-weight: normal;">{{amountOfConflicts}}</span> conflicten in het plan.</p>
                    <p v-else>Er bevindt zich <span style="font-weight: normal;">{{amountOfConflicts}}</span> conflict in het plan.</p>
                    <p>Weet u zeker dat u de planning naar Maximo wilt sturen?</p>
                </div>
            </div>
            <div slot="buttons" :style="{'text-align' : 'right'}">
                <button class="button orange" :style="{'margin-right': '15px'}" @click="confirmPlan()">
                    Ja
                </button><button class="button orange" @click="displayConflictsModal = false">
                    Nee
                </button>
            </div>
        </modal>

        <modal v-model="reasonMaintenanceModal.enabled" title="Reden binnenkomst wijzigen" :noPadding="true">
            <div slot="content">
                <picker icon="info" label="Kies werklocatie" v-model="reasonMaintenanceModal.reasonMaintenance" type="select" selectIdProperty="code" selectValueProperty="reason" :values="maintenanceReasons" />
            </div>
            <div slot="buttons" :style="{'text-align': 'right', 'padding-top': '20px'}">
                <button class="button orange" @click="saveReasonMaintenance()">Opslaan</button>
            </div>
        </modal>
    </div>
</template>

<script>
import $date from '@/modules/date-module'
import $workOrder from '@/modules/api/api-workorder'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import $mechanicSchedule from '@/modules/api/api-mechanic-schedule'
import $trainSchedule from '@/modules/api/api-train-schedule'
import $equipment from '@/modules/api/api-equipment'
import $task from '@/modules/api/api-task'
import $taskEquipment from '@/modules/api/api-task-equipment'
import $cache from '@/modules/cache-module'
import $asset from '@/modules/api/api-asset'
import $maintenanceReasons from '@/data/maintenance-reasons'
import $http from '@/modules/http-module'
import $location from '@/modules/api/api-location'

export default {
    data: function () {
        return {
            activeMobileTab: 0,
            workOrders: [],

            mechanics: [],

            mechanicSchedules: [],

            trainSchedules: [],

            startDate: $date.toDateString(new Date()),

            displayHours: Number(localStorage.getItem('sbWorkOrdersDisplayHours') || 8),

            workOrderFilter: Number(localStorage.getItem('sbWorkOrdersWorkOrderFilter') || 0),

            maxRows: {
                trains: 0,
                mechanics: 0,
                equipment: 0
            },

            labels: {
                trains: [],
                mechanics: [],
                equipment: []
            },

            overlays: {
                trains: [],

                mechanics: [],

                equipment: []
            },

            selectMechanics: [],

            selectedMaterialNumber: null,

            selectedMechanicId: null,

            selectedTaskIds: [],

            assets: [],

            equipment: [],

            chartIds: {
                trains: 1,

                mechanics: 2,

                equipment: 3
            },

            offsetHours: 0,

            initializeWorkOrderId: null,

            displayConflictsModal: false,

            amountOfConflicts: 0,

            selectedWorkOrder: null,

            updateAfterSocketUpdatePerTaskId: {},

            reasonMaintenanceModal: {
                enabled: false,
                materialNumber: null,
                reasonMaintenance: null,
                asset: null
            },

            maintenanceReasons: $maintenanceReasons,
            materialSearchQuery: '',

            listenSentToMaximo: true,

            badges: {
                mandatory: 0,
                nonMandatory: 0,
                serviceRequests: 0
            },

            workTypes: [
                {
                    name: 'DC'
                },
                {
                    name: 'CO'
                },
                {
                    name: 'WUI'
                },
                {
                    name: 'PREIN'
                },
                {
                    name: 'CREIN'
                },
                {
                    name: 'PO'
                }
            ],
            filterByWorkType: null,

            counts: {
                mandatory: 0,
                watched: 0,
                others: 0
            },

            preventFastButtonClicks: false,
            locations: [],
            currentLocationData: null
        }
    },

    computed: {

        /**
         * Get the list of filtered workorder ids
         */
        filteredWorkOrderIds () {
            let ids = []
            let materialNumbers = this.trainSchedules.map(x => x.materialNumber).filter((v, i, a) => a.indexOf(v) === i)

            workOrderLoop: for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]


                if (materialNumbers.indexOf(workOrder.materialNumber) === -1) {
                    continue
                }

                if (this.selectedMaterialNumber !== null) {
                    if (String(this.selectedMaterialNumber) !== String(workOrder.materialNumber)) {
                        continue
                    }
                }
                let foundMechanic = false
                if (this.selectedMechanicId !== null) {
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        if (task.mechanicId !== this.selectedMechanicId) {
                            continue
                        }
                        foundMechanic = true
                    }
                    if (!foundMechanic) {
                        continue
                    }

                }

                if (this.workOrderFilter == 0 && workOrder.mandatory == true && workOrder.isWatched !== true) {
                    ids.push(workOrder.id)
                }
                else if (this.workOrderFilter == 1 && workOrder.isWatched == true && workOrder.mandatory !== true) {
                    ids.push(workOrder.id)
                }

                else if (
                    this.workOrderFilter == 2 && (workOrder.mandatory !== true && workOrder.isWatched !== true) ||
                    this.workOrderFilter == 2 && (workOrder.mandatory == true && workOrder.isWatched == true)) {
                    ids.push(workOrder.id)
                }
            }
            return ids
        }
    },

    created: function () {
        window.addEventListener('resize', this.processStyleForElements)
        document.addEventListener('workOrdersParamsChange', this.onWorkOrdersParamsChange)
        document.addEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.addEventListener('workOrderTaskChange', this.onChangeWorkOrderTask)
        document.addEventListener('selectedTaskIdsChange', this.onSelectedTaskIdsChange)
        document.addEventListener('selectedWorkOrderChange', this.onSelectedWorkOrderChange)
        document.addEventListener('workOrderTaskEquipmentChange', this.onWorkOrderTaskEquipmentChange)
        document.addEventListener('chartClickOverlay', this.onChartClickOverlay)
        document.addEventListener('workOrderInitializeOnStart', this.onWorkOrderInitializeOnStart)
        document.addEventListener('appSocketUpdate', this.onAppSocketUpdate)
        document.addEventListener('workOrderMaintenanceTrackChange', this.onWorkOrderMaintenanceTrackChange)
    },

    mounted: function () {
        this.getAllMechanics();
        this.getCounts();
        this.updateData(() => {
            if (this.$route.params && this.$route.params.serviceRequestId) {
                this.openServiceRequest(this.$route.params.serviceRequestId)
            }
            else if (this.$route.params && this.$route.params.workOrderId) {
                this.openWorkOrder(this.$route.params.workOrderId)
            }
            else if (this.$route.params && this.$route.params.WO) {
                let workOrders = this.workOrders.filter(x => String(x.WO) === String(this.$route.params.WO))
                if (workOrders.length === 0) {
                    return
                }
            }
            this.processStyleForElements()
            this.onSelectedTaskIdsChange({
                detail: {
                    selectedTaskIds: this.selectedTaskIds
                }
            })
        })
    },

    beforeDestroy: function () {
        window.removeEventListener('resize', this.processStyleForElements)
        document.removeEventListener('workOrdersParamsChange', this.onWorkOrdersParamsChange)
        document.removeEventListener('chartSelectLabel', this.onChartSelectLabel)
        document.removeEventListener('workOrderTaskChange', this.onChangeWorkOrderTask)
        document.removeEventListener('selectedTaskIdsChange', this.onSelectedTaskIdsChange)
        document.removeEventListener('selectedWorkOrderChange', this.onSelectedWorkOrderChange)
        document.removeEventListener('workOrderTaskEquipmentChange', this.onWorkOrderTaskEquipmentChange)
        document.removeEventListener('chartClickOverlay', this.onChartClickOverlay)
        document.removeEventListener('workOrderInitializeOnStart', this.onWorkOrderInitializeOnStart)
        document.removeEventListener('appSocketUpdate', this.onAppSocketUpdate)
        document.removeEventListener('workOrderMaintenanceTrackChange', this.onWorkOrderMaintenanceTrackChange)
    },

    watch: {

        displayHours: function () {
            localStorage.setItem('sbWorkOrdersDisplayHours', this.displayHours || 8)
            this.$forceUpdate()
            this.$nextTick(() => {
                document.dispatchEvent(new CustomEvent('chartRegenerateHours', {
                    detail: {
                        x: this.offsetHours,
                        y: 0
                    }
                }))
            })
        },

        workOrderFilter: function (newval, oldval) {
            localStorage.setItem('sbWorkOrdersWorkOrderFilter', this.workOrderFilter || 0);
        },

        mechanics: {
            handler: function () {
                this.onChangeMechanics()
            },
            deep: true
        },

        mechanicSchedules: {
            handler: function () {
                this.updateShiftOverlaysInMechanicChart()
            },
            deep: true
        },

        trainSchedules: {
            handler: function () {
                this.onChangeTrainSchedules()
            },
            deep: true
        },

        selectedMechanicId: function () {
            if (this.selectedMechanicId === null) {
                // De-emphasize the label in the mechanic chart
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: []
                    }
                }))
                return
            }

            // Deselect the material number (only one filter at a time)
            this.selectedMaterialNumber = null

            // Deselect the label index for the train chart
            document.dispatchEvent(new CustomEvent('chartDeselectIndex', {
                detail: {
                    chartId: this.chartIds.trains
                }
            }))

            // De-emphasize the label in train chart
            document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                detail: {
                    id: this.chartIds.trains,
                    indices: []
                }
            }))
        },

        selectedMaterialNumber: function () {
            if (this.selectedMaterialNumber === null) {
                return
            }

            // find the material number belonging to the currently selected task
            let taskMaterialNumber = null
            if (this.selectedTaskIds.length > 0) {
                workOrderLoop: for (let workOrderIndex in this.workOrders) {
                    let workOrder = this.workOrders[workOrderIndex]
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        if (this.selectedTaskIds.indexOf(task.id) !== -1) {
                            taskMaterialNumber = workOrder.materialNumber
                            break workOrderLoop
                        }
                    }
                }
            }

            // when the selected material number differs from the selected tasks
            if (taskMaterialNumber !== this.selectedMaterialNumber) {
                this.selectedTaskIds = []
                this.onSelectedTaskIdsChange({
                    detail: {
                        selectedTaskIds: []
                    }
                })
                this.selectedMechanicId = null
                document.dispatchEvent(new CustomEvent('chartDeselectIndex', {
                    detail: {
                        chartId: this.chartIds.mechanics
                    }
                }))
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.trains,
                        indices: []
                    }
                }))
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: []
                    }
                }))
            }
        },

        offsetHours: function () {
            this.onChangeOffsetHours()
        }
    },

    methods: {
        updateLocations (callback) {
            let cacheKey = 'default'
            let promise = $location.getWholeList()

            promise.then(response => {
                // $cache.locations.getList[cacheKey] =
                this.locations =  this.parseValues(JSON.parse(response.data));

                this.locations = this.sortLocations(this.locations);

                this.getCurrentLocation();
                if (callback) {
                    callback()
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },
        getCurrentLocation(){
            let curentLocationId = localStorage.getItem('locationId');

            for(let i = 0; i < this.locations.length; i++){
                let locationId = this.locations[i].id;

                if(locationId == curentLocationId){
                    this.currentLocationData = this.locations[i];
                }
            }
        },
        preventPlaningWos(bool){
            this.preventFastButtonClicks = bool;
        },
        checkIfWorkorderMatchesCategory(wo){

            if(this.workOrderFilter == 0){
                if(wo.mandatory == true){
                    return true;
                } else {
                    return false;
                }
            } else if(this.workOrderFilter == 1){
                if(wo.isWatched == true){
                    return true;
                } else {
                    return false;
                }
            } else {
                if(wo.isWatched == false && wo.mandatory == false){
                    return true;
                } else {
                    return false;
                }
            }
        },
        getCounts(){
            let timezoneoffset = ((new Date(new Date().getTime())).getTimezoneOffset())*(60*1000);
            let today = $date.toDateString(new Date(new Date().getTime() + timezoneoffset)).substring(0, 13) + ':00:00';
            let tomorrow = $date.toDateString(new Date(new Date().getTime() + timezoneoffset + 24 * 60 * 60 * 1000)).substring(0, 13) + ':00:00'
            let locationId = localStorage.getItem('locationId');
            this.axios.get($http.apiBase + 'workOrders/getSbList2Count?locationId='+ locationId + '&arrivalDate=' + today + '&departureDate=' + tomorrow).then((response) => {
                this.counts = {
                    mandatory: response.data.mandatory,
                    watched: response.data.isWatched,
                    others: response.data.notMandatory
                }
            })
        },
        reinitWorkOrders(obj){
            for(let i = 0; i < this.workOrders.length; i++){
                let current = this.workOrders[i];

                if(current.id == obj.wo.id){
                    this.workOrders[i] = obj.wo;

                }
            }

            let args = {
                detail: {
                    workOrder: obj.wo
                }
            }
            this.onSelectedWorkOrderChange(args);
            this.updateTasksInChart();

            if(obj.task){
                let chartStartDate = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                document.dispatchEvent(new CustomEvent('chartScrollToPosition', {
                    detail: {
                        x: Math.max(((new Date(obj.task.tempStart).getTime() - chartStartDate.getTime()) / 1000 / 60 / 60) - (5 / 60) + this.offsetHours, 0)
                    }
                }))
            }
        },
        getAllMechanics(){
            this.axios.get($http.apiBase + '/Mechanics').then((response) => {
                this.mechanics = response.data;
            })
        },
        checkStatusFlag(wo){
            let statusFlag = '';

            if (wo.locationId && wo.workLocationId && wo.workLocationId != wo.locationId){
                statusFlag = 1;
            } else if ((wo.tasks || []).length <= 0){
                statusFlag = 2;
            } else if (wo.locationId && wo.workLocationId && wo.workLocationId != wo.locationId && wo.status != "WGK"){
                statusFlag = 4;
            } else if (wo.locationId && wo.workLocationId && wo.workLocationId == wo.locationId && wo.status == "WOM"){
                statusFlag = 5;
            }

            return statusFlag;
        },
        activateMobileTab(type){
            this.activeMobileTab = type;
        },
        /**
         * Whenever the maintenance track changes on a workorder.
         * @param {CustomEvent} eventArgs the event arguments
         */
        onWorkOrderMaintenanceTrackChange (eventArgs) {
            this.preventPlaningWos(true);
            this.$nextTick(() => {
                if (this.workOrders.filter(x => Number(x.id) === eventArgs.detail.id).length === 0) {
                    return
                }
                $workOrder.put({
                    ...this.workOrders.filter(x => Number(x.id) === eventArgs.detail.id)[0],
                    maintenanceTrack: eventArgs.detail.maintenanceTrack
                }).then(() => {
                    setTimeout(() => {
                        this.preventPlaningWos(false);
                    }, 1500)

                })
            })
        },

        /**
         * Updates the task from socket update
         */
        updateTaskFromSocketUpdate (eventArgs) {
            let materialNumber = this.workOrders.filter(
                workOrder => workOrder.tasks.map(
                    task => Number(task.id)
                ).filter(taskId => taskId === Number(eventArgs.detail.data.id)).length === 1
            )
            if (materialNumber.length !== 1) {
                return
            }
            materialNumber = materialNumber[0].materialNumber

            // check if the task has a different conflict / time status opposed to what is given in the overlays
            let taskInOverlay = this.overlays.trains.map(row => row.filter(overlay => overlay.id === eventArgs.detail.data.id)).filter(row => row && row.length === 1)
            if (taskInOverlay.length === 1) {
                // task found
                taskInOverlay = taskInOverlay[0][0]

                let sharedPropertyValues = {
                    conflictMechanic: false,
                    conflictServiceWindow: false,
                    mechanicId: false,
                    leadTimeMinutes: false,
                    tempStart: false,
                    tempEnd: false
                }

                for (let propertyName in sharedPropertyValues) {
                    sharedPropertyValues[propertyName] = eventArgs.detail.data[propertyName] === taskInOverlay.object[propertyName]
                }

                let sharedEquipment = JSON.stringify(taskInOverlay.object.equipments.map(equipment => equipment.equipmentId).sort((x, y) => x > y ? 1 : (y > x ? -1 : 0)))
                    === JSON.stringify(eventArgs.detail.data.equipments.map(equipment => equipment.equipmentId).sort((x, y) => x > y ? 1 : (y > x ? -1 : 0)))

                if ((!sharedEquipment || !sharedPropertyValues.mechanicId || (this.updateAfterSocketUpdatePerTaskId[eventArgs.detail.data.id] === 'equipment')) && this.selectedTaskIds.indexOf(eventArgs.detail.data.id) !== -1) {
                    // Update equipment or mechanic
                    // console.debug('Update task equipment or mechanic')
                    this.onSelectedTaskIdsChange({
                        detail: {
                            selectedTaskIds: this.selectedTaskIds
                        }
                    })
                    delete this.updateAfterSocketUpdatePerTaskId[eventArgs.detail.data.id]
                }
                if (Object.keys(sharedPropertyValues).map(propertyName => sharedPropertyValues[propertyName]).filter(value => value === false).length > 0) {

                    // Also check for the revisionCount to avoid double alterations.
                    let revisionCountInCache = $cache.revisionCountByTaskId[taskInOverlay.object.id] || 0
                    if ((!sharedPropertyValues.leadTimeMinutes || !sharedPropertyValues.tempStart || !sharedPropertyValues.tempEnd || !sharedEquipment) && revisionCountInCache < eventArgs.detail.data.revisionCount) {
                        // console.debug('Updated task in chart only')
                        this.updateTaskInChart(materialNumber, eventArgs.detail.data, false)
                    }

                    this.$forceUpdate()
                    document.dispatchEvent(new CustomEvent('chartForceUpdate', {
                        detail: {
                            chartId: this.chartIds.trains
                        }
                    }))
                }
                else {
                    let revisionCountInCache = $cache.revisionCountByTaskId[taskInOverlay.object.id] || 0
                    if (revisionCountInCache < eventArgs.detail.data.revisionCount) {
                        // console.debug('Update due to revision count')
                        $cache.revisionCountByTaskId[taskInOverlay.object.id] = eventArgs.detail.data.revisionCount
                        this.updateTaskInChart(materialNumber, eventArgs.detail.data, false)
                        this.$forceUpdate()
                        document.dispatchEvent(new CustomEvent('chartForceUpdate', {
                            detail: {
                                chartId: this.chartIds.trains
                            }
                        }))
                    }
                }
            }
        },

        /**
         * When the app gets a socket update
         * @param {CustomEvent} eventArgs the event arguments
         */
        onAppSocketUpdate (eventArgs) {
            this.$nextTick(() => {
                switch (eventArgs.detail.channel) {
                    case 'Task/PUT':
                        this.updateTaskFromSocketUpdate(eventArgs)
                    break
                    case 'WorkOrder/PUT':
                        for (let taskIndex in eventArgs.detail.data.tasks) {
                            let task = eventArgs.detail.data.tasks[taskIndex]
                            this.updateTaskFromSocketUpdate({
                                detail: {
                                    ...eventArgs.detail,
                                    data: task
                                }
                            })
                        }
                    break
                    case 'MechanicSchedule/PUT':
                        if (!eventArgs.detail.data || !eventArgs.detail.data.mechanic || !eventArgs.detail.data.mechanicId) {
                            break
                        }
                        this.mechanics = this.mechanics.map(mechanic => {
                            if (Number(mechanic.id) === Number(eventArgs.detail.data.mechanicId)) {
                                return eventArgs.detail.data.mechanic
                            }
                            return mechanic
                        })
                    break
                    case 'Shift/PUT':
                        if (!eventArgs.detail.data) {
                            break
                        }
                        this.mechanicSchedules = this.mechanicSchedules.map((schedule) => {
                            if (schedule && Number(schedule.id) !== eventArgs.detail.data.id) {
                                return schedule
                            }
                            return {
                                ...schedule
                            }
                        })
                    break
                }
            })
        },

        /**
         * When the params change of the workorders page.
         * @param {CustomEvent} eventArgs the event args
         */
        onWorkOrdersParamsChange (eventArgs) {
            setTimeout(() => {
                if (eventArgs.detail.WO) {
                    for (let workOrderIndex in this.workOrders) {
                        let workOrder = this.workOrders[workOrderIndex]
                        if (String(workOrder.WO) !== String(eventArgs.detail.WO)) {
                            continue
                        }
                        document.dispatchEvent(new CustomEvent('workOrderClose'))

                        if (workOrder.mandatory === true) {
                            this.workOrderFilter = 0
                        }
                        else if (workOrder.isWatched === true) {
                            this.workOrderFilter = 1
                        }
                        else if (workOrder.mandatory === false && workOrder.isWatched === false) {
                            this.workOrderFilter = 2
                        }
                        document.dispatchEvent(new CustomEvent('workOrderOpen', {
                            detail: {
                                id: workOrder.id
                            }
                        }))
                        document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                            detail: {
                                id: workOrder.id
                            }
                        }))

                        this.onSelectedTaskIdsChange({
                            detail: {
                                selectedTaskIds: workOrder.tasks.map(x => Number(x.id))
                            }
                        })
                        setTimeout(() => {
                            this.onWorkOrderInitializeOnStart({
                                detail: {
                                    id: workOrder.id
                                }
                            })
                        })
                        document.dispatchEvent(new CustomEvent('chartForceUpdate'))
                        this.$forceUpdate()
                        break
                    }
                }
            })
        },

        /**
         * Updates all of the data
         * @param {Void} callback the callback when all data is initialized
         */
        updateData (callback) {
            $loader.message = 'Roosters ophalen'
            this.updateLocations(() => {
                this.updateMechanicSchedules(() => {
                    $loader.message = 'Treinschema\'s ophalen'

                    this.updateAssets(() => {
                        this.updateTrainSchedules(() => {
                            $loader.message = 'Outillage ophalen'
                            this.updateWorkOrders(() => {
                                this.updateEquipment(() => {
                                    // $loader.message = 'Werkorders ophalen'
                                })
                            });

                        })
                    })
                })
            })
        },

        /**
         * Update the list of assets
         * @param {Void} callback the callback to fire when done
         */
        updateAssets (callback) {
            let locationId = localStorage.getItem('locationId');
            $asset.getAssetsWithActualFleetStatus(locationId).then(response => {
                this.assets = JSON.parse(response.data)
                if (callback) {
                    callback()
                }
                else {
                    $loader.message = null
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Update the list of mechanic schedules
         * @param {Void} callback the callback to fire when done
         */
        updateMechanicSchedules (callback) {
            let today = $date.toDateString(new Date(new Date().getTime() - 24 * 60 * 60 * 1000)).substring(0, 10)
            let tomorrow = $date.toDateString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).substring(0, 10)
            let locationId = localStorage.getItem('locationId')
            let cacheKey = locationId + '-' + today + ' - ' + tomorrow
            $mechanicSchedule.getShifts(locationId, today, tomorrow).then(response => {
                let ids = []
                this.mechanicSchedules = JSON.parse(response.data)
                this.mechanics = []

                for (let index in this.mechanicSchedules) {
                    let schedule = this.mechanicSchedules[index]
                    if (ids.indexOf(schedule.mechanicId) !== -1) {
                        continue
                    }
                    ids.push(schedule.mechanicId)
                    this.mechanics.push(schedule.mechanic)
                }

                $loader.message = null

                if (callback !== undefined) {
                    callback()
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Update the list of train schedules
         * @param {Void} callback the callback to fire when done
         */
        updateTrainSchedules (callback) {
            let timezoneoffset = ((new Date(new Date().getTime())).getTimezoneOffset())*(60*1000);
            let yesterday = $date.toDateString(new Date(new Date().getTime() + timezoneoffset - 24 * 60 * 60 * 1000)).substring(0, 13) + ':00:00'
            let today = $date.toDateString(new Date(new Date().getTime() + timezoneoffset)).substring(0, 13) + ':00:00'
            let tomorrow = $date.toDateString(new Date(new Date().getTime() + timezoneoffset + 24 * 60 * 60 * 1000)).substring(0, 13) + ':00:00'
            let locationId = localStorage.getItem('locationId')
            let cacheKey = locationId + ' - ' + today + ' - ' + tomorrow
            let promise = $trainSchedule.getList(localStorage.getItem('locationId'), today, tomorrow)

            promise.then(response => {
                $cache.trainSchedules.getListLocationTodayTomorrow[cacheKey] = JSON.parse(response.data)
                this.trainSchedules = $cache.trainSchedules.getListLocationTodayTomorrow[cacheKey]
                $loader.message = null

                if (callback !== undefined) {
                    callback()
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Update the list of equipment
         * @param {Void} callback the callback to fire when done
         */
        updateEquipment (callback) {
            let locationId = localStorage.getItem('locationId')
            let promise = $equipment.getList(localStorage.getItem('locationId'))

            promise.then(response => {
                $cache.equipment.getListLocation[locationId] = JSON.parse(response.data)
                this.equipment = $cache.equipment.getListLocation[locationId]
                $loader.message = null

                if (callback !== undefined) {
                    callback()
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
            })
        },

        /**
         * Update the list of work orders
         * @param {Void} callback the callback to fire when done
         */
        updateWorkOrders (callback) {
            let today = this.$moment().utc().format('YYYY-MM-DD HH:MM:SS').toString().substring(0, 13) + ':00:00'
            let tomorrow = this.$moment().add(1, 'days').utc().format('YYYY-MM-DD HH:MM:SS').toString().substring(0, 13) + ':00:00'

            let materialNumbers = []
            for (let trainLabelIndex in this.labels.trains) {
                let trainLabel = this.labels.trains[trainLabelIndex]
                materialNumbers.push(trainLabel.id)
            }

            let locationId = localStorage.getItem('locationId')
            let cacheKey = locationId + materialNumbers.join('-') + today + tomorrow + true

            let params = '';

            this.workOrders = [];

            this.axios.get($http.apiBase + 'WorkOrders/getSbList2?locationId=' + locationId + '&arrivalDate=' + today + '&departureDate=' + tomorrow + params).then((response) => {
                this.workOrders = response.data;

                $loader.message = null

                for (let i = 0; i < this.workOrders.length; i++){
                    let current = this.workOrders[i];
                    if(current.tasks.length > 0){
                        for (let j = 0; j < current.tasks.length; j++){
                            let currentTask = current.tasks[j];
                            if(currentTask.leadTimeMinutes == null){
                                currentTask.leadTimeMinutes = currentTask.importedLeadTime
                            }
                        }
                    }
                }

                setTimeout(() => {
                    this.updateTasksInChart()
                    this.calculateMaxRowsPerChart()

                    this.onSelectedTaskIdsChange({
                        detail: {
                            selectedTaskIds: this.selectedTaskIds
                        }
                    })

                    for (let taskIndex in this.workOrders[0].tasks) {
                        let task = this.workOrders[0].tasks[taskIndex]
                        this.updateTaskInChart(this.workOrders[0].materialNumber, task, true)
                    }
                    setTimeout(() => {
                        this.onWorkOrderInitializeOnStart({
                            detail: {
                                id: this.workOrders[0].id
                            }
                        })
                    })


                    let trainScheduleMaterials = [];
                    for(let i = 0; i < this.trainSchedules.length; i++){
                        let materialNumber = this.trainSchedules[i].materialNumber;
                        trainScheduleMaterials.push(materialNumber);
                    }

                    trainScheduleMaterials = _.uniq(trainScheduleMaterials)

                    for(let i = 0; i < this.workOrders.length; i++){
                        let woMaterial = this.workOrders[i].materialNumber;
                        // console.log(woMaterial, trainScheduleMaterials.includes(woMaterial));
                        if(!trainScheduleMaterials.includes(woMaterial)){
                            this.workOrders.splice(i, 1)
                            // console.log(woMaterial);
                        }
                    }
                    document.dispatchEvent(new CustomEvent('chartForceUpdate'))
                    this.$forceUpdate()

                }, 1500)

                if (callback) {
                    callback()
                }
            })
        },

        /**
         * When the selected work order changes
         * @param {CustomEvent} eventArgs the event arguments
         */
        onSelectedWorkOrderChange (eventArgs) {
            this.preventPlaningWos(true);
            this.$nextTick(() => {
                this.selectedWorkOrder = eventArgs.detail.workOrder
                if(this.selectedWorkOrder){
                    this.selectedWorkOrder.isScheduled = false;
                }

                let materialNumberIndices = []
                let mechanicIndices = []
                if (this.selectedWorkOrder) {
                    let materialNumberIndex = this.findMaterialNumberIndex(this.selectedWorkOrder.materialNumber)
                    if (materialNumberIndex) {
                        materialNumberIndices.push(Number(materialNumberIndex))
                    }

                    for (let taskIndex in this.selectedWorkOrder.tasks) {
                        let workOrderTask = this.selectedWorkOrder.tasks[taskIndex]
                        mechanicIndices.push(Number(this.findMechanicIndexById(workOrderTask.mechanicId)))
                    }
                }
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.trains,
                        indices: materialNumberIndices
                    }
                }))
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: mechanicIndices
                    }
                }))

                setTimeout(() => {
                    this.preventPlaningWos(false);
                }, 1500)
            })
        },

        /**
         * When the workorder with the initialize on start property === true has been initialized
         * @param {CustomEvent} eventArgs the event arguments
         */
        onWorkOrderInitializeOnStart (eventArgs) {
            let workOrderElement = this.$el.querySelector('[data-work-order-id="work-order-' + eventArgs.detail.id + '"]')
            let workOrdersElement = this.$el.querySelector('.work-orders')
            if (!workOrderElement || !workOrdersElement) {
                return
            }
            workOrdersElement.scrollTop = workOrderElement.offsetTop - 15
        },

        /**
         * Open a service request
         * @param {number} serviceRequestId the service request id
         */
        openServiceRequest (serviceRequestId) {
            // this.workOrderFilter = 2
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]

                if (workOrder.serviceRequest && workOrder.serviceRequest.id === serviceRequestId) {
                    if (workOrder.mandatory === true) {
                        this.workOrderFilter = 0
                    }
                    else if (workOrder.isWatched === true) {
                        this.workOrderFilter = 1
                    }
                    else if (workOrder.mandatory === false && workOrder.isWatched === false) {
                        this.workOrderFilter = 2
                    }

                    this.initializeWorkOrderId = workOrder.id
                    this.selectedTaskIds = []
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        this.selectedTaskIds.push(task.id)
                    }
                    this.onSelectedTaskIdsChange({
                        detail: {
                            selectedTaskIds: this.selectedTaskIds
                        }
                    })
                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        this.updateTaskInChart(workOrder.materialNumber, task, true)
                    }
                    document.dispatchEvent(new CustomEvent('chartForceUpdate'))
                    this.$forceUpdate()
                    return
                }
            }
        },

        /**
         * Open a workorder
         * @param {number} workOrderId the workorder id
         */
        openWorkOrder (workOrderId) {
            setTimeout(() => {
                // this.workOrderFilter = 2
                for (let workOrderIndex in this.workOrders) {
                    let workOrder = this.workOrders[workOrderIndex]
                    if (workOrder.id === workOrderId) {
                        this.initializeWorkOrderId = workOrder.id
                        this.selectedTaskIds = []
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            this.selectedTaskIds.push(task.id)
                        }
                        document.dispatchEvent(new CustomEvent('workOrderOpen', {
                            detail: {
                                id: workOrder.id
                            }
                        }))
                        document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                            detail: {
                                id: workOrder.id
                            }
                        }))
                        this.onSelectedTaskIdsChange({
                            detail: {
                                selectedTaskIds: this.selectedTaskIds
                            }
                        })
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            this.updateTaskInChart(workOrder.materialNumber, task, true)
                        }
                        setTimeout(() => {
                            this.onWorkOrderInitializeOnStart({
                                detail: {
                                    id: workOrder.id
                                }
                            })
                        })
                        document.dispatchEvent(new CustomEvent('workOrderOpen'))
                        document.dispatchEvent(new CustomEvent('chartForceUpdate'))
                        this.$forceUpdate()
                        return
                    }
                }
            })
        },

        /**
         * Generate the offset hours in the charts
         */
        generateOffsetHours () {
            let startDate = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
            let firstArrivalDatePriorToStartDate = 0

            for (let trainScheduleIndex in this.trainSchedules) {
                let trainSchedule = this.trainSchedules[trainScheduleIndex]

                if (!trainSchedule.arrivalDate || !trainSchedule.departureDate || new Date(trainSchedule.departureDate).getTime() < startDate.getTime()) {
                    continue
                }

                let deltaHours = (startDate.getTime() - new Date(trainSchedule.arrivalDate).getTime()) / 1000 / 60 / 60
                if (deltaHours >= this.displayHours) {
                    this.offsetHours = Math.ceil(this.displayHours)
                    return
                }

                if (deltaHours > firstArrivalDatePriorToStartDate) {
                    firstArrivalDatePriorToStartDate = deltaHours
                }
            }
            this.offsetHours = Math.ceil(firstArrivalDatePriorToStartDate)
        },

        /**
         * Generate the list of material numbers based on the list of train schedules
         * Aterr
         */
        generateMaterialNumbers () {
            // console.log(this.trainSchedules);
            this.labels.trains = []
            for (let trainScheduleIndex in this.trainSchedules) {
                let trainSchedule = this.trainSchedules[trainScheduleIndex]
                if(trainSchedule.serviceWindow){


                    //Get difference beetween train arrival time and departure time
                    let trainArrival = new Date(trainSchedule.arrivalDate);
                    let trainDeparture = new Date(trainSchedule.departureDate);
                    //Train time length
                    let trainTimeDiff = Math.abs(trainDeparture.getTime() - trainArrival.getTime());
                    trainTimeDiff = new Date(trainTimeDiff).toISOString().slice(11, -1).split(":");

                    let trainHoursMinutes = trainTimeDiff[0] + ':' + trainTimeDiff[1];

                    //Get difference beetween serviceWindow arrival time and end time
                    let serviceWindowStart = new Date(trainSchedule.serviceWindow.serviceWindowStart);
                    let serviceWindowEnd = new Date(trainSchedule.serviceWindow.serviceWindowEnd);
                    //service window length
                    let serviceWindowTimeDiff = Math.abs(serviceWindowEnd.getTime() - serviceWindowStart.getTime());
                    serviceWindowTimeDiff = new Date(serviceWindowTimeDiff).toISOString().slice(11, -1).split(":");

                    let serviceWindowHoursMinutes = serviceWindowTimeDiff[0] + ':' + serviceWindowTimeDiff[1];

                    let trainSeconds = (+trainTimeDiff[0]) * 60 * 60 + (+trainTimeDiff[1]) * 60;
                    let serviceWindowSeconds = (+serviceWindowTimeDiff[0]) * 60 * 60 + (+serviceWindowTimeDiff[1]) * 60;
                    let serviceWindowMinutes = Math.floor(serviceWindowSeconds / 60);
                    let trainMinutes = Math.floor(trainSeconds / 60);

                    let diff = trainMinutes - serviceWindowMinutes

                    // console.log(diff);

                    let obj = {
                        id: trainSchedule.materialNumber,
                        value: trainSchedule.materialNumber
                    }


                    if (this.labels.trains.filter(a => a.id === trainSchedule.materialNumber).length === 0) {
                        let assets = this.assets.filter((v, i, a) => String(v.serialNumber) === String(trainSchedule.materialNumber))
                        let fleetControlStatus = null
                        let reasonMaintenance = null
                        if (assets.length > 0) {
                            let assetFleetControlStatus = (assets[0].fleetControlStatus || '').replace(' ', '').toLowerCase()
                            switch (assetFleetControlStatus) {
                                case 'nietinzetbaar':
                                    fleetControlStatus = 1
                                break
                                case 'onderbewaking':
                                    fleetControlStatus = 2
                                break
                                case 'inzetbaar':
                                    fleetControlStatus = 3
                                break
                            }
                            reasonMaintenance = assets[0].reasonMaintenance

                            obj.fleetControlStatus = fleetControlStatus;
                            obj.reasonMaintenance = String(assets[0].reasonMaintenance && Number(assets[0].maintenanceLocationObjectId) === Number(localStorage.getItem('locationId')) ? assets[0].reasonMaintenance : '').toUpperCase().trim(),
                            obj.assetId = (assets[0] || {id: null}).id
                        }
                    }

                    this.labels.trains.push(obj)
                }

            }
        },

        /**
         * When the user clicks on an overlay in a chart component
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChartClickOverlay (eventArgs) {
            if (['task', 'mechanic-task', 'equipment-task'].indexOf(eventArgs.detail.type) !== -1) {
                let taskId = eventArgs.detail.object.id
                let focus = this.selectedTaskIds.length !== 1 || this.selectedTaskIds.indexOf(taskId) === -1
                this.selectedTaskIds = focus ? [taskId] : []

                workOrderLoop: for (let workOrderIndex in this.workOrders) {
                    let workOrder = this.workOrders[workOrderIndex]

                    for (let taskIndex in workOrder.tasks) {
                        let task = workOrder.tasks[taskIndex]
                        if (task.id === taskId) {
                            document.dispatchEvent(new CustomEvent('workOrderClose'))
                            if (focus) {
                                if (workOrder.mandatory === true) {
                                    this.workOrderFilter = 0
                                }
                                else if (workOrder.isWatched === true) {
                                    this.workOrderFilter = 1
                                }
                                else if (workOrder.mandatory === false && workOrder.isWatched === false) {
                                    this.workOrderFilter = 2
                                }
                                document.dispatchEvent(new CustomEvent('workOrderOpen', {
                                    detail: {
                                        id: workOrder.id
                                    }
                                }))
                                document.dispatchEvent(new CustomEvent('workOrderInitializeOnStart', {
                                    detail: {
                                        id: workOrder.id
                                    }
                                }))
                            }
                            this.onSelectedTaskIdsChange({
                                detail: {
                                    selectedTaskIds: this.selectedTaskIds
                                }
                            })
                            this.updateTaskInChart(workOrder.materialNumber, task, true)
                            document.dispatchEvent(new CustomEvent('chartForceUpdate'))
                            this.$forceUpdate()
                            break workOrderLoop
                        }
                    }
                }
            }
        },

        /**
         * Whenever the task changes in a work order
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChangeWorkOrderTask (eventArgs) {
            // this.$emit('preventPlaning', true);
            this.preventPlaningWos(true);
            this.$nextTick(() => {
                let update = false
                let task = Object.assign({}, eventArgs.detail.task)
                let taskStartCoordinate = null

                // Remove the mechanic property, because it seems to overrule the task.mechanicId when sent to back-end
                task.mechanic = undefined

                // Skip when the workorder is not found in the list
                let workOrdersWithId = this.workOrders.filter(x => x.tasks.filter(x => x.id === task.id).length === 1)
                if (workOrdersWithId.length !== 1) {
                    return
                }

                // Collect all of the mechanic chart label indices to emphasize
                let filteredWorkOrders = this.workOrders.filter(x => x.tasks.filter(y => y.id === eventArgs.detail.task.id).length === 1)
                let mechanicIndices = []
                for (let workOrderIndex in filteredWorkOrders) {
                    for (let taskIndex in filteredWorkOrders[workOrderIndex].tasks) {
                        let workOrderTask = filteredWorkOrders[workOrderIndex].tasks[taskIndex]
                        mechanicIndices.push(Number(this.findMechanicIndexById(workOrderTask.mechanicId)))
                    }
                }

                // Emphasize the mechanics that are working on the
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        id: this.chartIds.mechanics,
                        indices: mechanicIndices
                    }
                }))

                // When the starttime of a task goes from null to a value:
                // set chart time to first found service window or to the current time if not found
                // set the tempWorkLocationId to the currently selected location (localstorage 'locationId')
                if (eventArgs.detail.wasNull) {
                    task.tempWorkLocationId = Number(localStorage.getItem('locationId') || 0)

                    let chartStartDate = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                    let firstServiceWindowCoordinate = 0
                    let serviceWindowFound = false

                    let materialNumberIndex = this.findMaterialNumberIndex(workOrdersWithId[0].materialNumber)
                    for (let overlayIndex in this.overlays.trains[materialNumberIndex].filter(x => x.type === 'service-window')) {
                        let overlay = this.overlays.trains[materialNumberIndex][overlayIndex]
                        let taskLength = task.leadTimeMinutes / 60
                        let serviceWindowLength = overlay.length - (overlay.shuntingTimeMinutes / 60 * 2) / 2
                        let serviceWindowLengthInPresent = overlay.start - overlay.shuntingTimeMinutes / 60 + overlay.length

                        if (serviceWindowLength >= taskLength && serviceWindowLengthInPresent >= taskLength) {
                            firstServiceWindowCoordinate = Math.max(overlay.start + overlay.shuntingTimeMinutes / 60, 0)
                            taskStartCoordinate = firstServiceWindowCoordinate
                            serviceWindowFound = true
                            break
                        }
                    }

                    if (!serviceWindowFound) {
                        let currentDate = new Date()
                        firstServiceWindowCoordinate = (currentDate.getTime() - chartStartDate.getTime()) / 1000 / 60 / 60
                        taskStartCoordinate = firstServiceWindowCoordinate
                    }
                    task.tempStart = new Date(chartStartDate.getTime() + 1000 * 60 * 60 * firstServiceWindowCoordinate).toJSON()

                    document.dispatchEvent(new CustomEvent('chartScrollToPosition', {
                        detail: {
                            x: Math.max(((new Date(task.tempStart).getTime() - chartStartDate.getTime()) / 1000 / 60 / 60) - (5 / 60) + this.offsetHours, 0)
                        }
                    }))

                    update = true
                }

                // When the starttime of a task goes to null from a value
                else if (!task.tempStart) {
                    task.tempWorkLocationId = null
                }

                // Update the task the task had a value and now is null in order to remove the task from chart when removing the starttime
                if (!task.tempStart && !eventArgs.detail.wasNull) {
                    update = true
                }

                // Set tempEnd variable
                if (task.tempStart) {
                    task.tempEnd = new Date(task.tempStart)
                    task.tempEnd.setTime(new Date(task.tempStart).getTime() + task.leadTimeMinutes * 60 * 1000)
                    task.tempEnd = task.tempEnd.toJSON()
                }

                // Keep track of the amount of rivisions for each task
                if (!task.revisionCount || isNaN(task.revisionCount)) {
                    task.revisionCount = 1
                }
                else {
                    task.revisionCount++
                }
                $cache.revisionCountByTaskId[task.id] = task.revisionCount

                // If the value of the starttime was null; update the starttime in the WorkOrder component's starttime Picker
                if (eventArgs.detail.wasNull) {
                    document.dispatchEvent(new CustomEvent('workOrderChangeStartTime', {
                        detail: {
                            id: workOrdersWithId[0].id,
                            workOrder: workOrdersWithId[0],
                            task
                        }
                    }))
                }

                // Update the task in the chart
                this.updateTaskInChart(workOrdersWithId[0].materialNumber, task, false)

                // Update the mechanics chart
                this.onChangeMechanics()

                // Update everything
                this.$forceUpdate()
                document.dispatchEvent(new CustomEvent('chartForceUpdate'))

				// Make the call to save the task
                $task.put(task)

                // Change the temp work location of workorder
                workOrdersWithId[0].tempWorkLocationId = Number(localStorage.getItem('locationId'))
                $workOrder.put(workOrdersWithId[0])
                setTimeout(() => {
                    this.preventPlaningWos(false);
                }, 1500)
            })
        },

        /**
         * When the list of equipment changes for the task
         */
        onWorkOrderTaskEquipmentChange (eventArgs) {
            this.updateAfterSocketUpdatePerTaskId[eventArgs.detail.task.id] = 'equipment'
            this.$nextTick(() => {
                let taskId = eventArgs.detail.task.id

                for (let addedEquipmentIdIndex in eventArgs.detail.addedEquipmentIds) {
                    let addedEquipmentId = eventArgs.detail.addedEquipmentIds[addedEquipmentIdIndex]
                    $taskEquipment.post({
                        equipmentId: addedEquipmentId,
                        taskId
                    })
                }

                for (let deletedEquipmentIdIndex in eventArgs.detail.deletedEquipmentIds) {
                    let deletedEquipmentId = eventArgs.detail.deletedEquipmentIds[deletedEquipmentIdIndex]

                    for (let taskEquipmentIndex = eventArgs.detail.task.equipments.length - 1; taskEquipmentIndex >= 0; taskEquipmentIndex--) {
                        let taskEquipment = eventArgs.detail.task.equipments[taskEquipmentIndex]

                        if (taskEquipment.equipment.id === deletedEquipmentId) {
                            $taskEquipment.delete(taskEquipment.id)
                        }
                    }
                }
            })
        },

        /**
         * Update all the tasks in the train chart
         */
        updateTasksInChart () {
            for (let rowIndex in this.overlays.trains) {
                this.overlays.trains[rowIndex] = this.overlays.trains[rowIndex].filter(x => x.type !== 'task')
            }

            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]
                let tasks = workOrder.tasks || []

                for (let taskIndex in tasks) {
                    this.updateTaskInChart(workOrder.materialNumber, tasks[taskIndex], false)
                }
            }
        },

        /**
         * Update a single task in the train chart
         * @param {string} materialNumber the material number
         * @param {object} task the task object
         * @param {boolean} emphasizeMaterialNumberInTrainChart emphasize the material number in the train chart
         */
        updateTaskInChart (materialNumber, task, emphasizeMaterialNumberInTrainChart) {
            // Remove all tasks from train chart
            for (let materialNumberIndex in this.overlays.trains) {
                let overlays = this.overlays.trains[materialNumberIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'task' && Number(overlay.id) === Number(task.id)) {
                        delete this.overlays.trains[materialNumberIndex][overlayIndex]
                    }
                }
            }

            // Remove all task impact from mechanic chart
            for (let mechanicIndex in this.overlays.mechanics) {
                let overlays = this.overlays.mechanics[mechanicIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'mechanic-task' && Number(overlay.id) === Number(task.id)) {
                        delete this.overlays.mechanics[mechanicIndex][overlayIndex]
                    }
                }
            }

            // Remove all task impact from equipment chart
            for (let equipmentIndex in this.overlays.equipment) {
                let overlays = this.overlays.equipment[equipmentIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'equipment-task' && Number(overlay.id) === Number(task.id)) {
                        delete this.overlays.equipment[equipmentIndex][overlayIndex]
                    }
                }
            }

            // Check if the material number exists in the data
            let materialNumberIndex = this.findMaterialNumberIndex(materialNumber)
            if (materialNumberIndex === -1) {
                return
            }

            if (this.overlays.trains[materialNumberIndex] === undefined) {
                this.overlays.trains[materialNumberIndex] = []
            }

            // Return:
            // If the task has no start time
            // If there is already an overlay with the task id
            if (!task.tempStart || this.findTaskInOverlays(task.id) !== null) {
                return
            }

            // Return if the xCoordinate is outside the charts boundaries
            let xCoordinate = this.convertDateToCoordinate(new Date(task.tempStart))
            let length = task.leadTimeMinutes / 60
            if (xCoordinate + length < -this.displayHours) {
                return
            }
            if (xCoordinate > this.displayHours) {
                return
            }

            // Add the task in the chart
            this.overlays.trains[materialNumberIndex].push({
                id: task.id,
                object: task,
                type: 'task',
                start: xCoordinate,
                length,
                margin: 15
            })

            // Update the impact of the task in the equipment/mechanic charts.
            this.updateTaskImpactInMechanicChart(task, xCoordinate)
            this.updateTaskImpactInEquipmentChart(task)

            // Emphasize the material number in train chart
            if (emphasizeMaterialNumberInTrainChart) {
                let materialNumberIndex = this.findMaterialNumberIndex(materialNumber)
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        indices: [materialNumberIndex],
                        id: this.chartIds.trains
                    }
                }))
            }
        },

        /**
         * Update the task impact in the chart of mechanics
         * @param {Object} task the task object
         * @param {number} xCoordinate the x-coordinate at which the task starts in the chart
         */
        updateTaskImpactInMechanicChart (task, xCoordinate) {
            let update = false
            // console.debug('update task impact in mechanic chart.')

            for (let rowIndex in this.overlays.mechanics) {
                let overlays = this.overlays.mechanics[rowIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'mechanic-task' && overlay.object.id === task.id) {
                        delete this.overlays.mechanics[rowIndex][overlayIndex]
                        update = true
                    }
                }
            }

            if (task.mechanicId === null) {
                if (update) {
                    this.$forceUpdate()
                    document.dispatchEvent(new CustomEvent('chartForceUpdate', {
                        detail: {
                            chartId: this.chartIds.mechanics
                        }
                    }))
                }
                return
            }

            for (let mechanicIndex in this.mechanics) {
                let mechanic = this.mechanics[mechanicIndex]
                if (mechanic.id === task.mechanicId) {
                    let mechanicRowIndex = this.findMechanicIndexById(mechanic.id)

                    if (mechanicRowIndex !== -1) {
                        this.overlays.mechanics[mechanicRowIndex].push({
                            id: task.id,
                            object: task,
                            type: 'mechanic-task',
                            start: xCoordinate,
                            length: Number(task.leadTimeMinutes || 0) / 60,
                            margin: 15
                        })
                    }
                    this.$forceUpdate()
                    document.dispatchEvent(new CustomEvent('chartForceUpdate', {
                        detail: {
                            chartId: this.chartIds.mechanics
                        }
                    }))
                    return
                }
            }
        },

        /**
         * Update the task impact in the chart of equipment
         * @param {Object} task the task object
         */
        updateTaskImpactInEquipmentChart (task, length) {
            // console.debug('update task impact in equipment chart')
            let shouldUpdate = false
            for (let rowIndex in this.overlays.equipment) {
                let overlays = this.overlays.equipment
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (['equipment-task', 'equipment'].indexOf(overlay.type) !== -1 && overlay.object.id === task.id) {
                        delete this.overlays.equipment[rowIndex][overlayIndex]
                        shouldUpdate = true
                    }
                }
            }

            for (let workOrderIndex in this.workOrders) {
                for (let taskIndex in this.workOrders[workOrderIndex].tasks) {
                    let workOrderTask = this.workOrders[workOrderIndex].tasks[taskIndex]
                    if (!workOrderTask.tempStart) {
                        continue
                    }
                    for (let taskEquipmentIndex in workOrderTask.equipments) {
                        let taskEquipment = workOrderTask.equipments[taskEquipmentIndex]
                        if (task.equipments.map(x => x.equipment.id).indexOf(taskEquipment.equipment.id) === -1) {
                            continue
                        }

                        let rowIndex = this.findEquipmentNameIndex(taskEquipment.equipment.id)
                        if (rowIndex === -1) {
                            continue
                        }

                        if (this.overlays.equipment[rowIndex].filter(x => x.type === 'equipment-task' && x.object.id === workOrderTask.id && x.equipment.id === taskEquipment.id).length !== 0) {
                            continue
                        }

                        this.overlays.equipment[rowIndex].push({
                            id: workOrderTask.id,
                            object: workOrderTask,
                            type: 'equipment-task',
                            start: (new Date(workOrderTask.tempStart).getTime() - $date.toDateObject(this.startDate.substring(0, 13) + ':00:00').getTime()) / 1000 / 60 / 60,
                            length: (workOrderTask.leadTimeMinutes || 0) / 60,
                            margin: 15,
                            equipment: taskEquipment.equipment
                        })

                        shouldUpdate = true
                    }
                }
            }

            if (shouldUpdate) {
                this.$forceUpdate()
                document.dispatchEvent(new CustomEvent('chartForceUpdate', {
                    detail: {
                        chartId: this.chartIds.equipment
                    }
                }))
            }
        },

        /**
         * Find the material number index in the labels
         * @param {string} materialNumber the material number
         */
        findMaterialNumberIndex (materialNumber) {
            for (let labelIndex in this.labels.trains) {
                let label = this.labels.trains[labelIndex]
                if (String(label.id) === String(materialNumber)) {
                    return labelIndex
                }
            }
            return -1
        },

        /**
         * Find the index for the mechanic name
         * @param {string} mechanicId the id of the mechanic
         */
        findMechanicIndexById (mechanicId) {
            for (let labelIndex in this.labels.mechanics) {
                let label = this.labels.mechanics[labelIndex]
                if (label.id === mechanicId) {
                    return labelIndex
                }
            }
            return -1
        },

        /**
         * Find the index for the equipment name
         * @param {string} id the id of the equipment
         */
        findEquipmentNameIndex (equipmentId) {
            for (let labelIndex in this.labels.equipment) {
                let label = this.labels.equipment[labelIndex]
                if (label.id === equipmentId) {
                    return labelIndex
                }
            }
            return -1
        },

        /**
         * Find a task in the train overlays
         * @param {number} taskId the task id
         */
        findTaskInOverlays (taskId) {
            for (let materialNumberIndex in this.overlays.trains) {
                let overlays = this.overlays.trains[materialNumberIndex]
                for (let overlayIndex in overlays) {
                    let overlay = overlays[overlayIndex]
                    if (overlay.type === 'task' && Number(overlay.id) === Number(taskId)) {
                        return overlay
                    }
                }
            }
            return null
        },

        /**
         * Updates the equipment chart for the selected task ids
         */
        updateEquipmentChartForSelectedTaskIds () {
            this.overlays.equipment = this.overlays.equipment.map(row => row.filter(overlay => overlay.type !== 'equipment'))
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]

                for (let workOrderTaskIndex in workOrder.tasks) {
                    let workOrderTask = workOrder.tasks[workOrderTaskIndex]

                    if (this.selectedTaskIds.indexOf(workOrderTask.id) !== -1) {
                        for (let taskEquipmentIndex in workOrderTask.equipments) {
                            let taskEquipment = workOrderTask.equipments[taskEquipmentIndex]
                            let rowIndex = this.findEquipmentNameIndex(taskEquipment.equipment.id)

                            if (rowIndex === -1) {
                                this.labels.equipment.push({id: taskEquipment.equipment.id, value: taskEquipment.equipment.name})
                                rowIndex = this.labels.equipment.length - 1
                            }

                            if (this.overlays.equipment[rowIndex] === undefined) {
                                this.overlays.equipment[rowIndex] = []
                            }

                            this.overlays.equipment[rowIndex].push({
                                id: workOrderTask.id,
                                object: workOrderTask,
                                type: 'equipment',
                                start: -24,
                                length: 48,
                                margin: 15
                            })
                        }
                    }
                }
            }
        },

        /**
         * When the selected task ids change
         * @param {CustomEvent} eventArgs the event arguments
         */
        onSelectedTaskIdsChange (eventArgs) {
            this.selectedTaskIds = eventArgs.detail.selectedTaskIds
            this.labels.equipment = []
            this.overlays.equipment = []
            let tasks = []

            this.updateEquipmentChartForSelectedTaskIds()

            for (let workOrderIndex in this.workOrders) {
                for (let taskIndex in this.workOrders[workOrderIndex].tasks) {
                    let task = this.workOrders[workOrderIndex].tasks[taskIndex]
                    if (this.selectedTaskIds.indexOf(task.id) === -1) {
                        continue
                    }
                    tasks.push(task)
                }
            }
            for (let taskIndex in tasks) {
                let task = tasks[taskIndex]
                this.updateTaskInChart(eventArgs.detail.materialNumber, task, true)
            }

            this.onChangeMechanics()
            this.calculateMaxRowsPerChart()
            this.$nextTick(() => {
                let indices = []
                if (this.selectedTaskIds.length > 0) {
                    for (let workOrderIndex in this.workOrders) {
                        let workOrder = this.workOrders[workOrderIndex]
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            if (this.selectedTaskIds.indexOf(task.id) !== -1) {
                                if (task.mechanicId) {
                                    indices.push(Number(this.findMechanicIndexById(task.mechanicId)))
                                }
                            }
                        }
                    }
                }
                document.dispatchEvent(new CustomEvent('chartEmphasizeRowIndicesChange', {
                    detail: {
                        indices,
                        id: this.chartIds.mechanics
                    }
                }))

                this.$forceUpdate()
                document.dispatchEvent(new CustomEvent('chartForceUpdate'))
            })
        },

        /**
         * Whenever the list of mechanics changes
         */
        onChangeMechanics () {
            // console.log(this.startDate);
            // this.labels.mechanics = []
            let totalMechanics = []

            if (this.selectedTaskIds.length === 0) {
                totalMechanics = []
                mechanicLoop: for (let mechanicIndex in this.mechanics) {
                    let mechanic = this.mechanics[mechanicIndex]
                    let mechanicSchedules = this.mechanicSchedules.filter(x => x.mechanicId === mechanic.id)
                    let mechanicShiftInChartTimeFrame = false
                    for (let mechanicScheduleIndex in mechanicSchedules) {
                        let mechanicSchedule = mechanicSchedules[mechanicScheduleIndex]
                        let shift = mechanicSchedule
                        let currentDateChart = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                        let endDateChart = new Date(currentDateChart.getTime() + 1 * this.displayHours * 60 * 60 * 1000)
                        if (
                            (
                                (   new Date(shift.startDate).getTime() < endDateChart.getTime()
                                    && new Date(shift.startDate).getTime() >= currentDateChart.getTime()
                                ) ||
                                (
                                    new Date(shift.endDate).getTime() < endDateChart.getTime()
                                    && new Date(shift.endDate).getTime() >= currentDateChart.getTime()
                                )
                            )
                            && shift.active === true) {
                            mechanicShiftInChartTimeFrame = true
                            break
                        }
                    }
                    if (!mechanicShiftInChartTimeFrame) {
                        continue mechanicLoop
                    }
                    totalMechanics.push(mechanic)
                }
            }
            else {
                for (let taskIdIndex in this.selectedTaskIds) {
                    let taskId = this.selectedTaskIds[taskIdIndex]
                    let workOrders = this.workOrders.filter(x => x.tasks.filter(y => y.id === taskId).length === 1)
                    for (let workOrderIndex in workOrders) {
                        let workOrder = workOrders[workOrderIndex]
                        for (let taskIndex in workOrder.tasks) {
                            let task = workOrder.tasks[taskIndex]
                            if (task.id !== taskId) {
                                continue
                            }
                            let mechanics = this.getQualifiedMechanicsForTask(task)
                            mechanicLoop: for (let mechanicIndex in mechanics) {
                                let mechanic = mechanics[mechanicIndex]
                                let mechanicSchedules = this.mechanicSchedules.filter(x => x.mechanicId === mechanic.id)
                                let mechanicShiftInChartTimeFrame = false
                                for (let mechanicScheduleIndex in mechanicSchedules) {
                                    let mechanicSchedule = mechanicSchedules[mechanicScheduleIndex]
                                    let shift = mechanicSchedule
                                    let currentDateChart = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                                    let endDateChart = new Date(currentDateChart.getTime() + 1 * this.displayHours * 60 * 60 * 1000)
                                    if (
                                        (
                                            (   new Date(shift.startDate).getTime() < endDateChart.getTime()
                                                && new Date(shift.startDate).getTime() >= currentDateChart.getTime()
                                            ) ||
                                            (
                                                new Date(shift.endDate).getTime() < endDateChart.getTime()
                                                && new Date(shift.endDate).getTime() >= currentDateChart.getTime()
                                            )
                                        )
                                        && shift.active === true) {
                                        mechanicShiftInChartTimeFrame = true
                                        break
                                    }
                                }
                                if (!mechanicShiftInChartTimeFrame) {
                                    continue mechanicLoop
                                }
                                totalMechanics.push(mechanic)
                            }
                        }
                    }
                }
            }
            for (let mechanicId in totalMechanics) {
                let mechanic = totalMechanics[mechanicId]
                this.labels.mechanics.push({
                    id: mechanic.id,
                    value: mechanic.name
                })
            }

            // Update mechanic chart (19sep)
            // this.clearMechanicChart()
            // this.updateShiftOverlaysInMechanicChart()
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]
                for (let taskIndex in workOrder.tasks) {
                    let task = workOrder.tasks[taskIndex]
                    if (this.selectedTaskIds.length === 0 || this.selectedTaskIds.indexOf(task.id) !== -1 || totalMechanics.filter(x => x.id === task.mechanicId).length !== 0) {
                        this.updateTaskInChart(workOrder.materialNumber, task, false)
                    }
                }
            }
        },

        /**
         * Clear the mechanic chart
         */
        clearMechanicChart () {
            this.overlays.mechanics = []
        },

        /**
         * Update the shift overlays in the mechanic chart
         */
        updateShiftOverlaysInMechanicChart () {
            // Clear all shifts
            this.overlays.mechanics = this.overlays.mechanics.map(row => row.filter(overlay => overlay.type !== 'shift'))

            // Fill all shifts
            for (let mechanicScheduleIndex in this.mechanicSchedules) {
                let mechanicSchedule = this.mechanicSchedules[mechanicScheduleIndex]
                let shift = mechanicSchedule
                let start = this.convertDateToCoordinate(new Date(shift.startDate))
                let length = this.convertDateToCoordinate(new Date(shift.endDate)) - start
                let rowIndex = this.findMechanicIndexById(mechanicSchedule.mechanic.id)

                if (rowIndex === -1) {
                    continue
                }

                if (this.overlays.mechanics[rowIndex] === undefined) {
                    this.overlays.mechanics[rowIndex] = []
                }

                if (start >= this.displayHours) {
                    continue
                }

                if (start + length < -this.offsetHours) {
                    continue
                }

                if (mechanicSchedule.active !== true) {
                    continue
                }

                this.overlays.mechanics[rowIndex].push({
                    type: 'shift',
                    start,
                    length,
                    object: mechanicSchedule,
                    margin: 15
                })
            }
        },

        /**
         * When the list of train schedules has updated
         */
        onChangeTrainSchedules () {
            this.generateMaterialNumbers();
            let shuntingTimeMinutes = 0;

            if(this.currentLocationData.shuntingTime !== null){
                let shuntingTimeMinutes = this.currentLocationData.shuntingTime
            }

            for (let trainScheduleIndex in this.trainSchedules) {
                let trainSchedule = this.trainSchedules[trainScheduleIndex]
                let materialNumberIndex = this.findMaterialNumberIndex(trainSchedule.materialNumber)
                if (materialNumberIndex === -1) {
                    continue
                }

                if (this.overlays.trains[materialNumberIndex] === undefined) {
                    this.overlays.trains[materialNumberIndex] = []
                }

				if (trainSchedule.serviceWindow === undefined) {
				/**	let shuntingTimeMinutes = 0
				*	let netStartCoordinate = this.convertDateToCoordinate(new Date(trainSchedule.arrivalDate))
				*	let netEndCoordinate = this.convertDateToCoordinate(new Date(trainSchedule.departureDate))
				*/
					continue
				}

				let shuntingTimeMinutes = ((new Date(trainSchedule.serviceWindow.serviceWindowStart)).getTime() - (new Date(trainSchedule.arrivalDate)).getTime()) / 1000 / 60
				let xCoordinate = this.convertDateToCoordinate(new Date(trainSchedule.serviceWindow.serviceWindowStart))
				let length = this.convertDateToCoordinate(new Date(trainSchedule.serviceWindow.serviceWindowEnd)) - xCoordinate
				let netStartCoordinate = xCoordinate - shuntingTimeMinutes / 60
				let netEndCoordinate = length + xCoordinate + shuntingTimeMinutes / 60
				// console.log(length);

                if (netEndCoordinate < -24) {
                    continue
                }

                if (netStartCoordinate > 24) {
                    continue
                }

                if(length * 60 >= this.currentLocationData.minOverstandMinutes){
                    this.overlays.trains[materialNumberIndex].push({
                        type: 'service-window',
                        start: netStartCoordinate,
                        length: netEndCoordinate - netStartCoordinate,
                        object: trainSchedule.serviceWindow,
                        materialNumber: trainSchedule.materialNumber,
                        margin: 15,
                        shuntingTimeMinutes
                    })

                }
            }
            this.generateOffsetHours();
            // console.log(this.overlays.trains.length);
            this.removeLabels();
        },
        removeLabels(){
            this.overlays.trains =  _.reject(this.overlays.trains, _.isEmpty);

            let allowedMaterials = [];
            for(let i = 0; i < this.overlays.trains.length; i++){
                for(let s = 0; s < this.overlays.trains[i].length; s++){
                    let materialNumber = this.overlays.trains[i][s].materialNumber;
                    allowedMaterials.push(materialNumber);
                }
            }

            let temp = [];
            for(let j = 0; j < this.labels.trains.length; j++){
                let materialNumber = this.labels.trains[j].id;

                if(allowedMaterials.includes(materialNumber)){
                    temp.push(this.labels.trains[j]);
                }
            }

            this.labels.trains = temp;
        },
        /**
         * Whenever the selected label id changes in the chart
         * @param {CustomEvent} eventArgs the event arguments
         */
        onChartSelectLabel (eventArgs) {
            this.$nextTick(() => {
                if (eventArgs.detail.context === 'material-number') {
                    switch (eventArgs.detail.chartId) {
                        case this.chartIds.trains:
                            this.selectedMaterialNumber = eventArgs.detail.id
                        break
                        case this.chartIds.mechanics:
                            this.selectedMechanicId = eventArgs.detail.id
                        break
                    }
                }
                else if (eventArgs.detail.context === 'reason-maintenance') {
                    let reasonMaintenance = null
                    let reasonMaintenanceAsset = null
                    for (let assetIndex in this.assets) {
                        let asset = this.assets[assetIndex]
                        if (String(asset.serialNumber) === String(eventArgs.detail.id)) {
                            reasonMaintenance = asset.reasonMaintenance
                            reasonMaintenanceAsset = asset
                            break
                        }
                    }

                    this.reasonMaintenanceModal = {
                        ...this.reasonMaintenanceModal,
                        enabled: true,
                        materialNumber: eventArgs.detail.id,
                        reasonMaintenance,
                        asset: reasonMaintenanceAsset
                    }
                }
            })
        },

        /**
         * Whenever the offset hours changes in the charts
         */
        onChangeOffsetHours () {
            this.$forceUpdate()
            this.$nextTick(() => {
                document.dispatchEvent(new CustomEvent('chartRegenerateHours', {
                    detail: {
                        x: this.offsetHours,
                        y: 0
                    }
                }))
            })
        },

        /**
         * Whenever the displayed amount of hours has changed
         */
        changeDisplayHours (displayHours) {
            this.displayHours = displayHours
            this.onChangeMechanics()
            document.dispatchEvent(new CustomEvent('chartForceUpdate'))
            this.generateOffsetHours()
        },

        /**
         * Process all of the necessary CSS attributes for the elements in this component
         */
        processStyleForElements () {
            this.hideScrollBar()
            this.setWorkOrdersMaxHeight()
            this.setRightSectionHeight()
            this.calculateMaxRowsPerChart()
        },

        /**
         * Hides the scrollbar for the work order list
         */
        hideScrollBar () {
            let scrollBarWidth = this.calculateScrollBarWidth()
            let scrollBarHideElement = this.$el.querySelector('.scrollbar-hide')
            scrollBarHideElement.style.width = scrollBarWidth + 'px'
            scrollBarHideElement.style.marginLeft = 620 - scrollBarWidth + 'px'
        },

        /**
         * Sets the max height for the list of work orders
         */
        setWorkOrdersMaxHeight () {
            let windowHeight = window.innerHeight
            let navigationHeight = document.querySelector('#navigation').offsetHeight
            let bottomHeight = 125
            let verticalPaddingAndMargin = 135

            this.$el.querySelector('.work-orders').style.maxHeight = (windowHeight - navigationHeight - verticalPaddingAndMargin - bottomHeight) + 'px'
        },

        /**
         * Set the min height for the right section of the page
         */
        setRightSectionHeight () {
            let windowHeight = window.innerHeight
            let navigationHeight = document.querySelector('#navigation').offsetHeight

            this.$el.querySelector('.right').style.minHeight = (windowHeight - navigationHeight)
            this.$el.querySelector('.right').style.maxHeight = (windowHeight - navigationHeight)
        },

        /**
         * Calculates the maximum amount of rows renderable per chart based on the screen resolution
         */
        calculateMaxRowsPerChart () {
            let equipmentChartVisible = this.isEquipmentChartVisible()
            let rowRatio = equipmentChartVisible ? {
                trains: 2,
                mechanics: 1,
                equipment: 1
            } : {
                trains: 2,
                mechanics: 1,
                equipment: 0
            }
            let chartMargins = (equipmentChartVisible ? 3 : 2) * 30 + // padding-top on all charts
                (equipmentChartVisible ? 3 : 2) * 30 + // padding-bottom on all charts
                2 * 15 + // the margins inbetween the charts in this component
                40 + 20 // the height taken by the time labels in the first chart
            let filterButtonsHeight = 100
            let pageContentPaddingBottom = 10
            let navigationHeight = document.querySelector('#navigation').offsetHeight
            let bottomBarHeight = 125
            let cellHeight = 50
            let availableHeight = window.innerHeight - chartMargins - filterButtonsHeight - pageContentPaddingBottom - navigationHeight - bottomBarHeight
            let rowsAvailable = (availableHeight / cellHeight)
            let rowsPerRatio = rowRatio.trains + rowRatio.mechanics + rowRatio.equipment
            let ratiosAvailable = Math.floor(rowsAvailable / rowsPerRatio)

            this.maxRows = {
                trains: rowRatio.trains * ratiosAvailable,
                mechanics: rowRatio.mechanics * ratiosAvailable,
                equipment: rowRatio.equipment * ratiosAvailable
            }
            rowsAvailable -= ratiosAvailable * rowsPerRatio

            // check if each chart has atleast two rows (or the length of the labels applicable if it is less than 2)
            for (let index in rowRatio) {
                let chartMaxRows = this.maxRows[index]
                if (rowRatio[index] === 0) {
                    continue
                }
                if (chartMaxRows < Math.min(2, this.labels[index].length)) {
                    this.maxRows[index] = Math.min(2, this.labels[index].length)
                }
            }

            // check if the amount of labels is not lower than the max. amount of rows
            for (let index in rowRatio) {
                let chartMaxRows = this.maxRows[index]
                if (rowRatio[index] === 0) {
                    continue
                }
                if (chartMaxRows > this.labels[index].length) {
                    let delta = this.labels[index].length - chartMaxRows
                    chartMaxRows -= delta
                    rowsAvailable += delta
                }
            }

            // if theres too many rows visualized reduce them from the first chart
            let totalAmountOfRows = this.maxRows.trains + this.maxRows.mechanics + this.maxRows.equipment
            let delta = Math.floor(availableHeight / cellHeight) - totalAmountOfRows
            if (delta < 0) {
                this.maxRows.trains += delta
            }

            // add the remaining rows to charts with left over labels
            rowsAvailable = Math.floor(availableHeight / cellHeight) - (this.maxRows.trains + this.maxRows.mechanics + this.maxRows.equipment)
            while (rowsAvailable > 0 && this.labels.trains.length + this.labels.mechanics.length + this.labels.equipment.length !== this.maxRows.trains + this.maxRows.mechanics + this.maxRows.equipment) {
                let success = false
                for (let index in rowRatio) {
                    let chartMaxRows = this.maxRows[index]
                    if (chartMaxRows >= this.labels[index].length) {
                        continue
                    }

                    if (rowsAvailable >= 1 && this.maxRows[index] < this.labels[index].length && rowRatio[index] !== 0) {
                        this.maxRows[index]++
                        rowsAvailable--
                        success = true
                    }
                }
                if (!success) {
                    break
                }
            }

            // check if there are no decimals in the count of max rows
            for (let index in rowRatio) {
                let chartMaxRows = this.maxRows[index]
                if (Math.round(chartMaxRows) !== chartMaxRows) {
                    this.maxRows[index] = Math.round(this.maxRows[index])
                }
            }
        },

        /**
         * Checks if a work order is selected based on its material number or selected task
         * @param {object} workOrder the work order
         */
        isWorkOrderSelected (workOrder) {
            if (String(workOrder.materialNumber) === String(this.labels.trains[this.selectedMaterialNumber])) {
                return true
            }
            return false
        },

        /**
         * Converts a time to a coordinate in the chart component
         * @param {Date} date the date
         */
        convertDateToCoordinate (date) {
            return (date.getTime() - $date.toDateObject(this.startDate.substring(0, 13) + ':00:00').getTime()) / 1000 / 60 / 60
        },

        /**
         * Select a task id
         * @param {number} taskId the task id
         */
        selectTaskId (taskId) {
            if (this.selectedTaskIds.indexOf(taskId) === -1) {
                this.selectedTaskIds.push(taskId)
            }
            else {
                this.selectedTaskIds.splice(this.selectedTaskIds.indexOf(taskId), 1)
            }
            this.onSelectedTaskIdsChange({
                detail: {
                    selectedTaskIds: this.selectedTaskIds
                }
            })
            document.dispatchEvent(new CustomEvent('chartForceUpdate'))
        },

        /**
         * Checks if the equipment chart should be visible
         */
        isEquipmentChartVisible () {
            return this.selectedTaskIds.length > 0
        },

        /**
         * TODO: wait until eugene changes endpoint to not contain a list of workorders
         * Confirms the plan and sends it to Maximo
         */
        confirmPlan () {
            let workOrderIds = []
            for (let workOrderIndex in this.workOrders) {
                let workOrder = this.workOrders[workOrderIndex]
                let allTasksSentToMaximo = workOrder.tasks.filter(x => x.isSentToMaximo === false).length === 0

                if (!allTasksSentToMaximo) {
                    workOrderIds.push(workOrder.id)
                }
            }
            if (this.displayConflictsModal !== true) {
                let conflictIds = []
                for (let workOrderIndex in this.workOrders.filter(x => workOrderIds.indexOf(x.id) !== -1)) {
                    let workOrder = this.workOrders[workOrderIndex]
                    if (workOrder.tasks.filter(x => x.tempStart !== null && x.isSentToMaximo !== true && (x.conflictServiceWindow === true || x.conflictMechanic === true)).length !== 0) {
                        conflictIds.push(workOrder.id)
                    }
                }

                this.amountOfConflicts = conflictIds.length
                if (this.amountOfConflicts > 0) {
                    this.displayConflictsModal = true
                    return
                }
            }
            if (workOrderIds.length > 0) {
                this.displayConflictsModal = false
                $loader.message = 'Plan bevestigen'
                $workOrder.planSelection(workOrderIds, Number(localStorage.getItem('locationId'))).then(response => {
                    $loader.message = null
                    $snackbar.add('Selectie ingepland.')
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }).catch(response => {
                    $snackbar.addWarning('Er is een fout opgetreden in de server, probeert u het later nogmaals.')
                    $loader.message = null
                    this.updateData()
                })
            }
        },

        /**
         * Calculate the width of a scrollbar in the application
         */
        calculateScrollBarWidth () {
            var scrollDiv = document.createElement('div')
            scrollDiv.style.width = '100px'
            scrollDiv.style.height = '100px'
            scrollDiv.style.overflow = 'scroll'
            scrollDiv.style.position = 'absolute'
            scrollDiv.style.top = '-9999px'
            document.body.appendChild(scrollDiv)
            var scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
            document.body.removeChild(scrollDiv)
            return scrollBarWidth
        },

        /**
         * Get the qualified mechanics for a task
         * @param {Object} task the task
         */
        getQualifiedMechanicsForTask (task) {
            try{
                let filteredMechanics = []
                mechanicLoop: for (let mechanicIndex in this.mechanics) {
                    let mechanic = this.mechanics[mechanicIndex]
                    let mechanicSchedules = this.mechanicSchedules.filter(x => x.mechanicId === mechanic.id)
                    let mechanicShiftInChartTimeFrame = false
                    for (let mechanicScheduleIndex in mechanicSchedules) {
                        let mechanicSchedule = mechanicSchedules[mechanicScheduleIndex]
                        let shift = mechanicSchedule
                        let currentDateChart = $date.toDateObject(this.startDate.substring(0, 13) + ':00:00')
                        let endDateChart = new Date(currentDateChart.getTime() + 1 * 24 * 60 * 60 * 1000)
                        if (
                            (
                                (   new Date(shift.startDate).getTime() < endDateChart.getTime()
                                    && new Date(shift.startDate).getTime() >= currentDateChart.getTime()
                                ) ||
                                (
                                    new Date(shift.endDate).getTime() < endDateChart.getTime()
                                    && new Date(shift.endDate).getTime() >= currentDateChart.getTime()
                                )
                            )
                            && shift.active === true) {
                            mechanicShiftInChartTimeFrame = true
                            break
                        }
                    }
                    if (!mechanicShiftInChartTimeFrame) {
                        continue mechanicLoop
                    }
                    filteredMechanics.push(mechanic)
                }

                let qualifiedMechanics = []
                mechanicLoop: for (let mechanicIndex in filteredMechanics) {
                    let mechanic = filteredMechanics[mechanicIndex]

                    if (task.tempStart && task.tempEnd) {
                        let mechanicSchedules = this.mechanicSchedules.filter(x => x.mechanicId === mechanic.id)
                        let mechanicAvailableForTask = false
                        for (let mechanicScheduleIndex in mechanicSchedules) {
                            let mechanicSchedule = mechanicSchedules[mechanicScheduleIndex]
                            let shift = mechanicSchedule
                            if (new Date(shift.startDate).getTime() <= new Date(task.tempStart).getTime()
                                && new Date(shift.endDate).getTime() >= new Date(task.tempEnd).getTime()
                                && shift.active) {
                                mechanicAvailableForTask = true
                                break
                            }
                        }
                        if (!mechanicAvailableForTask) {
                            continue mechanicLoop
                        }
                    }
                    if (!task.qualifications || task.qualifications.length === 0) {
                        qualifiedMechanics.push(mechanic);
                        continue mechanicLoop
                    }

                    let taskQualificationExternalIds = task.qualifications.map(x => x.qualification.externalId).filter((v, i, a) => a.indexOf(v) === i)
                    let mechanicQualificationExternalIds = mechanic.qualifications.map(x => x.qualification.externalId).filter((v, i, a) => a.indexOf(v) === i)
                    for (let taskQualificationIndex in taskQualificationExternalIds) {
                        let taskQualificationExternalId = taskQualificationExternalIds[taskQualificationIndex]
                        if (mechanicQualificationExternalIds.indexOf(taskQualificationExternalId) === -1) {
                            continue mechanicLoop
                        }
                    }

                    qualifiedMechanics.push(mechanic)
                }
                return qualifiedMechanics
            } catch(err){
                //
            }

        },

        /**
         * Save the reason of maintenance for an asset
         */
        saveReasonMaintenance () {
            if (!this.reasonMaintenanceModal.reasonMaintenance) {
                $snackbar.addWarning('Gelieve een reden op te geven.')
                return
            }
            if (!this.reasonMaintenanceModal.asset) {
                $snackbar.addWarning('Het asset kon niet worden gevonden.')
                return
            }
            $loader.message = 'Asset aanpassen'
            $asset.saveReasonMaintenance({
                ...this.reasonMaintenanceModal.asset,
                reasonMaintenance: this.reasonMaintenanceModal.reasonMaintenance
            }).then(response => {
                $loader.message = null
                $snackbar.add('Het asset is aangepast.')
                this.reasonMaintenanceModal.enabled = false
                for (let labelIndex in this.labels.trains) {
                    let label = this.labels.trains[labelIndex]
                    if (String(label.id) === String(this.reasonMaintenanceModal.asset.serialNumber)) {
                        label.reasonMaintenance = this.reasonMaintenanceModal.reasonMaintenance
                        document.dispatchEvent(new CustomEvent('chartForceUpdate', {
                            detail: {
                                chartId: this.chartIds.trains
                            }
                        }))
                        break
                    }
                }
            }).catch(response => {
                $loader.message = null
                $loader.error = true;
                $snackbar.addWarning('Er is een probleem opgetreden bij het aanpassen van het asset, probeer het later opnieuw.')
            })
        }
    }
}
</script>
