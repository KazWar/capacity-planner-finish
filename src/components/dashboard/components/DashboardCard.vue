<template>
    <div class="card">
        <h1>
            {{title}}
            <i class="mdi mdi-arrow-collapse" v-if="!collapsed" @click="toggleContent()"></i>
            <i class="mdi mdi-arrow-expand" v-else @click="toggleContent()"></i>
        </h1>
        <slot name="content" v-if="!collapsed"></slot>
    </div>
</template>

<script>
    export default {
        props: ['title'],
        data: function () {
            return {
                collapsed: false
            }
        },

        computed: {
            
        },

        mounted: function () {
            
        },

        watch: {
            
        },

        methods: {
            toggleContent(){
                this.collapsed = !this.collapsed;
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "./src/assets/scss/dashboard/components/page-layout";
    h1 {
        float: left;
        width: 100%;
        clear: both;
        color: var(--d-main-white);
        .mdi{
            float: right;
            cursor: pointer;
            background: var(--d-black);
            width: 35px;
            height: 35px;
            text-align: center;
            line-height: 35px;
            vertical-align: middle;
            position: relative;
            // top: -5px;
            color: var(--d-main-white);
            &:hover{
                color: var(--d-red); 
            }
        }
    }
</style>
