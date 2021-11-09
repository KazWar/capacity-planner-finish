<template>
	<div class="content-half-full">
		<div class="content-child-full">
			<div class="scrollable-y content-child content-footered">
				<div class="settings">
					<template>
						<div class="checkbox item"  :class="{'checked': settings.assetToMaximo}" >
							<input type="checkbox" v-model="settings.assetToMaximo" :id='"assetToMaximo" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="settings.assetToMaximo"/>
							<label :for='"assetToMaximo" + settings.id'>Automatisch binnen en buitenplussen</label>
						</div>

						<div class="checkbox item"  :class="{'checked': settings.autoplanAndAssignSB}" >
							<input type="checkbox" v-model="settings.autoplanAndAssignSB" :id='"autoplanAndAssignSB" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="settings.autoplanAndAssignSB"/>
							<label :for='"autoplanAndAssignSB" + settings.id'>Automatisch plannen en toewijzen SB</label>
						</div>

						<div class="checkbox item"  :class="{'checked': settings.autoAssignLocation}" >
							<input type="checkbox" v-model="settings.autoAssignLocation" :id='"autolocationBool" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="settings.autoAssignLocation"/>
							<label :for='"autolocationBool" + settings.id'>MBN Automatisch toewijzen werkorders aan locatie</label>
						</div>

						<div class="checkbox item"  :class="{'checked': settings.autoFillBWOCron}" >
							<input type="checkbox" v-model="settings.autoFillBWOCron" :id='"autoFillBWOCron" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="settings.autoFillBWOCron"/>
							<label :for='"autoFillBWOCron" + settings.id'>BWO automatisch vullen</label>
						</div>

						<div class="checkbox item"  :class="{'checked': settings.autoFillBWOToMaximo}" >
							<input type="checkbox" v-model="settings.autoFillBWOToMaximo" :id='"autoFillBWOToMaximo" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="settings.autoFillBWOToMaximo"/>
							<label :for='"autoFillBWOToMaximo" + settings.id'>Auto fill BWO to Maximo</label>
						</div>

						<div class="checkbox item"  :class="{'checked': retrieveDataByApi}" >
							<input type="checkbox" v-model="retrieveDataByApi" :id='"retrieveDataByApi" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="retrieveDataByApi"/>
							<label :for='"retrieveDataByApi" + settings.id'>Data op te halen via API</label>
						</div>


						<!-- CPO-1495 -->
						<div class="checkbox item"  :class="{'checked': !settings.disableESB}" >
							<input type="checkbox" v-model="settings.disableESB" :id='"disableESB" + settings.id'>
							<icon name="vinkje" size="45" color="#0079D3" v-if="!settings.disableESB"/>
							<label :for='"disableESB" + settings.id'>ESB inkomende berichten verwerken</label>
						</div>

						<div class="item">
							<label for="">Data versturen via</label>
							<TreeSelect
								v-model="maximoSelectedProcess"
								:options="maximoProcessOptions"
								options-label="label"
								options-id="id"
								label="Data versturen via"
								:borderless="true"
								:multiple="false"
								:selectSize="52"
								:noBackground="true"
								:disableBranchNodes="true"
								:clearable="false"
							/>
						</div>

						<div class="item">
							<TextInput
								:paddingless="true"
								:number="true"
								title="Horizon automatisch toewijzen"
								placeholder="Horizon automatisch toewijzen"
								v-model="settings.autoAssignLocationHorizon"
								description="uur."
								class="small-title"
							/>
						</div>
						<div class="item">
							<TextInput
								:paddingless="true"
								:number="true"
								title="Horizon autoplan werkorders"
								placeholder="Horizon autoplan werkorders"
								v-model="settings.autoAssignMechanicHorizon"
								description="uur."
								class="small-title"
							/>
						</div>
						<div class="item">
							<TextInput
								:paddingless="true"
								:number="true"
								title="Horizon MBN Quick Win locaties"
								placeholder="Horizon MBN Quick Win locaties"
								v-model="settings.quickWinHorizon"
								description="uur."
								class="small-title"
							/>
						</div>
						<div class="item">
							<TextInput
								:paddingless="true"
								:number="true"
								title="Horizon BWO vullen"
								placeholder="Horizon BWO vullen"
								v-model="settings.autoFillBWOHorizon"
								description="dagen"
								class="small-title"
							/>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import $snackbar from '@/modules/snackbar-module'
	export default {
		data () {
			return {
				settings: null,
				maximoSelectedProcess: null,
				retrieveDataByApi: false,
				maximoProcessOptions: [
					{
						label: 'ESB',
						id: 1
					}, {
						label: 'API',
						id: 2
					}, {
						label: 'Communicatie staat uit',
						id: 3
					}
				],
				watchSettings: false,
			}
		},
		watch: {
			settings: {
				handler: function () {
					if (this.watchSettings) {
						this.editSettings()
					}
				},
				deep: true
			},
			maximoSelectedProcess () {
				if(this.maximoSelectedProcess == 1) {
					this.settings.sendDataToMaximoAPI = false
				} else if (this.maximoSelectedProcess == 2) {
					this.settings.sendDataToMaximoAPI = true
				} else {
					this.settings.sendDataToMaximoAPI = null
				}
			},
			retrieveDataByApi () {
				this.settings.workodersMaximoUpdateCron = this.retrieveDataByApi;
				this.settings.dataMaximoUpdateCron = this.retrieveDataByApi;
			}
		},
		beforeMount () {
			this.getSettings()
		},
		methods: {
			editSettings () {
				if (this.settings) {
					this._api.updateSettings(this.settings).then(res => {
						$snackbar.add('Bijgewerkt')
					})
				}
			},
			getSettings () {
				this.settings = []
				this._api.getSettingsList().then(res => {
					this.settings = res
					this.maximoSelectedProcess = JSON.stringify(this.settings.sendDataToMaximoAPI)
					if (this.settings.sendDataToMaximoAPI == false) {
						this.maximoSelectedProcess = 1
					} else if (this.settings.sendDataToMaximoAPI == true) {
						this.maximoSelectedProcess = 2
					} else {
						this.maximoSelectedProcess = 3
					}

					if(res.workodersMaximoUpdateCron && res.dataMaximoUpdateCron) {
						this.retrieveDataByApi = true;
					}

					setTimeout(() => {
						this.watchSettings = true
					}, 1000)
				}).catch(response => {
					//
				})
			},
		}

	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
