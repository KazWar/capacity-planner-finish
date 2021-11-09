<template>
    <div id="schedule-mechanics" class="page-content-footerless">
		<div class="content content-full scrollable-x">
			<div class="content-child-full content-third-row">
                <div class="content-row monitor-row" v-for="(schedule, index) in schedules">
					<div class="row-head">
						{{formatDate(days[index])}}
					</div>
					<div class="row-content scrollable-y content-child-row content-titled">
                        <div class="schedules">
                            <div class="schedule" v-for="item in schedule" v-if="checkLocation(item.locationId)">
                                <div class="push-left">
                                    <span>{{item.mechanic.personId}}</span>
                                    <span>{{item.mechanic.name}}</span>
                                </div>
                                <div class="push-right">
                                    <span @click="showMechanicQualifications(item.mechanic.id)">
                                        <icon name="kwalificatie" :size="25" title="Kwalificaties"/>
                                    </span>
                                    <span @click="editMechanicShiftModal(item.id, item.mechanic.id, item.startDate, item.endDate, item.active, item.locationId)">
                                        <icon name="klok" :size="25" />
                                        <span>{{getShiftHours(item.startDate).substring(11, 16)}} - {{getShiftHours(item.endDate).substring(11, 16)}}</span>
                                    </span>
                                    <span class="button" :class="{'danger': !item.active}" @click="toggleShiftActivity(item.id, item.mechanic.id, item.startDate, item.endDate, item.active)">
                                        Afwezig
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="mechanics">
                            <div class="mechanic" v-for="mechanic in getMechanicListWithoutSchedules(index)">
                                <div class="push-left">
                                    <span>{{mechanic.personId}}</span>
                                    <span>{{mechanic.name}}</span>
                                </div>
                                <div class="push-right">
                                    <span class="button" @click="createMechanicShiftModal(mechanic, index)">
                                        Aanmaken
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <modal title="Werktijden aanpassen" v-model="displayModalEdit">
            <div slot="content" v-if="displayModalEdit && dataForShift !== null">
                <div class="inner">
                    <div class="details">
                        <div class="item">
                            <label>Monteur</label>
                            <span>{{getMechanicById(dataForShift.mechanicId).name}}</span>
                        </div>
                        <div class="item">
                            <label>Dienst</label>
                            <span>{{formatDate(dataForShift.startDate)}} {{dataForShift.startDate ? dataForShift.startDate.substring(11, 16) : '00:00'}} - {{dataForShift.endDate ? dataForShift.endDate.substring(11, 16) : '00:00'}}</span>
                        </div>

                        <div class="form">
							<TreeSelect
								v-model="dataForShift.locationId"
								:options="locations"
								options-label="name"
								label="Kies werklocatie"
								icon="lokatie_W"
								class="picker-container"
							/>
							<DateTimePicker label="Kies startdatum" :icon="false" v-model="dataForShift.startDate" class="picker-container" />
							<DateTimePicker label="Kies einddatum" :minDate="dataForShift.startDate" :icon="false" v-model="dataForShift.endDate" class="picker-container" />
                        </div>
                    </div>
                </div>
            </div>
            <div slot="buttons">
                <button class="button right" @click="editShift()">Opslaan</button>
            </div>
        </modal>

        <modal title="Werktijden aanmaken" v-model="displayModalCreate">
            <div slot="content" v-if="displayModalCreate && dataForCreateShift !== null">
                <div class="inner">
                    <div class="details">
                        <div class="item">
                            <label>Monteur</label>
                            <span>{{getMechanicById(dataForCreateShift.mechanicId).name}}</span>
                        </div>
                        <div class="item">
                            <label>Dienst</label>
                            <span>{{formatDate(dataForCreateShift.startDate)}} {{dataForCreateShift.startDate ? dataForCreateShift.startDate.substring(11, 16) : '00:00'}} - {{dataForCreateShift.endDate ? dataForCreateShift.endDate.substring(11, 16) : '00:00'}}</span>
                        </div>

                        <div class="form">
							<DateTimePicker label="Kies startdatum" :icon="false" v-model="dataForCreateShift.startDate" class="picker-container" />
							<DateTimePicker label="Kies einddatum" :minDate="dataForCreateShift.startDate"  :icon="false" v-model="dataForCreateShift.endDate" class="picker-container" />
							<TreeSelect
								v-model="dataForCreateShift.locationId"
								:options="locations"
								options-label="name"
								label="Kies werklocatie"
								icon="lokatie_W"
								class="picker-container"
							/>
                        </div>
                    </div>
                </div>
            </div>
            <div slot="buttons">
                <button class="button right" @click="createShift()">Opslaan</button>
            </div>
        </modal>

        <modal title="Kwalificaties" v-model="displayModalQualifications">
            <div slot="content" v-if="displayModalQualifications">
                <div class="inner">
                    <div class="details qualification-list">
                        <div class="qualification" v-for="item in mechanicQualifications" v-if="item.qualification.name !== null">
                            <span>{{item.qualification.externalId}} {{item.qualification.name}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div slot="buttons">
                <button class="button right" @click="">Opslaan</button>
            </div>
        </modal>
    </div>
</template>

<script>
import $date from '@/modules/date-module'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
export default {
    data: function () {
        return {
            mechanicSchedules: [],
            schedules: [[], [], []],
            mechanics: [],
            days: [],
            displayModalEdit: false,
            displayModalCreate: false,
            displayModalQualifications: false,
            dataForShift: null,
            dataForCreateShift: null,
            mechanicQualifications: []
        }
    },
    mounted: function () {
        this.generateDays();
        this.getMechanics();
        this.getMechanicShifts();

    },
	computed: {
    	locations () {
			return this.$store.getters.GET_LOCATIONS
		}
	},
    watch: {
        mechanicSchedules(){
            this.schedulesSort();
        }
    },

    methods: {
        checkLocation(id){
            if(id == sessionStorage.getItem('locationId')){
                return true;
            } else {
                return false;
            }
        },
        showMechanicQualifications(mechanicId){
            this.displayModalQualifications = true;
            this.mechanicQualifications = this.getMechanicById(mechanicId).qualifications;
        },
        createMechanicShiftModal(mechanic, dayIndex){
            this.displayModalCreate = true;

            let startDate = this.days[dayIndex] + ' 00:00';
            let endDate = this.days[dayIndex] + ' 00:00';

            this.dataForCreateShift = {
                mechanicId: mechanic.id,
                startDate: $date.toDateString(new Date(startDate)),
                endDate: $date.toDateString(new Date(endDate)),
                locationId: parseInt(sessionStorage.getItem('locationId'))
            }

            // console.log(this.dataForCreateShift);
        },
        createShift(){
            this.displayModalCreate = false;
            if(this.dataForCreateShift !== null){
                let obj = {
                    mechanicId: this.dataForCreateShift.mechanicId,
                    startDate: $date.toDateObject(this.dataForCreateShift.startDate).toJSON(),
                    endDate: $date.toDateObject(this.dataForCreateShift.endDate).toJSON(),
                    locationId: this.dataForCreateShift.locationId || null
                }
                this._api.createMechanicSchedule(obj).then(res => {
                    this.mechanicSchedules.push(res);
                    this.schedulesSort();
                });
            }
        },
        editMechanicShiftModal(shiftId, mechanicId, startDate, endDate, active, locationId){
            this.displayModalEdit = true;

            this.dataForShift = {
                id: shiftId,
                mechanicId: mechanicId,
                active: active,
                startDate: $date.toDateString(new Date(startDate)),
                endDate: $date.toDateString(new Date(endDate)),
                locationId: parseInt(locationId)
            }

            // console.log(this.dataForShift);
        },
        editShift(){
            this.displayModalEdit = false;
            if(this.dataForShift !== null){
                let obj = {
                    id: this.dataForShift.id,
                    mechanicId: this.dataForShift.mechanicId,
                    active: this.dataForShift.active,
                    startDate: $date.toDateObject(this.dataForShift.startDate).toJSON(),
                    endDate: $date.toDateObject(this.dataForShift.endDate).toJSON(),
                    locationId: this.dataForShift.locationId
                }

                this._api.changeMechanicsAvailability(obj).then(res => {
                    for(let i = 0; i < this.mechanicSchedules.length; i++){
                        if(res.id == this.mechanicSchedules[i].id){
                            this.mechanicSchedules[i] = {
                                ...this.mechanicSchedules[i],
                                startDate: res.startDate,
                                endDate: res.endDate,
                                locationId: res.locationId
                            };
                            break;
                        }
                    }

                    this.schedulesSort();
                })
            }
        },
        toggleShiftActivity(shiftId, mechanicId, startDate, endDate, active){
            let obj = {
                id: shiftId,
                mechanicId: mechanicId,
                active: !active
            }


			this._api.changeMechanicsAvailability(obj).then(res => {
                for(let i = 0; i < this.mechanicSchedules.length; i++){
                    if(res.id == this.mechanicSchedules[i].id){
                        this.mechanicSchedules[i] = {
                            ...this.mechanicSchedules[i],
                            active: res.active
                        };
                        break;
                    }
                }

                this.schedulesSort();
            });
        },
        getShiftHours(date){
            return $date.toDateString(new Date(date))
        },
        formatShift(date){
            if(date){

                return $date.toDateString($date.toDateObject(date)).substring(11, 16)
            }
        },
        formatDate (date) {
            if(date){
                return $date.formatDayNameDateMonthYear($date.toDateObject(date))
            }
        },
        generateDays () {
            this.days = []
            for (let i = 0; i < 3; i ++) {
                this.days.push($date.toDateString(new Date((new Date()).getTime() + (i - 1) * 24 * 60 * 60 * 1000)).substring(0, 10))
            }
        },
        getMechanicShifts(){
            this.mechanicSchedules = [];

			this._api.getMechanicsScheduleList(this.days[0], this.days[2], sessionStorage.getItem('locationId')).then(res => {
				this.mechanicSchedules = res

				this.schedulesSort();
			});
        },
        schedulesSort(){
            this.schedules = [[], [], []];
            for(let i = 0; i < this.mechanicSchedules.length; i++){
                let itemDate = this.$moment(this.mechanicSchedules[i].startDate);

                if(itemDate.format('MM-DD') == this.$moment(this.days[0]).format('MM-DD')){
                    this.schedules[0].push(this.mechanicSchedules[i]);
                } else if (itemDate.format('MM-DD') == this.$moment(this.days[1]).format('MM-DD')){
                    this.schedules[1].push(this.mechanicSchedules[i]);
                } else if (itemDate.format('MM-DD') == this.$moment(this.days[2]).format('MM-DD')){
                    this.schedules[2].push(this.mechanicSchedules[i]);
                }
            }

            this.getMechanicListWithoutSchedules();
        },
        getMechanics(){
            this._api.getMachanics().then(res => {
                this.mechanics = res
            })
        },
        getMechanicListWithoutSchedules(day){
            let arr = [];
            if(this.schedules[day]){
                for(let i = 0; i < this.mechanics.length; i++){
                    let mechanicId = this.mechanics[i].id;
                    let allowPush = true;
                    for(let j = 0; j < this.schedules[day].length; j++){
                        if(this.schedules[day][j].mechanic.id == mechanicId && this.mechanics[i].locationId == parseInt(sessionStorage.getItem('locationId'))){
                            allowPush = false;
                            break;
                        }
                    }
                    if(allowPush && this.mechanics[i].locationId == sessionStorage.getItem('locationId')){
                        arr.push(this.mechanics[i])
                    }

                }
                return arr;
            }
        },
        getMechanicById(id){
            for(let i = 0; i < this.mechanics.length; i++){
                let current = this.mechanics[i];
                if(current.id == id){
                    return current;
                }
            }
        },
        getLocationById(id){
            for(let i = 0; i < this.locations.length; i++){
                let current = this.locations[i];
                if(current.id == id){
                    return current;
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped src="../../assets/scss/pages/mechanics.scss" />
