<template>
    <div class="data-table data-table-details">
        <div class="content">
			<div class="content-left-sm">
				<div class="content-child content-child-left scrollable-y content-footered">
					<div class="search-wrapper">
						<TreeSelect
							v-model="selectedWoTypes"
							:options="getWoTypes()"
							options-label="type"
							options-id="type"
							label="Type werk"
							:selectSize="52"
							:multiple="true"
							:paddingless="false"
							:limit="1"
							:limitText="count => `en nog ${count}`"
							:flat="true"
							:autoSelectDescendants="true"
							:autoDeselectDescendants="true"
							:defaultExpandLevel="1"
							:searchable="true"
						/>
					</div>
					<ul class="workorders">
						<li v-for="workorder in noParentWorkorders" v-if="(selectedWoTypes.includes(workorder.type) || selectedWoTypes.length == 0)">
							<div class="workorder-header" @click="setSelectedWO(workorder.id)">
								<ul class="wo-info-left">
									<li>
										<icon name="document" size="25" color="#3A3B3C"/>
										<span>{{workorder.type}}</span>
									</li>
									<li :title="workorder.description">
										<icon name="werkzaamheden" size="25" color="#3A3B3C"/>
										<span>{{workorder.description}}</span>
									</li>
									<li title="Streefdatum einde">
										<icon name="kalender" size="25" color="#3A3B3C"/>
										<span>{{$moment(workorder.dueDate).format('DD-MM-YYYY')}}</span>
									</li>
									<li>
										<ul class="icons">
											<li @click.stop="toggleWeekGoal(workorder)">
												<icon name="ster" size="25" color="#ffd651" v-if="!workorder.weekGoal"/>
												<icon name="ster_solid" size="25" color="#ffd651" v-else/>
											</li>
											<li v-if="( workorder.VBT || !workorder.VBT && workorder.VBTneeded )">
												<icon name="alert" size="25" :color="getColor(workorder.VBT)"/>
											</li>
										</ul>
									</li>
								</ul>
								<ul class="wo-info-right">
									<!-- <li>
										<icon name="werkzaamheden" size="25" color="#aeaeae"/>
									</li> -->
									<li @click.stop="setParentWO(workorder)">
										<icon name="plus" size="25" color="#0079d3"/>
									</li>
								</ul>
							</div>
							<div class="workorder-content" v-if="selectedWoId == workorder.id">
								<div class="fields info">
									<div class="field squared url">
										<span @click="openWorkOrderInMaximo(workorder.WO)">{{workorder.WO}}</span>
									</div>
									<div class="field">
										{{workorder.description}}
									</div>
								</div>
								<div class="fields">
									<div class="field full-width" title="Werklocatie">
										<icon name="lokatie_W" size="30" color="#0079d3"/>
										<span>{{findLocationNameById(workorder.workLocationId)}}</span>
									</div>
									<div class="field full-width" title="Reparatielocatie">
										<icon name="lokatie_R" size="30" color="#0079d3"/>
										<span>{{findLocationNameById(workorder.repairLocationId)}}</span>
									</div>
									<div class="field full-width" title="Doorlooptijd">
										<icon name="klok" size="30" color="#0079d3"/>
										<span>{{formatToHours(workorder.totalLeadTimeMinutes) || 0}} min</span>
									</div>
									<div class="field full-width" title="PO locatietype">
										<icon name="lokatie" size="30" color="#0079d3"/>
										<span>{{workorder.locationPO}}</span>
									</div>
									<div class="field full-width" title="VBK prioriteit">
										<icon name="vbk_prio" size="30" color="#0079d3"/>
										<span>{{workorder.priorityVBK}}</span>
									</div>
								</div>
							</div>
						</li>
					</ul>
				</div>
				<div class="content-child content-child-right scrollable-y content-footered">
					<div class="sections">
						<section v-if="selectedWoDetails">
							<ul class="wo-details-left">

								<li>
									<label>BWO-nummer</label>
									<span @click="openWorkOrderInMaximo(selectedWoDetails.WO)">{{selectedWoDetails.WO}}</span>
								</li>
								<li>
									<label>Draaiboek ID</label>
									<span></span>
								</li>
								<li>
									<label>Stel/Stam</label>
									<span>{{selectedWoDetails.materialNumber}}</span>
								</li>
								<li>
									<label>Materieel</label>
									<span>{{getAssetConstructionType(selectedWoDetails)}}</span>
								</li>
								<li>
									<label>Beschrijving</label>
									<span :title="selectedWoDetails.description">{{selectedWoDetails.description}}</span>
								</li>
								<li>
									<label>Locatie</label>
									<span>{{getLocationNumberByLocationId(selectedWoDetails.workLocationId)}}</span>
								</li>
								<li>
									<label>Geplande binnenkomst</label>
									<span v-if="selectedWoDetails.arrivalDate">{{ $moment(selectedWoDetails.arrivalDate).format('DD-MM-YYYY').toString() }}</span>
								</li>
							</ul>

							<ul class="wo-details-right">
								<template v-if="selectedWoDetails.counter">
									<li>
										<label>Totaal</label>
										<span>{{getTotalCounter(selectedWoDetails.counter.CO, selectedWoDetails.counter.PO, selectedWoDetails.counter.WUI)}}</span>
									</li>
									<li>
										<label>PO</label>
										<span>{{selectedWoDetails.counter.PO || 0}}</span>
									</li>
									<li>
										<label>CO</label>
										<span>{{selectedWoDetails.counter.CO || 0}}</span>
									</li>
									<li>
										<label>WUI</label>
										<span>{{selectedWoDetails.counter.WUI || 0}}</span>
									</li>
								</template>

								<li>
									<label>PO capaciteit</label>
									<!-- <span class="green">{{formatToHours(selectedWoDetails.sumLeadTimeMinues)}}/{{selectedWoDetails.assetConstructionType.workCapacity}}</span> -->
								</li>

								<li>
									<label>Status</label>
									<span>{{selectedWoDetails.status}}</span>
								</li>

							</ul>
						</section>

						<section class="table">
							<h1>Werkorder overzicht</h1>
							<TextInput
								:paddingless="false"
								placeholder="Zoek"
								v-model="search"
								class="search-box"
								:searchable="true"
								:clearable="false"
							/>
							<b-table
								:data="filter"
								:paginated="tableOptions.paginated"
								:per-page="tableOptions.perPage"
								:default-sort-direction="tableOptions.defaultSortDirection"
								:sort-icon="tableOptions.sortIcon"
								:pagination-simple="true"
								:default-sort="['dueDate', 'desc']"
								v-if="filter.length > 0"
							>
								<template slot-scope="props">
									<b-table-column field="dueDate" label="Streefdatum einde" width="40" sortable class="text-overflow" :custom-sort="sortByDueDate">
										{{ $moment(props.row.dueDate).format('DD-MM-YYYY').toString() }}
									</b-table-column>

									<b-table-column field="WO" label="WO-nummer" sortable>
										<span class="href" @click="openWorkOrderInMaximo(props.row.WO)">{{ props.row.WO }}</span>
									</b-table-column>

									<b-table-column field="materialNumber" label="Type werk" sortable>
										{{ props.row.type }}
									</b-table-column>

									<b-table-column field="description" label="Beschrijving" sortable class="text-overflow" :title="props.row.description">
										{{ props.row.description }}
									</b-table-column>

									<b-table-column field="capaciteit" label="Capaciteit">
										{{ formatToHours(props.row.totalLeadTimeMinutes) || 0 }}
									</b-table-column>

									<!-- <b-table-column field="toewijzing" label="Toewijzing" sortable>
										{{ props.row.toewijzing }}
									</b-table-column> -->

									<b-table-column field="weekdoel" label="Weekdoel" class="center-text">
										<icon name="ster" size="25" color="#ffd651" v-if="!props.row.weekGoal"/>
										<icon name="ster_solid" size="25" color="#ffd651" v-else/>
									</b-table-column>

									<b-table-column field="VBT" label="VBT" class="center-text">
										<!-- {{ props.row.VBT }} -->
										<icon name="alert" size="25" :color="getColor(props.row.VBT)" v-if="( props.row.VBT || !props.row.VBT && props.row.VBTneeded )"/>
									</b-table-column>

									<b-table-column field="status" label="Status">
										{{ props.row.status }}
									</b-table-column>

									<b-table-column field="actions" class="actions">
                                    <span class="icon is-invisible is-medium orange fill" @click="planSingleWo(props.row)" v-if="checkVisibility(props.row.status)">
                                        GGK
                                    </span>
										<span class="icon is-invisible is-medium" @click="openCalcelPopup(props.row)"><i class="mdi mdi-close"></i></span>
									</b-table-column>
								</template>
							</b-table>
						</section>
					</div>
				</div>

			</div>
        </div>
        <div class="footer" v-if="parentWO !== null">
			<ul class="flex-wrap flex-right">
				<button class="btn button-orange" @click="fillBWO()" style="margin-right: 20px">
					<svg class="spinner" width="20px" height="20px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg" v-if="fillBWOspinner">
					   <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
					</svg>
					BWO vullen
				</button>
				<button class="btn button-orange" @click="toggleStatus()">
					{{getToggleText()}}
				</button>
			</ul>
        </div>

        <modal class="modal-leadtime" v-if="showCancelModal" v-model="showCancelModal" title="Let op! je verwijdert een werkorder uit de BWO">
            <div slot="content">
                <!-- / -->
            </div>
            <div slot="buttons">
                <div class="button left blue" @click="removeParentWo(false)">Geen VBT nodig</div>
                <div class="button right red" @click="removeParentWo(true)">Wel VBT nodig</div>
            </div>
        </modal>
    </div>
