<style lang="scss" scoped>
    .notification-item {
        background: white;
        width: 500px;
        max-width: 100%;
        &.alarm {
            .notification-item-type {
                color: #DC0000;
            }
        }
        &.warning {
            .notification-item-type {
                color: #FF7800;
            }
        }
        &.notification {
            .notification-item-type {
                color: #FFC917;
            }
        }
        .notification-item-type {
            font-size: 12px;
            font-family: 'Open Sans', sans-serif;
            font-weight: normal;
        }
        .notification-item-title {
            font-size: 16px;
            font-family: 'Open Sans', sans-serif;
            font-weight: bold;
            color: #003082;
            padding-bottom: 11px;
        }
        .notification-item-description {
            color: #707070;
            font-size: 16px;
            font-family: 'Open Sans', sans-serif;
            padding-bottom: 25px;
        }
        .notification-item-bottom {
            color: #C5C5CB;
            font-size: 14px;
            font-family: 'Open Sans', sans-serif;

            .notification-item-button {
                float: right;
                color: #0079D3;
                font-size: 16px;
                font-family: 'Open Sans', sans-serif;

                &:hover {
                    cursor: pointer;
                    text-decoration: underline;
                }
            }
        }

        &:not(:first-child) {
            padding-top: 20px;
            margin-top: 20px;
            border-top: 1px solid #C5C5CB;
        }
    }
</style>

<template>
    <div :class="{
        'notification-item': true,
        'alarm': (notification.notificationType || 'Geen type').toUpperCase() === 'ALARM',
        'warning': (notification.notificationType || 'Geen type').toUpperCase() === 'WARNING',
        'notification': (notification.notificationType || 'Geen type').toUpperCase() === 'MELDING'
    }">
        <div class="notification-item-type">
            {{(notification.notificationType || 'Geen type').toUpperCase()}}
        </div><div class="notification-item-title">
            {{notification.title || 'Geen titel'}}
        </div><div class="notification-item-description">
            {{notification.message || 'Geen bericht'}}
        </div><div class="notification-item-bottom">
            {{getDate()}}

            <div :style="{
                'margin-left': cI === 1 ? 0 : '10px'
            }" class="notification-item-button" v-for="(callToAction, cI) in notification.callToAction" :key="cI" @click="performCallToAction(callToAction)">
                {{callToAction}}
            </div>
        </div>
    </div>
</template>

