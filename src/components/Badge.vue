<style lang="scss" scoped>
    .badge {
        z-index: 1000;
        position: absolute;
        top: -10px;
        right: -10px;
        vertical-align: top;
        line-height: 20px;
        text-align: center;
        font-size: 13px;
        background: #FFC917;
        color: #003082;
        border-radius: 10px;
        height: 20px;
        width: 20px;

        &.two-digits {
            width: 40px;
            right: -20px;
        }
    }
</style>

<template>
    <div class="badge" v-if="!hideOnZero || value > 0" :class="{'two-digits': value > 9}">{{value}}</div>
</template>

<script>
export default {
    props: ['value', 'hideOnZero']
}
</script>