</template>

<script>
	import env from '@/env'
	import $snackbar from '@/modules/snackbar-module'
	import $loader from '@/modules/loader-module'

    export default {
        data: function () {
            return {
                selectedWoTypes: [],
                parentWo: null,
                showCancelModal: false,
                data: [
                    {
                        date: '2020-04-20T04:00:00.000Z',
                        WO: 'M113365477',
                        type: 'PO',
                        description: 'Test description',
                        capaciteit: 8,
                        toewijzing: -90,
                        wekdoel: '',
                        VBT: '',
                        status: 'ABCD'
                    }
                ],
                workorders: [],
                tableOptions: {
                    paginated: false,
                    perPage: 15,
                    currentPage: 1,
                    defaultSortDirection: 'asc',
                    sortIcon: "chevron-up"
                },
                selectedWoId: null,
                search: '',
                selectedWoDetails: null,
                selectedWo: null,
                fillBWOspinner: false
            }
        },

        computed: {
			locations () {
				return this.$store.getters.GET_LOCATIONS
			},
            noParentWorkorders: function(){
                return [ ..._.filter(this.workorders, {parentWO: null}), ..._.filter(this.workorders, {parentWO: ""})];
            },
            filter: function() {
                let data = [];
                for (let i in this.workorders) {
                    Object.keys(this.workorders[i]).forEach((key,index) => {
                        let value = this.workorders[i][key];
                        if(value && _.includes(value.toString().toLowerCase(), this.search.toString().toLowerCase()) && this.parentWo && this.workorders[i].parentWO == this.parentWo.WO){
                            data.push(this.workorders[i]);
                            return;
                        }
                    });
                }
                data = _.uniq(data);

                return data;
            }
        },

        mounted: function () {
            // console.log(this.$route.params.wo.status);
            this.getBWORelatedWO();
            this.getMainSelectedWo();
        },

        methods: {
        	getLocationNumberByLocationId(id) {
        		return _.find(this.locations, {id: id}).locationNumber
        	},
            fillBWO(){
            	this.fillBWOspinner = true;
                this._api.fillBWO(this.selectedWoDetails.id).then(res => {
                    this.selectedWoDetails = res;
                    this.fillBWOspinner = false;
                	$snackbar.add('BWO vullen gereed');
                	this.getBWORelatedWO();
                	this.getMainSelectedWo();
                });
            },
            getWoTypes(){
                return _.uniqBy(this.noParentWorkorders.map(e => ({
                    type: e.type
                })), 'type');
            },
            getToggleText(){
                if(this.parentWo && this.parentWo.status == 'WGK'){
                    return 'Goedkeuren'
                } else {
                    return 'Bwo terugzetten'
                }
            },
            checkVisibility(woStatus){
                let parentWoStatus = this.selectedWoDetails.status;

                if(parentWoStatus !== 'WGK' && woStatus == 'WGK'){
                    return true;
                } else {
                    return false;
                }
            },
            planSingleWo(item){
                this._api.saveWorkOrderPlan(item.id);

                this.filter.find(x => x.id === item.id).status = 'GGK';
            },
            toggleStatus(){
                if(this.selectedWoDetails.status == 'WGK'){
                    this.selectedWoDetails.status = 'GGK';
                    this._api.saveBWO(this.selectedWoDetails.WO);
                } else {
                    this.selectedWoDetails.status = 'WGK';
					this._api.changeStatusBWOwo(this.selectedWoDetails.WO);
                }

                this.changeWoStatuses();
            },
            changeWoStatuses(){
                let locationId = localStorage.getItem('locationId');

                for(let i in this.filter){
                    this.filter[i].status = this.selectedWoDetails.status;
                }
            },
            saveParentWo(){
                this._api.saveWorkOrder(this.selectedWoDetails);
            },
            sortByDueDate(a, b, isAsc) {
                if (isAsc) {
                    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                } else {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
            },
            getAssetConstructionType(selectedWoDetails){
                if(selectedWoDetails.asset){
                    return selectedWoDetails.asset.constructionType;
                } else {
                    return '';
                }
            },
            getAllLeadTimesBWO(){
                let result = 0;

                for (let i in this.workorders) {
                    let wo = this.workorders[i];

                    if(wo.parentWO !== null && wo.parentWO !== "" && wo.totalLeadTimeMinutes){
                        let totalWoLeadTime = parseInt(wo.totalLeadTimeMinutes);
                        result = result + totalWoLeadTime
                    }
                }

                return this.formatToHours(result);
            },
            openCalcelPopup(wo){
                this.selectedWo = wo;
                this.showCancelModal = true;
            },
            getMainSelectedWo(){
            	// console.log(this.$route.params.id);
                this._api.getWorkorderDetail(this.$route.params.id).then(res => {
                    this.selectedWoDetails = res;
                    this.parentWo = res;

                    console.log(this.selectedWoDetails);
                });
            },
            findLocationNameById(locationId){
                for(let i in this.locations){
                    let location = this.locations[i];

                    if(locationId == location.id){
                        return location.name
                    }
                }
            },
            openWorkOrderInMaximo (wo) {
                window.open(env.maximoURL + wo, '_blank')
            },
            setSelectedWO(id){
                if(this.selectedWoId !== id){
                    this.selectedWoId = id;
                } else {
                    this.selectedWoId = null;
                }
            },
            //api/workorders/getBWORelatedWO
            getBWORelatedWO(){
            	this.workorders = [];
                this._api.getBWORelatedWO(this.$route.params.id).then(res => {
                    this.workorders = res
                })
            },
            setParentWO(wo){
                let obj = {
                    // id: wo.id,
                    BWO: this.selectedWoDetails.WO,
                    WO: wo.WO
                }

                for(let i in this.workorders){
                    let workOrder = this.workorders[i];

                    if(workOrder.id == wo.id){
                        workOrder.parentWO = this.selectedWoDetails.WO;
                        break;
                    }
                }

				this._api.assignBWOwo(obj);
            },
            removeParentWo(bool){
                let wo = this.selectedWo;

                let obj = {
                    // id: wo.id,
                    BWO: "",
                    WO: wo.WO
                }

                this._api.assignBWOwo(obj);

                for(let i in this.workorders){
                    let workOrder = this.workorders[i];

                    if(workOrder.id == wo.id){
                        workOrder.parentWO = null;
                        workOrder.VBTneeded = bool;
                        workOrder.workLocationId = null;

						// this._api.assignBWOwo(obj);
                        break;
                    }
                }

                this.showCancelModal = false;
            },
            toggleWeekGoal(wo){
                let obj = {
                    id: wo.id,
                    weekGoal: !wo.weekGoal
                }

			this._api.saveWorkOrder(obj)
			.then(res => {
                    for(let i in this.workorders){
                        let workOrder = this.workorders[i];

                        if(workOrder.id == wo.id){
                            workOrder.weekGoal = obj.weekGoal
                            break;
                        }
                    }
                });
            },
            getTotalCounter(a, b, c){
                if(a && b && c){
                    return a + b + c;
                } else {
                    return 0;
                }

            },
            getColor(vbt){
                if(!vbt){
                    return '#ff9c43'
                } else {
                    return '#e22f2f'
                }
            }
        }
    }
</script>

<style scoped lang="scss" src="../../assets/scss/pages/bwo.scss" />
