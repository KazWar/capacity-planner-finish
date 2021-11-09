<template>
    <aside>
        <ul class="nav">
            <li v-for="link in navLinks" :class="{'active': link.toggle}">
                <div class="main-nav-item" @click="setActive(link)">
                    <i class="mdi link-icon" :class="link.icon"></i>

                    <span class="title">{{link.title}}</span>

                    <i class="mdi mdi-chevron-right push-right"
                        v-if="link.subItems.length > 0"
                        :class="{'active': link.toggle}">
                    </i>
                </div>
                <ul class="nested-items" v-if="link.subItems">
                    <li v-for="nestedItem in link.subItems" @click="goTo(nestedItem.link)" :class="{'current': currentUrlId == nestedItem.title}">
                        <span>
                            {{nestedItem.title}}
                        </span>
                    </li>
                </ul>
            </li>
        </ul>
    </aside>
</template>

<script>

    export default {
        data: function () {
            return {
                navLinks: [
                    {
                        title: 'Overzicht',
                        link: '/dashboard/overzicht',
                        toggle: false,
                        icon: 'mdi-home-variant-outline',
                        subItems: []
                    }, {
                        title: 'Materieel',
                        toggle: false,
                        icon: 'mdi-dock-window',
                        link: null,
                        subItems: [
                            {
                                title: 'DDZ',
                                link: '/dashboard/materieel/DDZ',
                            }, {
                                title: 'FLIRT-HRN',
                                link: '/dashboard/materieel/FLIRT-HRN',
                            }, {
                                title: 'FLIRT-TAG',
                                link: '/dashboard/materieel/FLIRT-TAG',
                            }, {
                                title: 'HST-PRIO',
                                link: '/dashboard/materieel/HST-PRIO',
                            }, {
                                title: 'ICM',
                                link: '/dashboard/materieel/ICM',
                            }
                        ]
                    }, {
                        title: 'Knopen',
                        toggle: false,
                        icon: 'mdi-train',
                        link: null,
                        subItems: []
                    },
                ],
                currentUrlId: this.$router.currentRoute.params.id
            }
        },

        computed: {

        },

        mounted: function () {
            this.getLocations();
        },

        watch: {
            '$route': function(to, from) {

                this.currentUrlId = this.$router.currentRoute.params.id
            }
        },

        methods: {
            setActive(link){
                if(link.subItems && link.subItems.length > 0){
                    link.toggle = !link.toggle;
                } else {
                    link.toggle = !link.toggle;
                    this.goTo(link.link);
                }
            },
            goTo(link){
                this.$router.push({ path: link })
            },
            getLocations(){
                $location.getList().then(response => {
                    let arr = JSON.parse(response.data);

                    let filteredLocations = [];
                    for(let i in arr){
                        if(arr[i].knoopPunt && arr[i].knoopPunt !== ''){
                            let location = arr[i];
                            location.title = location.knoopPunt;
                            location.link = '/dashboard/knopen/' + location.knoopPunt;
                            filteredLocations.push(location);
                        }

                    }

                    filteredLocations = _.uniqBy(filteredLocations, 'knoopPunt');

                    this.navLinks[2].subItems = _.sortBy(filteredLocations, ['title']);
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "./src/assets/scss/dashboard/global";
    @import "./src/assets/scss/dashboard/components/sidebar";
</style>
