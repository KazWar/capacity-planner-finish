<template>
    <header :class="{'collapsed': collapsed}">
        <div class="push-left">
            <h1>
                <i>NS</i><span> PRODUCTIEDASHBOARD</span><span> {{ pageTitle.toUpperCase() }}</span>
            </h1>
            <button @click="toggleMenu();">
                <i class="mdi mdi-arrow-left-bold"></i>
            </button>
        </div>
        <div class="push-right">
            <button @click="logout()">
                Logout
                <i class="mdi mdi-location-exit"></i>
            </button>
        </div>
    </header>
</template>

<script>

    export default {
        props: ['collapsed'],
        data: function () {
            return {
                pageTitle: ''
            }
        },

        mounted: function () {
            this.getTopTitle();
        },

        watch: {
            '$route': function(to, from) {
                this.getTopTitle();
            }
        },

        methods: {
            toggleMenu(){
                this.$emit('toggleMenu');
            },
            getTopTitle(){
                if(this.$router.currentRoute.params.id){
                    this.pageTitle = this.$router.currentRoute.params.id
                } else {
                    this.pageTitle = '';
                }
            },
            logout () {
                $user.logout().then(response => {
                    localStorage.removeItem('sessionId')
                    localStorage.removeItem('locationId')
                    localStorage.removeItem('locationName')
                    localStorage.removeItem('userId')
                    localStorage.removeItem('userEmail')
                    localStorage.removeItem('userFirstName')
                    localStorage.removeItem('userLastName')

                    this.$router.push({
                        name: 'LoginPlaceholder',
                        params: {
                            message: 'U bent succesvol uitgelogd.'
                        }
                    })
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "./src/assets/scss/dashboard/global";
    @import "./src/assets/scss/dashboard/components/header";
</style>
