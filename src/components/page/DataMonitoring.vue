<style lang="scss" scoped>
    .content{
        width: 100%;
        position: relative;
        height: calc(100vh - 150px);
        padding: 25px 0;
        h1{
            float: left;
            width: calc(100% - 250px);
            clear: both;
            font-size: 22px;
            line-height: 52px;
            color: #0079D3;
        }
    }

    .picker-container{
        float: right;
        width: 250px;
    }

    table{
        table-layout: fixed;
        width: 100%;
        text-align: left;
        border-spacing:0;
        border-collapse: collapse;
        float: left;
        margin-top: 25px;
        td,th{
            border: 1px solid rgba(0,0,0,0.1);
            padding: 0 5px;
            line-height: 25px;
        }
        th{
            background: #fff;
        }
        tr{
            background: rgba(255,255,255,.3);
            &:nth-child(2n) td{
                background: #fff;
            }
        }

    }
</style>

<template>
    <div class="data">
        <page-content>
            <div class="content">
                <h1>Monitoring data stroom</h1>

                <picker icon="kalender" label="Selecteer data" v-model="selectedDate" type="datetime" hideTime="true" step="day"/>

                <table>
                    <thead>
                        <tr>
                            <th>Berichttype</th>
                            <th>Succesvol</th>
                            <th>Mislukt</th>
                            <th>Datum</th>
                            <th>Laatst geüpdatet:</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in data" :key="index" :id="row.id">
                            <td>{{row.messageType}}</td>
                            <td>{{row.success}}</td>
                            <td>{{row.failure}}</td>
                            <td>{{$moment(row.day).format('YYYY-MM-DD')}}</td>
                            <td>{{$moment(row.updatedAt).format('YYYY-MM-DD HH:mm')}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </page-content>
    </div>
</template>

<script>
/**
 * The data monitoring page
 * @author Vasilii Ciornii, OxPlus
 */
import $date from '@/modules/date-module'
import $http from '@/modules/http-module'

export default {
    data: function () {
        return {
            selectedDate: $date.toDateString(new Date()).substring(0, 11) + '00:00:00',
            data: [],
            messages: {
                processed: {
                    success: 0,
                    fail: 0
                },
                interface: {
                    success: 0,
                    fail: 0
                },
                maximo: {
                    success: 0,
                    fail: 0
                }
            }
        }
    },

    mounted: function () {
        this.getData();
    },

    watch: {
        selectedDate: function(){
            if(this.selectedDate == null){
                this.selectedDate = $date.toDateString(new Date()).substring(0, 11) + '00:00:00'
            }
            this.getData();
        }
    },

    methods: {
        getData(){
            this.axios.get($http.apiBase + 'interface/getUsage?date=' + this.selectedDate.substring(0, 11)).then((response) => {
                this.data = response.data;

                for(let i = 0; i < this.data.length; i++){
                    let current = this.data[i];

                    if(current.messageType == 'maximo'){
                        this.messages.maximo.success += current.success;
                    } else if (current.messageType == 'handleNTT'){
                        this.messages.maximo.success += current.success;
                    }
                }
            });
        }
    }
}
</script>
