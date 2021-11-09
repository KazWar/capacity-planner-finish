<script>
    import DashboardCard from '@/components/dashboard/components/DashboardCard.vue'

    export default {
        props: ['collapsed'],
        components: {
            'd-card': DashboardCard,
        },
        data: function () {
            return {
                summaryData: [
                    {
                        title: 'CONTROLES',
                        value: 0,
                        max: 0,
                        color: '#864DD9'
                    }, {
                        title: 'REINIGING',
                        value: 0,
                        max: 0,
                        color: '#CF53F9'
                    }, {
                        title: 'MBN',
                        value: 0,
                        max: 0,
                        color: '#e95f71'
                    }, {
                        title: 'PRIO 3',
                        value: 0,
                        max: 0,
                        color: '#e95f71'
                    }, {
                        title: 'REIN UTW',
                        value: 0,
                        max: 0,
                        color: '#e95f71'
                    }
                ],
                upcomingData: [],
                overviewData: [],

                tableOptions: {
                    paginated: false,
                    perPage: 15,
                    currentPage: 1,
                    defaultSortDirection: 'asc',
                    sortIcon: "chevron-up"
                },
                workOrders: [],
                counters: []
            }
        },

        computed: {

        },

        mounted: function () {
            this.getAllCounters();
            // console.log(this.$router.currentRoute.params);
            // console.log(document.body.clientWidth);
            if(document.body.clientWidth < 981){
                this.tableOptions.paginated = false;
            }
        },

        watch: {
            '$route': function(to, from) {
                this.getAllCounters();
            }
        },

        methods: {
            getStationName(row){
                // console.log(row.trainSchedule.location);
                if(row.location){
                    return row.location.station
                } else {
                    return ''
                }
            },
            getSummaryData(){
                //Controles
                let allControles = 0;
                let filledControles = 0;

                //Reiniging
                let allReiniging = 0;
                let filledReiniging = 0;

                //MBN
                let allMBN = 0;
                let filledMBN = 0;

                //PRIO 3
                let allPrio3 = 0;
                let filledPrio3 = 0;

                //REIN UTW
                let allREIN_UTW = 0;
                let filledREIN_UTW = 0;

                for(let i in this.workOrders){
                    let counter = this.workOrders[i].counter;


                    //------use this for testing only
                    // counter.type2.DC = _.random(1, 5);
                    // counter.type1.DC = _.random(0, counter.type2.DC);

                    // counter.type2.PREIN = _.random(1, 5);
                    // counter.type1.PREIN = _.random(0, counter.type2.DC);

                    // counter.type2.CO_MBN = _.random(1, 5);
                    // counter.type1.CO_MBN = _.random(0, counter.type2.DC);

                    // counter.type2.CO_PRIORITY3 = _.random(1, 5);
                    // counter.type1.CO_PRIORITY3 = _.random(0, counter.type2.DC);
                    //------

                    allControles += counter.type2.DC;
                    filledControles += counter.type1.DC;

                    allReiniging += counter.type2.PREIN;
                    filledReiniging += counter.type1.PREIN;

                    allMBN += counter.type2.CO_MBN;
                    filledMBN += counter.type1.CO_MBN;

                    allPrio3 += counter.type2.CO_PRIORITY3;
                    filledPrio3 += counter.type1.CO_PRIORITY3;

                    allREIN_UTW += counter.type2.REIN_UTW;
                    filledREIN_UTW += counter.type1.REIN_UTW;
                }

                this.summaryData[0].value = filledControles;
                this.summaryData[0].max = allControles;

                this.summaryData[1].value = filledReiniging;
                this.summaryData[1].max = allReiniging;

                this.summaryData[2].value = filledMBN;
                this.summaryData[2].max = allMBN;

                this.summaryData[3].value = filledPrio3;
                this.summaryData[3].max = allPrio3;

                this.summaryData[4].value = filledREIN_UTW;
                this.summaryData[4].max = allREIN_UTW;

            },
            getBarWidth(val, max){
                return ((100 / max) * val).toFixed(2) + '%';
            },
            getAllCounters(){
                let knoopPunt = this.$router.currentRoute.params.id;

                this.axios.get($http.apiBase + 'TrainSchedules/countWorkOrdersOnTrainSchedule?knoopPunt=' + knoopPunt).then(
                (response) => {
                    this.counters = response.data;
                    this.getWorkorders();
                })
            },
            getWorkorders(){
                // let today = this.$moment().utc().format('YYYY-MM-DD HH:MM:SS').toString().substring(0, 13) + ':00:00'
                // let tomorrow = this.$moment().add(1, 'days').utc().format('YYYY-MM-DD HH:MM:SS').toString().substring(0, 13) + ':00:00'
                let knoopPunt = this.$router.currentRoute.params.id

                this.axios.get($http.apiBase + 'TrainSchedules/getSchedulesByKnooppuntLocation?knoopPunt=' + knoopPunt).then(
                (response) => {
                    this.workOrders = response.data;

                    for (let i in this.workOrders){
                        let item = this.workOrders[i];

                        item.counter = this.attachCounterByMaterialNumber(item.materialNumber);
                    }

                    this.getUpcomingData();
                    this.getOverviewData();
                    this.getSummaryData();
                })
            },
            attachCounterByMaterialNumber(materialNumber){
                return _.find(this.counters, ['materialNumber', materialNumber]).counter;
            },
            getUpcomingData(){
                let arr = [];

                let now = this.$moment().add(1, 'hour');

                this.upcomingData = [];
                for(let i in this.workOrders){
                    let wo = this.workOrders[i];

                    let departureDate = this.$moment(wo.departureDate);
                    let diff = now.diff(departureDate, 'minutes');
                    if(departureDate <= now && departureDate >= this.$moment() && (wo.locationId && wo.location.knoopPunt == this.$router.currentRoute.params.id)){
                        let clonedWo = Object.assign({}, wo);
                        this.upcomingData.push(clonedWo)
                    }
                }

                this.upcomingData = _.uniqBy(this.upcomingData, 'id');
            },
            getOverviewData(){
                let arr = [];

                let now = this.$moment();
                this.overviewData = [];
                for(let i in this.workOrders){
                    let wo = this.workOrders[i];

                    let arrivalDate = this.$moment(wo.arrivalDate);
                    let departureDate = this.$moment(wo.departureDate);

                    let diff = now.diff(departureDate, 'minutes');

                    if(arrivalDate <= now && departureDate <= now.add(8, 'hours') && (wo.locationId && wo.location.knoopPunt == this.$router.currentRoute.params.id)){
                        let clonedWo = Object.assign({}, wo);
                        delete clonedWo.trainSchedule;
                        clonedWo.trainSchedule = wo;
                        this.overviewData.push(clonedWo)
                    }
                }

                this.overviewData = _.uniqBy(this.overviewData, 'id');

                this.overviewData = _.sortBy(this.overviewData, function(dateObj) {
                    return new Date(dateObj.departureDate);
                });

                this.overviewData = _.reverse(this.overviewData);
            },
            sortByDepartureDate(a, b, isAsc) {
                if (isAsc) {
                    return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime();
                } else {
                    return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
                }
            },
            sortByArrivalDate(a, b, isAsc) {
                if (isAsc) {
                    return new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime();
                } else {
                    return new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime();
                }
            }
        }
    }
