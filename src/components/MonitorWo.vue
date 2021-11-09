<template>
    <div class="item" :class="{'active': active == data.id}">
        <div class="header" @click="toggleActive();">
            <ul>
                <li title="Stel/stam nummer">
                    <icon name="trein" size="30"/>
                    <span>{{data.inRollingStock}}</span>
                </li>

                <li :title="data.description">
                    {{data.description}}
                </li>
                <li title="Opleveringsdatum" v-if="type == 'mbn-monitor-unassigned'">
                    <icon name="kalender" size="30"/>
                    <span>{{ monthDateTimeFormat(data.dueDate) }}</span>
                </li>
                <li title="Aankomstdatum" v-else>
                    <icon name="kalender" size="30"/>
                    <span>{{ monthDateTimeFormat(data.arrivalDate) }}</span>
                </li>
            </ul>
            <ul>
                <li
                    v-if="type === 'mbn-monitor-assigned' && data.serviceRequestWarning"
                    title="Trein is op locatie maar werkorder is nog niet goedgekeurd">
                    <icon name="alert" size="33" color="#FF7800"/>
                </li>
                <li
                    v-if="type === 'mbn-monitor-assigned' && data.isScheduled && !data.serviceRequestWarning && data.status !== 'INUITV'"
                    title="Werkorder is goedgekeurd">
                    <icon name="vinkje" size="33" color="#0b9126" />
                </li>
                <li
                    v-if="type === 'mbn-monitor-assigned' && !data.serviceRequestWarning && data.status == 'INUITV'"
                    title="Werkorder in uitvoering">
                    <icon name="vinkje2" size="33" color="#0b9126" />
                </li>
                <li
                    v-if="type === 'mbn-monitor-declined'">
                    <icon name="plus" size="33" color="#DC0000" />
                </li>
                <li
                    v-if="data.notCompletedWarning"
                    title="Trein vertrekt binnen 60 minuten maar de werkorder is nog niet gereed">
                    <icon name="alert" size="33" color="#DC0000"/>
                </li>
                <li @click.stop="toggleBRegeling()"
                    v-if="checkStatusAndBool(data.bRegeling)"
                    title="Let op: er is een B-regeling van toepassing">
                    <icon name="alert_BR" color="#DC0000" size="33"/>
                </li>
                <li class="toggle">
                    <icon name="chevron-neerwaarts" size="35" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
                </li>
            </ul>
        </div>
        <div class="body" v-if="active == data.id">
            <div class="reason-declined" v-if="type === 'mbn-monitor-declined'">
                <div class="reason-decline-container" v-if="data.serviceRequest && data.serviceRequest.declinedReason">
                    <div class="reason-decline">
                        <div class="title">
                            Toelichting geweigerd:
                        </div>
                        <div class="decline-content">
                            {{
                                data.serviceRequest && data.serviceRequest.declinedReason
                                ?
                                (
                                    declineReasonsServiceRequest.filter(x => x.id === data.serviceRequest.declinedReason).length > 0
                                    ? declineReasonsServiceRequest.filter(x => x.id === data.serviceRequest.declinedReason)[0].name
                                    : 'N/A'
                                )
                                :
                                'N/A'
                            }}
                            <md-tooltip md-direction="right" style="margin-top: -10px">
                                {{
                                    data.serviceRequest && data.serviceRequest.declinedReason
                                    ?
                                    (
                                        declineReasonsServiceRequest.filter(x => x.id === data.serviceRequest.declinedReason).length > 0
                                        ? declineReasonsServiceRequest.filter(x => x.id === data.serviceRequest.declinedReason)[0].name
                                        : 'N/A'
                                    )
                                    :
                                    'N/A'
                                }}
                            </md-tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div class="extra-info">
                <ul>
                    <li class="border url" @click="openWorkOrderInMaximo()" title="Taaknummer">
                        {{data.WO}}
                    </li>
                    <li class="border" title="Taakstatus">
                        {{data.status}}
                    </li>
                    <li class="clear description">
                        {{data.description}}
                    </li>
                </ul>
            </div>
            <ul class="fields">
                <li>
                    <icon name="lokatie_W" color="#0079D3" size="35"/>
                    <span>{{getLocationById(data.tempWorkLocationId)}}</span>
                </li>
                <li>
                    <icon name="lokatie_R" color="#0079D3" size="35"/>
                    <span>{{getLocationById(data.tempRepairLocationId)}}</span>
                </li>
                <li>
                    <icon name="kalender" color="#0079D3" size="35"/>
                    <span>{{getDate(data.arrivalDate)}}</span>
                </li>
                <template v-if="type === 'mbn-monitor-assigned'">
                    <li>
                        <icon name="ankomst" color="#0079D3" size="35"/>
                        <span>{{getTrainscheduleArrivalDate(data.arrivalDate, data.trainSchedule)}}</span>
                    </li>
                    <li>
                        <icon name="vertrek" color="#0079D3" size="35"/>
                        <span>{{getTrainscheduleDepartureDate(data.arrivalDate, data.trainSchedule)}}</span>
                    </li>
                </template>
                <li>
                    <icon name="klok" color="#0079D3" size="35"/>
                    <span>{{data.totalLeadTimeMinutes}} minuten</span>
                </li>
                <li>
                    <icon name="lokatie" color="#0079D3" size="35"/>
                    <span>{{getMaintanceLocationName(data.asset.maintenanceLocation)}}</span>
                </li>
            </ul>
            <ul class="actions left">
                <li @click="openQualificationsModal()" title="Kwalificaties">
                    <icon name="kwalificatie" color="#0079D3" size="35"/>
                </li>

                <li @click="openEquipmentModal()" title="Outillage">
                    <icon name="ladder" color="#0079D3" size="35"/>
                </li>

                <li @click="openLocationTypeModal()" title="Klus Type">
                    <icon name="wrench" color="#0079D3" size="35"/>
                </li>
                <li @click="openLeadTimeMinutesModal()" title="Doorlooptijd taak">
                    <icon name="klok" color="#0079D3" size="35"/>
                </li>
            </ul>
            <ul class="actions right">
                <template v-if="type !== 'mbn-monitor-unassigned'">
                    <li @click="planAndRevert()" class="button blue">
                        Herplannen
                    </li>

                    <li @click="revertServiceRequest()" class="button red">
                        Terugzetten
                    </li>
                </template>
            </ul>
        </div>
    </div>
