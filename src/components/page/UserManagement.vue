<template>
    <div class="user-management">
        <div class="content">
			<div class="content-sidebar">
				<div class="content-sidebar-left">
					<Sidebar
						class="scrollable-y content-child content-footered"
						:items="sideBarItems"
						:selectedTab="selectedTab"
						@selectTab="selectTab"
						@downloadUserInfo="downloadUserInfo"
					/>
				</div>
				<div class="content-half-full">
					<div class="content-child-full">
						<div class="content-child-left">
							<div class="scrollable-y content-child content-footered">
								<TextInput :paddingless="false" placeholder="Zoek" v-model="search" class="search-box" :searchable="true" :clearable="false"/>
								<b-table
									:data="filter"
									:paginated="tableOptions.paginated"
									:per-page="tableOptions.perPage"
									:default-sort-direction="tableOptions.defaultSortDirection"
									:sort-icon="tableOptions.sortIcon"
									:pagination-simple="true"
									default-sort="arrivalDate"
									v-if="filter.length > 0"
								>
									<template slot-scope="props">
										<b-table-column field="firstName" label="Naam" sortable @click.stop="openUserModal(props.row)">
											{{ props.row.firstName }} {{ props.row.lastName }}
										</b-table-column>

										<b-table-column field="applicationType" label="Gebruikerstype" sortable @click.stop="openUserModal(props.row)">
											{{ props.row.applicationType }}
										</b-table-column>

										<b-table-column field="location.name" label="Standaard locatie" sortable @click.stop="openUserModal(props.row)">
											{{ props.row.location.name  }}
										</b-table-column>

										<b-table-column field="actions" label="">
											<button  @click="openUserModal(props.row)">
												<icon color="#0079D3" :size="30" name="aanpassen"></icon>
											</button>
										</b-table-column>
									</template>
								</b-table>
							</div>
						</div>
					</div>
				</div>
			</div>
        </div>
		<div class="footer">
			<div class="flex-wrap flex-right">
				<button class="button-orange" @click="openUserModal()">Gebruiker toevoegen</button>
			</div>
		</div>
		<modal v-model="displayDeleteModal" title="Gebruiker verwijderen">
			<div slot="content" style="padding-top: 10px;">
				Weet u zeker dat u deze gebruiker wilt verwijderen? Dit kan niet ongedaan gemaakt worden.
			</div>
			<div slot="buttons" style="padding-top: 20px;">
				<button class="button blue left" @click="closeDeleteModal()">Nee, terug</button>
				<button class="button red right" @click="deleteUser()">Ja, verwijderen</button>
			</div>
		</modal>
        <modal v-model="displayUserModal" :title="selectedUser.id ? 'Gebruiker aanpassen' : 'Nieuwe gebruiker'">
            <div slot="content" style="padding-top: 10px;">
                <TextInput placeholder="Kies Voornaam" v-model="selectedUser.firstName" :class="{'danger': formWarnings.indexOf('firstName') !== -1}" />
                <TextInput placeholder="Kies Achternaam" v-model="selectedUser.lastName" :class="{'danger': formWarnings.indexOf('lastName') !== -1}" />
                <TextInput placeholder="Kies E-mail" v-model="selectedUser.email" :class="{'danger': formWarnings.indexOf('email') !== -1}" />
                <TextInput :password="true" :placeholder="selectedUser.id ? 'Nieuw wachtwoord' : 'Kies wachtwoord'" v-model="selectedUser.password" :class="{'danger': formWarnings.indexOf('password') !== -1}" />
				<TreeSelect
					v-model="selectedUser.applicationType"
					:options="applicationTypes"
					options-label="value"
					label="Selecteer rol"
					:class="{'danger': formWarnings.indexOf('applicationType') !== -1}"
				/>
				<TreeSelect
					v-model="selectedUser.locationId"
					:options="locations"
					options-label="name"
					additionalSearch="station"
					label="Selecteer locatie"
					:class="{'danger': formWarnings.indexOf('locationId') !== -1}"
				/>
			</div>
            <div slot="buttons" style="padding-top: 20px;">
                <div class="delete" style="position: absolute; left: 20px;" v-if="selectedUser.id" @click="openDeleteModal()">
                    <div class="icon-container plus">
                        <icon :size="30" color="#DC0000" name="plus"></icon>
                    </div>
                    <div class="label">
                        Verwijderen
                    </div>
                </div>
                <button class="button right" @click="saveUser()">Opslaan</button>
            </div>
        </modal>
    </div>
</template>

<script>
/**
 * The user management page
 * @author Stan Hurks, OxPlus
 */
