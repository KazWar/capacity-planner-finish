<template>
		<div class="content-full">
			<div class="data-monitoring asset-settings scrollable-y content-child content-footered" >
				<table>
					<thead>
					<tr>
						<th>Actief?</th>
						<th>Materieelserie</th>
						<th>Modeltype</th>
						<th>Onderhouds interval (dagen)</th>
						<th>Handmatig BWO onderhouds interval (dagen)</th>
						<th>Werkcapaciteit (uren)</th>
					</tr>
					</thead>
					<tbody>
					<template v-for="(item, itemIndex) in assetSettings">
						<tr>
							<td>
								<div class="checkbox no-border" :class="{'checked': item.hidden}" @click="toggleAssetHiddenStatus(item)">
									<input type="checkbox" v-model="item.hidden">
									<icon name="vinkje" size="45" color="#0079D3" v-if="!item.hidden"/>
								</div>
							</td>
							<td colspan="5">{{item.seriesCode}}</td>
						</tr>

						<tr v-for="(constructionType, constructionTypeIndex) in item.constructionTypes">
							<td></td>
							<td></td>

							<td>
								{{constructionType.constructionType}}
							</td>

							<td>
								<picker type="number" class="hideArrows asset-setting" label="Onderhouds interval" v-model="constructionType.materialInterval" afterText="dagen" :objData="constructionType" @saveConstructionType="saveConstructionType"/>
							</td>
							<td>
								<picker type="number" class="hideArrows asset-setting" label="Handmatig BWO onderhouds interval" v-model="constructionType.manualMaintenanceInterval" afterText="dagen" :objData="constructionType" @saveConstructionType="saveConstructionType"/>
							</td>
							<td>
								<picker type="number" class="hideArrows asset-setting" label="Werkcapaciteit" v-model="constructionType.workCapacity" afterText="uren" :objData="constructionType" @saveConstructionType="saveConstructionType"/>
							</td>
						</tr>
					</template>
					</tbody>
				</table>
			</div>
		</div>
</template>

<script>
	export default {
		data () {
			return {
				assetSettings: [],
				enableSavingConstructionType: false
			}
		},
		watch: {

		},
		beforeMount () {
			this.makeAssetSnapshot()
			setTimeout(() => {
				this.enableSavingConstructionType = true
			}, 3000)
		},
		methods: {
			makeAssetSnapshot () {
				this._api.makeAssetSnapshot().then((res) => {
					this.getAssetSettings()
				})
			},
			getAssetSettings () {
				this._api.getAssetsSeriesList().then(res => {
					this.assetSettings = res
				})
			},
			toggleAssetHiddenStatus (item) {
				item.hidden = !item.hidden

				let obj = {
					seriesCode: item.seriesCode,
					hidden: item.hidden
				}

				this._api.hideAssetsSeriesCode(obj).then((response) => {
					//
				})
			},
			saveConstructionType (data) {
				let obj = {
					data: data
				}

				if (this.enableSavingConstructionType) {
					this._api.saveAssetConstructionType(obj).then((res) => {
						//
					})
				}
			},
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
