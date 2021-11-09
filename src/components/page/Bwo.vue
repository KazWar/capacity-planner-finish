<template>
    <div class="data-table page-content-footerless">
        <div class="content">
            <div class="sections content-full content-child-row scrollable-y">
                <section>
                    <h1>BWO overzicht</h1>
					<TextInput :paddingless="false" placeholder="Zoek" v-model="search" class="search-box" :searchable="true" :clearable="false"/>
                </section>
                <section>
                    <b-table
                        :data="filter"
                        :paginated="tableOptions.paginated"
                        :per-page="tableOptions.perPage"
                        :default-sort-direction="tableOptions.defaultSortDirection"
                        :sort-icon="tableOptions.sortIcon"
                        :pagination-simple="true"
                        default-sort="arrivalDate"
                    >
                        <template slot-scope="props">
                            <b-table-column field="arrivalDate" label="Geplande binnenkomst" width="40" sortable class="text-overflow">
                                {{ $moment(props.row.arrivalDate).format('DD-MM-YYYY HH:mm').toString() }}
                            </b-table-column>

                            <b-table-column field="WO" label="BWO-nummer" sortable>
                                {{ props.row.WO }}
                            </b-table-column>

                            <b-table-column field="materialNumber" label="Stel/stam" sortable>
                                {{ props.row.materialNumber }}
                            </b-table-column>

                            <b-table-column field="asset.constructionType" label="Materieel serie" sortable>
                                {{ getAssetConstructionType(props.row) }}
                            </b-table-column>

                            <b-table-column field="dueDate" label="Streef datum eind" sortable>
                                {{ $moment(props.row.dueDate).format('DD-MM-YYYY').toString() }}
                            </b-table-column>

                            <b-table-column field="description" label="Beschrijving" sortable class="text-overflow" :title="props.row.description">
                                {{ props.row.description }}
                            </b-table-column>

                            <b-table-column field="totalLeadTimeMinute" label="Capaciteit" sortable numeric class="green" >
                                {{ formatToHours(props.row.sumLeadTimeMinues) }} / {{ props.row.assetConstructionType.workCapacity }}
                            </b-table-column>

                            <b-table-column field="PO" label="PO" sortable>
                                {{ props.row.counter.PO }}
                            </b-table-column>

                            <b-table-column field="CO" label="CO" sortable>
                                {{ props.row.counter.CO }}
                            </b-table-column>

                            <b-table-column field="WUI" label="WUI" sortable>
                                {{ props.row.counter.WUI }}
                            </b-table-column>

                            <b-table-column field="status" label="Status" sortable>
                                {{ props.row.status }}
                            </b-table-column>

                            <b-table-column field="actions" class="actions">
                                <span class="icon is-invisible is-medium" @click="goToDetails(props.row.id, props.row)"><i class="mdi mdi-chevron-right"></i></span>
                            </b-table-column>
                        </template>
                    </b-table>
                </section>
            </div>

        </div>
    </div>
</template>

<script>

export default {
    data: function () {
        return {
            data: [],
            tableOptions: {
                paginated: true,
                perPage: 20,
                currentPage: 1,
                defaultSortDirection: 'asc',
                sortIcon: "chevron-up"
            },
            search: '',
            searchFields: [
                'WO',
                'materialNumber',
                'description',
                'status'
            ]
        }
    },

    computed: {
        filter: function() {
            let data = [];
            for (let i in this.data) {
                Object.keys(this.data[i]).forEach((key,index) => {
                    let value = this.data[i][key];
                    if(this.searchFields.includes(key) && (value && _.includes(value.toString().toLowerCase(), this.search.toString().toLowerCase()))){
                        data.push(this.data[i]);
                        return;
                    }
                });
            }
            data = _.uniq(data);
            return data
        }
    },

    mounted: function () {
        this.getData();
    },

    watch: {

    },

    beforeDestroy: function () {

    },

    methods: {
        getAssetConstructionType(selectedWoDetails){
            if(selectedWoDetails.asset){
                return selectedWoDetails.asset.constructionType;
            } else {
                return '';
            }
        },
        getData() {
            let filterLocationsId = parseInt(localStorage.getItem('locationId'));

            this._api.getWorkordersBWO().then(res => {
                for(let i in res.workOrders){
                    let wo = res.workOrders[i];

                    if(wo.workLocationId == filterLocationsId){
                        this.data.push(wo);
                    }
                }

                // this.data = res.workOrders;
            });
        },
        goToDetails(id, props){
            this.$router.push({ name: 'BwoOverzichtDetails', params: {id: id}})
        },
    }
}
</script>

<style scoped lang="scss" src="../../assets/scss/pages/bwo.scss" />
