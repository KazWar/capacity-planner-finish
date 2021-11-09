<template>
    <div class="item" :class="{'active': active}">
        <div class="header">
            <ul>
                <li title="Stel/stam nummer">
                    <icon name="trein" size="30"/>
                    <span>{{data.serialNumber}}</span>
                </li>
                <li :title="getMaintanceLocationName(data.maintenanceLocation)">
                    <icon name="lokatie" size="30"/>
                    <span>{{ getMaintanceLocationName(data.maintenanceLocation) }}</span>
                </li>
                <li :title="data.reasonMaintenance">
                    <span>{{data.reasonMaintenance}}</span>
                </li>
            </ul>

            <ul>
                <li
                  title=""
                  v-if="!data.bRegeling && getMaintanceLocationName(data.maintenanceLocation) == 'TRANS'">
                  <icon name="alert" size="30"/>
                </li>
        				<li
        					title="Dit materieel heeft nog werkorders met status In Uitvoering"
        					v-if="data.maintenanceStatus === 'BVD' && data.hasInuitvWO === true">
        					<icon name="alert" size="30"/>
        				</li>
        				<li
        					title="Let op: NTT informatie komt niet overeen met asset status"
        					v-if="data.notAtTheLocation">
        					<icon name="alert" size="30"/>
        				</li>
        				<li title="Materieel wordt Niet Inzetbaar gedurende huidige inzet"
        					v-if="(data.aflopendeInzetbaarheid && getMaintanceLocationName(data.maintenanceLocation) == 'MAT')">
        					<icon name="alert" size="30" color="#ff0000"/>
        				</li>
                <li>
                  <fleetstatusdots :status="data.currentFleetControlStatus"/>
                </li>
                <li @click.stop="openOptionsModal()">
                    <icon name="aanpassen" size="30" color="#0079d3"/>
                </li>
                <li class="toggle" @click="toggleWorkOrder">
                    <icon name="chevron-neerwaarts" size="35" color="rgb(0, 121, 211)" transition="all 0.3s ease"/>
                </li>
            </ul>
        </div>

        <div class="body" v-if="active">
            <ul class="workorders" v-if="!_.isEmpty(workOrders)">
                <li class="workorder" v-for="workOrder in _.orderBy(workOrders, ['dueDate'], ['asc'])">
                    <ul>

                        <li>
                          <icon name="werkzaamheden" size="30" color="#0079d3"/>
                          {{workOrder.type}}
                        </li>
                        <li :title="workOrder.description">
                          <span class="inline">{{workOrder.description}}</span>
                        </li>
                        <li :title="$moment(workOrder.dueDate).format('YYYY-MM-DD HH:mm')">
                          <icon name="kalender" size="33" color="#0079d3"/>
                          {{$moment(workOrder.dueDate).format('YYYY-MM-DD HH:mm')}}
                        </li>
                        <li :title="workOrder.status">
                          <icon name="klok" size="33" color="#0079d3"/>
                          {{workOrder.status}}
                        </li>
                        <li>
                          <fleetstatusdots :status="workOrder.currentFleetControlStatus"/>
                        </li>
                        <li @click="openAssetWorkOrderInMaximo(workOrder.WO)" class="pointer">
                          <icon name="gear" size="33" color="#0079d3"/>
                        </li>
                    </ul>
                </li>
            </ul>
            <span v-else>
                Geen werkorders beschikbaar.
            </span>
        </div>
    </div>
</template>

<script>
import $date from '@/modules/date-module'
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import _ from 'lodash';
import env from '@/env'

export default {
    props: ['type', 'locations', 'assetStatuses', 'data', 'reasonMaintenanceList', 'canEditEquipment', 'active', 'userRole', 'workOrders'],

    data: function () {
        return {
            activeId: null,
        }
    },

    mounted: function () {
        //
    },

    methods: {
      openOptionsModal(){
          const reason = this.data.reasonMaintenance === 'Service' ? 'SERVICE' : this.data.reasonMaintenance
          let obj = {
              maintenanceStatus: this.data.maintenanceStatus,
              reasonMaintenance: reason,
              maintenanceLocation: this.data.maintenanceLocation,
              memo: this.data.memo,
              id: this.data.id
          }
          this.$emit('openOptionsModal', obj);
      },
  		toggleWorkOrder(){
        this.$emit('toggleWorkOrder', this.data.id);
      },
      getMaintanceLocationName(maintenanceLocation){
        let result
        const maintenanceLocations = ['MAT', 'TRANS', 'BUIT']
	      result = maintenanceLocations.find(item => maintenanceLocation === item)
  			if (!result) {
  				for (let i = 0; i < this.locations.length; i++) {
  					if (this.locations[i].id) {
  						if (parseInt(maintenanceLocation) == this.locations[i].locationNumber) {
  							result = this.locations[i].name
  							break
  						}
  					}
  				}
  			}
        return result
      },
      openAssetWorkOrderInMaximo(wo){
        window.open(env.maximoURL + wo, '_blank')
      }
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
  	display: flex;
  	justify-content: space-between;
      cursor: pointer;
      overflow: hidden;

      ul{
        height: 40px;
        display: flex;

        li{
  		    display: flex;
  		    align-items: center;
          line-height: 40px;
          height: 40px;
          vertical-align: top;
          margin: 0;
          margin-right: 5px;
          font-size: 11px;
          > *{
            margin-top: 0;
            height: 40px;
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
        &:first-child{
          li{
            &:nth-child(1){
              width: 105px;
              margin-right: 0;
            }
            &:nth-child(2){
              width: 140px;
              margin-right: 10px;
              white-space: nowrap;
              overflow: hidden;
            }
            &:nth-child(3){
              width: 70px;
            }
          }
        }
      }
    }
    .body{
      width: 100%;
      display: none;
      padding: 0 10px;
      .workorders{
        width: 100%;
        list-style: none;
        font-size: 12px;
        > li{
  		    display: flex;
          width: 100%;
          margin: 0;
          margin-bottom: 10px;
          padding: 5px;
          border: 1px solid rgba(0,0,0,.1);
          > ul{
            width: 100%;
            list-style: none;
            display: block;
            width: 100%;
            float: left;
            li{
              margin: 0;
              // margin-right: 5px;
              line-height: 25px;
              vertical-align: middle;
        			display: inline-block;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              &.pointer{
                cursor: pointer;
              }
        			&:nth-child(1) {
        				width: 13%;
        			}
        			&:nth-child(2) {
        				width: 22%;
        			}
        			&:nth-child(3) {
        				width: 27%;
        			}
        			&:nth-child(4) {
        				width: 17.5%;
        			}
        			&:nth-child(5) {
        				width: 10%;
        			}
              &:nth-child(6) {
                width: 25px;
                margin: 0;
                float: right;
              }
              > span{
                color: #0079d3;
                cursor: pointer;
                &:hover{
                  text-decoration: underline;
                }
                &.inline {
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  color: #000;
                  &:hover{
                    text-decoration: none;
                  }
                }
              }
              > .icons{
                float: left;
                width: 25px!important;
                height: 25px!important;
                position: relative;
                margin: 0;
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
  }
</style>