import $loader from '@/modules/loader-module'
import $snackbar from '@/modules/snackbar-module'
export default {
	components: {
		Sidebar: () => import('@/components/Sidebar')
	},
    data: function () {
        return {
        	selectedTab: 'users',
			sideBarItems: [
				{
					title: 'Gebruikers',
					icon: 'gebruiker',
					id: 'users'
				},
				{
					title: 'Download informatie',
					icon: 'mail',
					action: 'downloadUserInfo',
					id: 'users'
				}
			],
            activeMobileTab: 0,
            formWarnings: [],

            displayUserModal: false,

            displayDeleteModal: false,

            users: [],

            amountOfRows: 0,

            style: {
                colWidth: 325,
                colMargin: 20
            },

            selectedUser: {},

            initialUser: {
                firstName: null,
                lastName: null,
                email: null,
                password: null,
                applicationType: null,
                locationId: null
            },

            applicationTypes: ['SB', 'MBN', 'ADMIN', 'OB', 'DASHBOARD'].map(x => ({
                id: x,
                value: x
            })),

            tableOptions: {
                paginated: false,
                perPage: 15,
                currentPage: 1,
                defaultSortDirection: 'asc',
                sortIcon: "chevron-up"
            },
            search: ''
        }
    },

    created: function () {
        this.updateData()
    },

    watch: {
        displayUserModal: function () {
            if (!this.displayUserModal) {
                this.formWarnings = []
            }
        },

        displayDeleteModal: function () {
            if (!this.displayDeleteModal) {
                this.formWarnings = []
            }
        }
    },

    computed: {
		locations () {
			return this.$store.getters.GET_LOCATIONS
		},
        filter: function() {
            const regExp = new RegExp(this.search,"gi");
            const check = obj => {
                if (obj !== null && typeof obj === "object") {
                    return Object.values(obj).some(check)

                }
                if (Array.isArray(obj)) {
                    return obj.some(check)
                }

                return (typeof obj === "string" || typeof obj === "number") && regExp.test(obj);
            }
            return this.users.filter(check);

            // let data = [];
            // for (let i in this.users) {
            //     Object.keys(this.users[i]).forEach((key,index) => {
            //         let value = this.users[i][key];
            //         if(value && _.includes(value.toString().toLowerCase(), this.search.toString().toLowerCase())){
            //             data.push(this.users[i]);
            //             return;
            //         }
            //     });
            // }
            // data = _.uniq(data);
            // return data
        }
    },

    methods: {
		selectTab (tab) {
			this.selectedTab = tab
		},
        downloadUserEmails(){
            this._api.getUserEmails().then(res => {
                //
            })
            window.open('/users/getEmails');
        },
        downloadUserInfo(){
			this._api.downloadUserInformation()
				.then(res => {
					const url = window.URL.createObjectURL(new Blob([res]))
					const link = document.createElement('a')
					link.href = url
					link.setAttribute('download', 'Gebruikersinformatie.xlsx')
					document.body.appendChild(link)
					link.click()
				})
        },
        /**
         * Updates all data
         */
        async updateData () {
            $loader.message = 'Gebruikers ophalen'
			await this._api.getUserList()
				.then(async res => {
					this.users = res
					$loader.message = null
				}).catch(err => {
					console.log(err)
					$loader.message = null
					$loader.error = true
				})
        },


        /**
         * Opens the user modal
         * @param {object} user the user object to use
         */
        openUserModal (user) {
            if (user) {
                user.password = null
                this.selectedUser = Object.assign({}, user)
            }
            else {
                this.selectedUser = Object.assign({}, this.initialUser)
            }
            this.displayUserModal = true
        },

        /**
         * Opens the delete modal
         */
        openDeleteModal () {
            this.displayUserModal = false
            this.displayDeleteModal = true
        },

        /**
         * Closes the delete modal
         */
        closeDeleteModal () {
            this.displayDeleteModal = false
            this.displayUserModal = true
        },

        /**
         * Deletes the user
         */
        deleteUser () {
            $loader.message = 'Gebruiker verwijderen'
			this._api.deleteUser(this.selectedUser.id)
				.then(res => {
					this.updateData()
					this.selectedUser = {}
					this.displayDeleteModal = false
					$snackbar.add('Gebruiker verwijderd')
					$loader.message = null
					this.$forceUpdate()
				})
				.catch(err => {
					console.log(err)
					$loader.message = null
					$loader.error = true
				})
        },

        /**
         * Attempt to add a user
         */
        saveUser () {
            if (!this.validateUser()) {
                return
            }

            if (!this.selectedUser.id) {
                $loader.message = 'Gebruiker toevoegen'
				this._api.addUser(this.selectedUser)
					.then(res => {
						this.updateData()
						this.selectedUser = {}
						this.displayUserModal = false
						$snackbar.add('Gebruiker toegevoegd')
						$loader.message = null
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
						$loader.error = true
					})
            }
            else {
                $loader.message = 'Gebruiker aanpassen'
				this._api.editUser(this.selectedUser)
					.then(res => {
						this.updateData()
						this.selectedUser = {}
						this.displayUserModal = false
						$snackbar.add('Gebruiker aangepast')
						$loader.message = null
					})
					.catch(err => {
						console.log(err)
						$loader.message = null
						$loader.error = true
					})
            }
        },

        /**
         * Validates the user
         */
        validateUser () {
            this.formWarnings = []
            if (!this.selectedUser) {
                return false
            }
            let properties = Object.keys(this.initialUser)
            for (let propertyIndex in properties) {
                let propertyName = properties[propertyIndex]
                if (propertyName === 'password' && this.selectedUser.id) {
                    continue
                }
                let value = this.selectedUser[propertyName]
                if (value === null || value === '') {
                    this.formWarnings.push(propertyName)
                }
            }
            return this.formWarnings.length === 0
        },

        /**
         * TODO: generic
         * Calculate the width of a scrollbar in the application
         */
        calculateScrollBarWidth () {
            var scrollDiv = document.createElement('div')
            scrollDiv.style.width = '100px'
            scrollDiv.style.height = '100px'
            scrollDiv.style.overflow = 'scroll'
            scrollDiv.style.position = 'absolute'
            scrollDiv.style.top = '-9999px'
            document.body.appendChild(scrollDiv)
            var scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
            document.body.removeChild(scrollDiv)
            return scrollBarWidth
        },
    }
}
</script>
