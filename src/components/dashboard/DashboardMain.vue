<template>
    <div class="d-root">
        <d-header :class="{'collapsed': collapsed}" @toggleMenu='toggleMenu'/>

        <div class="content-wrap" :class="{'collapsed': collapsed}">
            <d-sidebar :class="{'collapsed': collapsed}"/>
            <router-view/>
        </div>
    </div>
</template>

<script>
    import DashboardHeader from '@/components/dashboard/components/DashboardHeader.vue'
    import DashboardSidebar from '@/components/dashboard/components/DashboardSidebar.vue'

    export default {
        components: {
            'd-header': DashboardHeader,
            'd-sidebar': DashboardSidebar

        },
        data: function () {
            return {
                collapsed: false,
                locations: []
            }
        },
        methods: {
            toggleMenu() {
                this.collapsed = !this.collapsed
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "./src/assets/scss/dashboard/global";
</style>
