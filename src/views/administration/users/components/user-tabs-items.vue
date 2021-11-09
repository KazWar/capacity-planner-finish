<script>
import { permissionsTable, inputTooltipRight } from '@/common/components'

export default {
	name: 'UserTabsItems',
	components: { permissionsTable, inputTooltipRight },
	props:['tab','user'],
	data () {
		return {
			defaultSelected:{
				name: 'Administrator',
				icon: 'mdi-account-tie',
				color: '#48C9B0',
			},
			items:[
				{
					name: 'Administrator',
					icon: 'mdi-account-tie',
					color: '#48C9B0',
				},
				{
					name: 'Regular User',
					icon: 'mdi-account',
					color: '#F0B27A',
				},
				{
					name: 'Guest User',
					icon: 'mdi-briefcase-account',
					color: '#C39BD3',
				}
			]
		}
	}
}
</script>

<template>
	<v-tabs-items v-model="tab">
		<v-tab-item>
			<!--This can be dynamically generated-->
			<v-container style="margin: 0">
				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							E-Mail
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							readonly
							disabled
							filled
							dense
							:value="user.username"
							hide-details="true"
						/>
					</v-col>
					<v-col cols="1" align-self="center" class="user-tooltip">
						<input-tooltip-right
							text="User e-mail will be used to log into the application.">
						</input-tooltip-right>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Description
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							filled
							dense
							:value="user.description"
							hide-details="true"
						/>
					</v-col>
					<v-col cols="1" align-self="center" class="user-tooltip">
						<input-tooltip-right
							text="Detailed description of the account.">
						</input-tooltip-right>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Profile
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-select
							filled
							dense
							hide-details="true"
							:items="items"
							v-model="defaultSelected"
							:menu-props="{ bottom: true, offsetY: true }"
						>

							<template v-slot:selection = {item}>
								<v-icon :color="item.color">
									{{item.icon}}
								</v-icon>
								<v-card-text class="font-weight-bold">
									{{ item.name }}
								</v-card-text>
							</template>

							<template v-slot:item = {item}>
								 <v-icon :color="item.color">
									 {{item.icon}}
								 </v-icon>
								<v-card-text class="font-weight-bold">
									{{ item.name }}
								</v-card-text>
							</template>
						</v-select>
					</v-col>
					<v-col cols="1" align-self="center" class="user-tooltip">
						<input-tooltip-right
							text="Level determines which permissions the user has access to."
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							First Name
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							filled
							dense
							:value="user.firstName"
							hide-details="true"
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Last Name
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							filled
							dense
							:value="user.lastName"
							hide-details="true"
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Phone Number
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							filled
							dense
							:value="user.phoneNr"
							hide-details="true"
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Is Active?
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-switch
							hide-details
							inset
							color="success"
							:value="user.active"
						/>
					</v-col>
					<v-col cols="1" align-self="center" class="user-tooltip">
						<input-tooltip-right
							text="Activate or deactivate an user. Deactivated users cannot log into the system."
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Created on
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							filled
							readonly
							disabled
							dense
							hide-details="true"
							:value="user.createdOn ? user.createdOn: new Date().toString()"
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col cols="2">
						<v-subheader class="user-label">
							Last updated by
						</v-subheader>
					</v-col>
					<v-col cols="4">
						<v-text-field
							filled
							readonly
							disabled
							dense
							hide-details="true"
							:value="user.editedOn"
						/>
					</v-col>
				</v-row>

				<v-row style="margin: 0">
					<v-col>
						<v-btn
							class="button-save"
							depressed
							color="success"
							large
							@click="addUser()">
							Save
						</v-btn>
					</v-col>
				</v-row>
			</v-container>
		</v-tab-item>


		<v-tab-item>
			<permissionsTable :permissions="user.permissions"/>
		</v-tab-item>

		<v-tab-item>
			<v-card flat>
				<v-card-text>
					This tab is under construction...
				</v-card-text>
			</v-card>
		</v-tab-item>
	</v-tabs-items>
</template>

<style lang="scss" scoped>

.button-save{
	width: 560px;
}

.user-label{
	font-size: small;
	font-family:"Verdana", sans-serif
}

.user-tooltip{
	padding: 0;
}

</style>