</template>

<script>
    import $date from '@/modules/date-module'
	import env from '@/env'
    import _ from 'lodash';

    export default {
        props: ['type', 'locations', 'assetStatuses', 'data', 'reasonMaintenanceList', 'canEditEquipment', 'active', 'warningsOnly', 'declineReasonsServiceRequest'],

        data: function () {
            return {
                activeId: null,
                todayDate: this.$moment(),
                assetWorkOrders: null
            }
        },

        mounted: function () {
            this.$moment.tz.setDefault(this.$moment.tz.guess());
        },

        methods: {
            getTrainscheduleArrivalDate(arrivalDate, trainSchedules){
                let res = '';
                for(let i in trainSchedules){
                    let trainSchedule = trainSchedules[i];
                    if(this.$moment(trainSchedule.departureDate) > this.$moment(arrivalDate)){
                        res = this.$moment(trainSchedule.arrivalDate).format('DD MMM YYYY HH:mm');
                        break;
                    }
                }

                return res;
            },
            getTrainscheduleDepartureDate(arrivalDate, trainSchedules){
                let res = '';
                for(let i in trainSchedules){
                    let trainSchedule = trainSchedules[i];
                    if(this.$moment(trainSchedule.departureDate) > this.$moment(arrivalDate)){
                        res = this.$moment(trainSchedule.departureDate).format('DD MMM YYYY HH:mm');
                        break;
                    }
                }

                return res;
            },
            planAndRevert(){
                this.planServiceRequest();
                this.revertServiceRequest();
            },
            revertServiceRequest () {
                if(this.data.bRegeling){
                    this.data.bRegeling = false;
                }

                let obj = {
                    detail: {
                        workOrder: this.data
                    }
                }
                this.$emit('revertServiceRequest', obj);
            },
            planServiceRequest(){
                setTimeout(() => {
                    this.$router.push({
                        name: 'ServiceRequestsMBN',
                        params: {
                            serviceRequestId: this.data.serviceRequest.id
                        }
                    })
                }, 1000)
            },
            openLeadTimeMinutesModal(){
                let obj = {
                    type: this.type,
                    data: this.data
                }
                this.$emit('openLeadTimeMinutesModal', obj);
            },
            openLocationTypeModal(){
                let obj = {
                    type: this.type,
                    data: this.data
                }
                this.$emit('openLocationTypeModal', obj);
            },
            openEquipmentModal(){
                let obj = {
                    type: this.type,
                    data: this.data
                }
                this.$emit('openEquipmentModal', obj);
            },
            openQualificationsModal(){
                let obj = {
                    type: this.type,
                    data: this.data
                }
                this.$emit('openQualificationsModal', obj);
            },
            getDate(date){
                return this.$moment(date).format('DD MMM YYYY HH:mm')
            },
            getLocationById(id){
                let locationName = _.find(this.locations, {id: id});
                if(locationName){
                    return locationName.name;
                } else {
                    return '';
                }
            },
            openWorkOrderInMaximo () {
                window.open(env.maximoURL + this.data.WO, '_blank')
            },
            toggleActive(){
                let obj = {
                    type: this.type,
                    id: this.data.id
                }
                this.$emit('toggleActive', obj);
            },
            getMaintanceLocationName(maintenanceLocation){
                let result;
                if(maintenanceLocation == 'MAT'){
                    result = 'MAT';
                } else if (maintenanceLocation == 'TRANS') {
                    result = 'TRANS';
                } else {
                    for(let i = 0; i < this.locations.length; i++){
                        if(this.locations[i].id){
                            if(parseInt(maintenanceLocation) == this.locations[i].locationNumber){
                                result = this.locations[i].name;

                                break;
                            }
                        }
                    }
                }
                return result;
            },
            openAssetWorkOrderInMaximo(wo){
                window.open(env.maximoURL + wo, '_blank')
            },
            toggleBRegeling () {
                if (this.type !== 'service-request-mbn') {
                    return
                }

                this.data.bRegeling = !this.data.bRegeling;
                let data = Object.assign({}, this.data)

                let NTKENMERK1 = this.data.NTKENMERK1 || ''
                if (this.data.bRegeling === true && NTKENMERK1.indexOf('B') === -1) {
                    NTKENMERK1 += 'B'
                }
                else if (this.data.bRegeling === false && NTKENMERK1.indexOf('B') !== -1) {
                    NTKENMERK1 = NTKENMERK1.replace('B', '')
                }

                this.data.NTKENMERK1 = NTKENMERK1
            },
            monthDateTimeFormat(date){
                if(date == null){
                    return 'Onbekend' //Nog onbekend
                } else {
                    return $date.getDateDayMonthTimeNumbers(new Date(date))
                }
            },
            checkStatusAndBool(bool){
                if(bool){
                    if(this.data.status == 'GGK' || this.data.status == 'INUITV'){
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
        }
    }
</script>

<style lang="scss" scoped>
    .item{
        float: left;
        clear: both;
        width: 100%;
        background: #fff;
        border-bottom: 2px solid #d2d2d4;
        box-sizing: border-box;
        margin-bottom: 10px;
        &:hover, &.active{
            border-bottom: 2px solid #0079d3;
        }
        .header{
            line-height: 40px;
            vertical-align: middle;
            width: 100%;
            float: left;
            cursor: pointer;
            overflow: hidden;
            ul{
                float: left;
                height: 40px;
                display: block;
                li{
                    display: inline-block;
                    line-height: 40px;
                    height: 40px;
                    vertical-align: top;
                    margin: 0;
                    font-size: 11px;
                    > *{
                        display: inline-block;
                        margin-top: 0;
                        height: 40px;
                        float: none;
                        line-height: 40px;
                        vertical-align: middle;
                        position: relative;
                    }
                    > .icons{
                        overflow: hidden;
                        width: 30px!important;
                        height: 30px!important;
                        .icon{
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                        }
                    }
                }
                &:last-child{
                    float: right;
                }
                &:first-child{
                    li{
                        &:nth-child(1){
                            width: 74px;
                            margin-right: 0;
							span {
								width: 40px;
								overflow: hidden;
								text-overflow: ellipsis;
							}
                        }
                        &:nth-child(2){
                            width: 80px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        &:nth-child(3){
                            width: 100px;
                        }
                    }
                }
            }
        }
        .body{
            float: left;
            width: 100%;
            clear: both;
            display: none;
            padding: 0 10px;
			font-size: 14px;
            > div, > ul{
                float: left;
                width: 100%;
                clear: both;
            }
            .reason-declined{
                margin-bottom: 5px;
                .reason-decline{
                    float: left;
                    width: 100%;
                    clear: both;
                    color: #0079d3;
                    .title, .decline-content{
                        float: left;
                        margin-right: 5px;
                    }
                }
            }
            .fields{
                li{
                    float: left;
                    display: block;
                    width: 100%;
                    border-bottom: 2px solid #d2d2d4;
                    line-height: 40px;
                    margin: 0;
                    text-transform: capitalize;
                    color: #0079d3;
                    height: 42px;
                    &:hover{
                        border-bottom: 2px solid #0079d3;
                    }
                    .icons{
                        float: left;
                        width: 40px;
                        height: 40px;
                        position: relative;
                        top: 3px;
                    }
                    span{
                        float: left;
                        margin-left: 5px;
                    }
                    &:last-child{
                        margin-bottom: 10px;
                    }
                }
            }
            .left{
                float: left;
            }
            .right{
                float: right;
            }
            .actions{
                width: auto;
                clear: none;
                margin-bottom: 10px;
                li{
                    float: left;
                    margin: 0;
                    margin-right: 5px;
                    height: 35px;
                    width: 35px;
                    line-height: 35px;
                    vertical-align: middle;
                    border-bottom: 2px solid #d2d2d4;
                    position: relative;
                    cursor: pointer;
                    &:last-child{
                        margin-right: 0;
                    }
                    &:hover{
                        border-bottom: 2px solid #0079d3;
                    }
                    .icons{
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                    }
                    &.button{
                        color: #fff;
                        padding: 0 5px;
                        width: auto;
                        font-size: 12px;
                        border: none;
                        border-radius: 3px;
                        &.red {
                            background: #DC0000;
                        }
                        &.blue {
                            background: #0079d3;
                            &:hover{

                            }
                        }
                        &:hover {
                            cursor: pointer;

                            &.red {
                                background: #c20000!important;
                                border-bottom: 2px solid #610000;
                            }
                            &.blue {
                                background: #0172c6!important;
                                border-bottom: 2px solid #002970!important;
                            }
                        }
                    }
                }
            }
        }
        &.active{
            .header{
                ul li.toggle > .icons{
                    transform: rotate(-180deg)!important;
                }
            }
            .body{
                display: block;
            }
        }

        .border{
            line-height: 30px;
            vertical-align: middle;
            border: 1px solid #000;
            float: left;
            clear: none;
            margin: 0;
            margin-right: 5px;
            padding: 0 5px;
            &.url{
                border-color: #0079d3;
            }
        }
        .url{
            cursor: pointer;
            color: #0079d3;
        }
        .description{
            float: left;
            width: 100%;
            clear: both;
        }
    }
</style>
