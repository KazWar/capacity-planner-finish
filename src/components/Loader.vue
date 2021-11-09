<style lang="scss" scoped>
    @import "../assets/scss/variables";

    #loader {
        z-index: 1000000002;
        background: map-get($colors, light-blue);
        position: fixed;
        width: auto;
        height: auto;
        color: map-get($colors, light-grey);
        font-weight: bold;
        bottom: 10px;
        left: 10px;
        font-size: 1em;
        text-align: left;
        border-left: 3px solid map-get($colors, default-blue);
        -webkit-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);
        -moz-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);
        opacity: 1;
        &:not(.show) {
            opacity: 0;
        }
        &.error{
            border-left: 3px solid map-get($colors, default-red);
            background: map-get($colors, default-red)
        }
        .message {
            display: inline-block;
            width: auto;
            vertical-align: middle;
        }

        .spinner {
            position: absolute;
            top: 10px;
        }

        .message {
            max-width: 50vw;
            width: 243px;
            padding: 10px 0;
            padding-right: 10px;
            padding-left: 30px;

            span{
                clear: both;
                display: block;
                cursor: pointer;
                text-decoration: underline;
            }
        }
    }
</style>

<template>
    <div id="loader" :class="{'show': (message != null || error ), 'error': error}" v-if="(message !== null || error)">
        <svg class="spinner" width="20px" height="20px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
           <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
        </svg>
        <div class="message">
            {{message}}
        </div>
    </div>
</template>

<script>
export default {
    props: ['message', 'error'],

    name: 'loader',

    mounted(){
    },

    methods: {
        reloadPage(){
            window.location.reload();
        }
    }
}
</script>