<script>
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
import $date from '@/modules/date-module'
export default {
    props: ['notification'],

    methods: {
        /**
         * Perform the call to action
         * @param {string} callToActionString the call to action string
         */
        performCallToAction (callToActionString) {
            switch (callToActionString.replace(' ', '').toLowerCase()) {
                case 'openwerkorder':
                    this.openWorkOrder()
                break
                case 'description':
                    document.dispatchEvent(new CustomEvent('memoOpen', {
                        detail: {
                            notification: this.notification,
                            markAsRead: this.markAsRead
                        }
                    }))
                break
                case 'memo':
                    document.dispatchEvent(new CustomEvent('memoOpen', {
                        detail: {
                            notification: this.notification,
                            markAsRead: this.markAsRead
                        }
                    }))
                break
                case 'ok':
                    this.markAsRead()
                break
                case 'accept':
                    this.markAsRead()
                break
                case 'nee':
                    this.markAsRead()
                break
                case 'ja':
                    if ((!this.notification.workOrderId || this.notification.workOrderId.length === 0) && (!this.notification.materialNumber || this.notification.materialNumber.length === 0)) {
                        $snackbar.addWarning('Kon werkorder/asset niet vinden, probeert u het later nogmaals.')
                        return
                    }
                    if (this.notification.notificationId === 9) {
                        $loader.message = 'Asset aanpassen'

                        let processAsset = (asset) => {
                            if (!asset) {
                                $snackbar.addWarning('Er kon geen asset gevonden worden op de werkorder, probeert u het later nogmaals.')
                                $loader.message = null
                            }
                            else {
                                asset.maintenanceLocation = 'TRANS'
                                asset.transNotification = null
                                $asset.put(asset).then(response => {
                                    $loader.message = null
                                    $snackbar.add('Asset aangepast.')
                                    this.markAsRead()
                                }).catch(response => {
                                    $loader.message = null
                                })
                            }
                        }

                        //workorder
                        if (this.notification.workOrderId && this.notification.workOrderId.length > 0) {
                            $workOrder.getDetail(this.notification.workOrderId[0]).then(response => {
                                let workOrder = JSON.parse(response.data)
                                let asset = workOrder.asset
                                processAsset(asset)
                            }).catch(response => {
                                $snackbar.addWarning('Kon werkorder/asset niet vinden, probeert u het later nogmaals.')
                                $loader.message = null
                            })
                        }
                        // asset
                        else if (this.notification.materialNumber && this.notification.materialNumber.length > 0) {
                            $asset.getAssetsByAssetNumber(this.notification.materialNumber[0]).then(response => {
                                let assets = JSON.parse(response.data)
                                if (assets.length === 0) {
                                    $snackbar.addWarning('Kon asset niet vinden, probeert u het later nogmaals.')
                                    $loader.message = null
                                }
                                else {
                                    processAsset(assets[0])
                                }
                            }).catch(response => {
                                $snackbar.addWarning('Kon asset niet vinden, probeert u het later nogmaals.')
                                $loader.message = null
                            })
                        }
                        else {
                            $snackbar.addWarning('Geen asset gevonden op de notificatie.')
                        }
                    }
                    else if (this.notification.notificationId === 10) {
                        $loader.message = 'Asset aanpassen'

                        let processAsset = (asset) => {
                            if (!asset) {
                                $snackbar.addWarning('Er kon geen asset gevonden worden op de werkorder, probeert u het later nogmaals.')
                                $loader.message = null
                            }
                            else {
                                asset.maintenanceStatus = 'NBVD'
                                asset.nbvdNotification = null
                                $asset.put(asset).then(response => {
                                    $loader.message = null
                                    $snackbar.add('Asset aangepast.')
                                    this.markAsRead()
                                }).catch(response => {
                                    $loader.message = null
                                })
                            }
                        }

                        // workorder
                        if (this.notification.workOrderId && this.notification.workOrderId.length > 0) {
                            $workOrder.getDetail(this.notification.workOrderId[0]).then(response => {
                                let workOrder = JSON.parse(response.data)
                                let asset = workOrder.asset
                                processAsset(asset)
                            }).catch(response => {
                                $snackbar.addWarning('Kon werkorder niet vinden, probeert u het later nogmaals.')
                                $loader.message = null
                            })
                        }
                        // asset
                        else if (this.notification.materialNumber && this.notification.materialNumber.length > 0) {
                            $asset.getAssetsByAssetNumber(this.notification.materialNumber[0]).then(response => {
                                let assets = JSON.parse(response.data)
                                if (assets.length === 0) {
                                    $snackbar.addWarning('Kon asset niet vinden, probeert u het later nogmaals.')
                                    $loader.message = null
                                }
                                else {
                                    processAsset(assets[0])
                                }
                            }).catch(response => {
                                $snackbar.addWarning('Kon asset niet vinden, probeert u het later nogmaals.')
                                $loader.message = null
                            })
                        }
                        else {
                            $snackbar.addWarning('Geen asset gevonden op de notificatie.')
                        }
                    }
                break
            }
        },

        /**
         * Open the associated workorder
         */
        openWorkOrder () {
            if (!this.notification.workOrderId || this.notification.workOrderId.length < 1) {
                return
            }
            if (this.$router.history.current.name === 'WorkOrders') {
                document.dispatchEvent(new CustomEvent('workOrdersParamsChange', {
                    detail: {
                        WO: this.notification.workOrderId[0]
                    }
                }))
            }
            else {
                this.$router.push({
                    name: 'WorkOrders',
                    params: {
                        WO: this.notification.workOrderId[0]
                    }
                })
            }
            this.markAsRead()
        },

        /**
         * Mark the item as read
         */
        markAsRead () {
            $notificationRead.markAsRead(this.notification.id)
        },

        /**
         * Get the date
         */
        getDate () {
            if (this.notification && this.notification.createdDate) {
                let createdDate = new Date(this.notification.createdDate)
                return $date.dayNames[createdDate.getDay()] + ' ' + createdDate.getDate() + ' ' + $date.monthNames[createdDate.getMonth()] + ' om ' + this.notification.createdDate.substring(11, 16)
            }
            return 'Geen datum'
        }
    }
}
</script>
