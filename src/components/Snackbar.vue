<style lang="scss" scoped>
    @import "../assets/scss/variables";

    .snackbar {
        position: fixed;
        transition: all 0.3s ease;
        width: 300px;
        text-align: center;
        height: auto;
        background: map-get($colors, light-blue);
        color: white;
        z-index: 100000000001;

        padding: 10px;
        border-left: 3px solid map-get($colors, default-blue);
        margin-bottom: 10px;
        -webkit-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);
        -moz-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);

        &.warning {
            background: salmon;
            border-left: 3px solid map-get($colors, default-red);
        }

        &:not(.show), &.hide {
            opacity: 0;
            margin-left: -310px;
            transition: all 0.3s ease;
        }
    }
</style>

<template>
    <div class="snackbar-container">
        <div :class="entry.classes" :data-id="entry.id" :data-transitionDone="entry.transitionDone" class="snackbar" v-for="(entry, index) in snackbar.entries" :key="index" :style="positions[entry.id]">{{entry.content}}</div>
    </div>
</template>

<script>
import $snackbar from '@/modules/snackbar-module'

export default {
    data: function () {
        return {
            positions: {
            },

            entriesUpdated: false
        }
    },

    props: ['snackbar'],

    watch: {
        'snackbar.entries': {
            handler: function () {
                this.onSnackbarEntriesChange()
            },
            deep: true
        }
    },

    created: function () {
        window.addEventListener('resize', this.calculatePositions)
    },

    mounted: function () {
        this.calculatePositions(0)
    },

    beforeUpdate: function () {
        this.removeExpiredEntries()
    },

    updated: function () {
        if (this.entriesUpdated) {
            this.calculatePositions(0)
            this.entriesUpdated = false
        }
    },

    beforeDestroy: function () {
        window.removeEventListener('resize', this.calculatePositions)
    },

    methods: {
        /**
         * When the snackbar entries change
         */
        onSnackbarEntriesChange () {
            this.entriesUpdated = true
        },

        /**
         * Removes the entries that are expired from the DOM and from the list of entries in the snackbar module
         */
        removeExpiredEntries () {
            for (var entryIndex = $snackbar.entries.length; entryIndex >= 0; --entryIndex) {
                var entry = $snackbar.entries[entryIndex]
                if (!entry) {
                    continue
                }

                var element = this.$el.querySelector('.snackbar[data-id="' + entry.id + '"]')
                if (!element) {
                    continue
                }

                if (entry.timeoutDone && !entry.transitionStarted) {
                    element.className += ' hide'
                    entry.transitionStarted = true
                }
                else if (entry.timeoutDone && entry.transitionStarted && entry.transitionDone) {
                    $snackbar.entries.splice(entryIndex, 1)
                    this.entriesUpdated = true
                }
            }
        },

        /**
         * Calculate the positions for the DOM elements generated for each snackbar entry.
         * To prevent bugs a timeout will loop through this recursively for a set amount of times.
         * @param {number} recurseCounter the amount of times this method has been recursed so far
         */
        calculatePositions (recurseCounter) {
            var entries = this.$el.querySelectorAll('.snackbar')
            this.positions = {}

            var margin = 10
            var maxHeight = window.innerHeight - 70
            var currentHeight = 0
            var currentLeft = 0

            for (var index = 0; index < entries.length; index++) {
                var entry = entries[index]

                if (index > 0) {
                    currentHeight += entries[index - 1].offsetHeight + margin
                }
                else {
                    currentHeight = 40 + margin
                }

                if (currentHeight > maxHeight) {
                    currentLeft += entry.offsetWidth + margin
                    currentHeight = 40 + margin
                }

                this.positions[Number(entry.getAttribute('data-id'))] = {
                    'left': currentLeft + margin + 'px',
                    'top': currentHeight - 40 + 'px'
                }

                if (entry.className.indexOf('show') === -1) {
                    entry.className += ' show'
                }
            }

            if (recurseCounter < 10) {
                recurseCounter++
                setTimeout(() => {
                    this.calculatePositions(recurseCounter)
                }, 100)
            }
        }
    }
}
</script>