</script>

<template>
	<section>
		<div class="page-header">
			Filter section
		</div>
		<div class="page-content">
			<ul class="summary-items">
				<li v-for="item in summaryData" class="card">
					<div class="details">
						<i class="mdi mdi-account-outline"></i>
						<span class="title">{{item.title}}</span>
						<span class="value" :style="{'color': item.color}">{{item.value}}</span>
					</div>

					<div class="bar">
						<span class="filled" :style="{'max-width': getBarWidth(item.value, item.max), 'background': item.color}"></span>
					</div>
				</li>
			</ul>

			<div class="row full-height">
				<div class="col-34 push-left nm">
					<d-card title='Aankomende vertrekken'>
						<template v-slot:content>
							<perfect-scrollbar v-dragscroll>
								<b-table
									:data="upcomingData"
									:paginated="tableOptions.paginated"
									:per-page="tableOptions.perPage"
									:default-sort-direction="tableOptions.defaultSortDirection"
									:sort-icon="tableOptions.sortIcon"
									:pagination-simple="true"
									default-sort="arrivalDate"
									v-if="upcomingData.length > 0">
									<template slot-scope="props">
										<b-table-column field="materialNumber" label="#" sortable>
											<b>{{ props.row.materialNumber.toString() }}</b>
										</b-table-column>

										<b-table-column field="departureDate" label="Vertrektijd" sortable :custom-sort="sortByDepartureDate">
											{{ $moment(props.row.departureDate).format('HH:mm').toString() }}
										</b-table-column>

										<b-table-column field="trainSchedule.trainNumberDeparture" label="Rit" sortable>
											{{ props.row.trainNumberDeparture }}
										</b-table-column>

										<b-table-column field="fleetControlStatus" label="Status" sortable>
											{{ props.row.fleetControlStatus }}
										</b-table-column>

									</template>
								</b-table>
							</perfect-scrollbar>
						</template>
					</d-card>
				</div>
				<div class="col-66 push-right">
					<d-card title='Overzicht'>
						<template v-slot:content>
							<perfect-scrollbar v-dragscroll>
								<b-table
									:data="overviewData"
									:paginated="tableOptions.paginated"
									:per-page="tableOptions.perPage"
									default-sort-direction="desc"
									:sort-icon="tableOptions.sortIcon"
									:pagination-simple="true"
									default-sort="departureDate"
									v-if="overviewData.length > 0">
									<template slot-scope="props">
										<b-table-column field="materialNumber" label="#" sortable>
											<b>{{ props.row.materialNumber.toString() }}</b>
										</b-table-column>

										<b-table-column field="arrivalDate" label="Aankomst" sortable :custom-sort="sortByArrivalDate">
											{{ $moment(props.row.arrivalDate).format('HH:mm').toString() }}
										</b-table-column>

										<b-table-column field="departureDate" label="Vertrek" sortable :custom-sort="sortByDepartureDate">
											{{ $moment(props.row.departureDate).format('HH:mm').toString() }}
										</b-table-column>

										<b-table-column field="trainSchedule.location.station" label="Terrein" sortable> <!--  -->
											{{ getStationName(props.row) }}
										</b-table-column>

										<b-table-column field="trainSchedule.location.defaultReasonMaintenance" label="Reden" sortable>
											{{ props.row.trainSchedule.location.defaultReasonMaintenance }}
										</b-table-column>

										<b-table-column field="counter.type1.DC" label="DC" sortable>
											{{ props.row.counter.type1.DC }} / {{ props.row.counter.type2.DC }}
										</b-table-column>

										<b-table-column field="counter.type1.PREIN" label="REIN" sortable>
											{{ props.row.counter.type1.PREIN }} / {{ props.row.counter.type2.PREIN }}
										</b-table-column>

										<b-table-column field="counter.type1.CO_MBN" label="MBN" sortable>
											{{ props.row.counter.type1.CO_MBN }} / {{ props.row.counter.type2.CO_MBN }}
										</b-table-column>

										<b-table-column field="counter.type1.CO_PRIORITY3" label="Prio 3" sortable>
											{{ props.row.counter.type1.CO_PRIORITY3 }} / {{ props.row.counter.type2.CO_PRIORITY3 }}
										</b-table-column>

										<b-table-column field="counter.type1.REIN_UTW" label="REIN UTW" sortable>
											{{ props.row.counter.type1.REIN_UTW }} / {{ props.row.counter.type2.REIN_UTW }}
										</b-table-column>
									</template>
								</b-table>
							</perfect-scrollbar>
						</template>
					</d-card>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
    @import "./src/assets/scss/dashboard/global";
    @import "./src/assets/scss/dashboard/components/page-layout";
</style>
