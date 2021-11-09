<template>
	<div class="content-half">
		<div class="uploader-container scrollable-y content-child content-footered">
			<div class="uploader">
				<div class="title">
					Upload een handleiding (.pdf)
				</div>
				<div class="upload-form" id="upload-form" @click="onClickUploader()">
					<input
						type="file"
						:style="{position: 'absolute', left: '-200%', top: '-200$'}"
						@change="handleSelectedFile"
						accept=".pdf"
					>
					<span v-if="!selectedFile.name">
						Sleep hier je bestand naartoe of
					</span>
					<span v-if="!selectedFile.name" class="blue">
						selecteer bestand
					</span>
					<span v-else>
						{{selectedFile.name}}
					</span>
				</div>
				<div class="checkbox-section role-selection">
					<div class="checkbox item"  v-for="item in rolesList" :class="{'checked': item.status}" >
						<input type="checkbox" v-model="item.status" :id='item.name'>
						<icon name="vinkje" size="45" color="#0079D3" v-if="item.status"/>
						<label :for='item.name'>{{item.name}}</label>
					</div>
				</div>
				<div class="bottom">
					<div class="right">
						<button @click="upload('pdf', 'static')">Upload</button>
					</div>
				</div>
			</div>
		</div>
		<div class="last-uploads-container scrollable-y content-child content-footered">
			<div class="last-uploads">
				<div class="title">
					Reeds geuploade bestanden
				</div>
				<div class="content">
					<div class="upload"
						 v-for="(upload, index) in uploads"
						 :key="index"
						 @click="downloadFile(upload.documentTitle)"
					>
						<div class="left">
							<span class="blue bold">
								{{upload.uploaderName}}
							</span><span>
								laatst geupload
							</span><span class="blue">
								{{upload.date}}
							</span><span>
								om
							</span><span class="blue">
								{{upload.time}}
							</span><span>
								genaamd
							</span><span class="blue">
								{{upload.documentTitle}}
							</span>
						</div>
						<div class="right">
							<span class="download">
								Download
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import $loader from '@/modules/loader-module'
	import $snackbar from '@/modules/snackbar-module'
	export default {
		data () {
			return {
				selectedFile: {
					name: null,
					content: null
				},
				rolesList: [
					{
						name: 'MBN',
						status: false
					},
					{
						name: 'SB',
						status: false
					},
					{
						name: 'ADMIN',
						status: false
					}
				],
				uploads: []
			}
		},
		methods: {
			onClickUploader (event) {
				let inputFileElement = this.$el.querySelector('input[type="file"]')
				if (inputFileElement) {
					inputFileElement.click()
				}
			},
			handleSelectedFile (e) {
				this.selectedFile = {
					name: e.target.files[0].name,
					content: e.target.files[0]
				}
			},
			upload (status, container) {
				let uploadOptions
				let selectedRoles = []
				for (let i = 0; i < this.rolesList.length; i++) {
					if (this.rolesList[i].status) {
						selectedRoles.push(this.rolesList[i].name)
					}
				}
				if (status == 'xls') {
					if (!this.selectedFile.name) {
						$snackbar.addWarning('Gelieve een bestand te kiezen.')
						return
					}
					if (!this.selectedRegionId) {
						$snackbar.addWarning('Gelieve een locatie te kiezen.')
						return
					}

					uploadOptions = {
						containerName: container, // arrivalInformation, static
						regionId: this.selectedRegionId,
						file: this.selectedFile.content,
						roles: JSON.stringify(selectedRoles)
					}
				}
				else if (status == 'pdf') {
					if (!this.selectedFile.name) {
						$snackbar.addWarning('Gelieve een bestand te kiezen.')
						return
					}
					uploadOptions = {
						containerName: container, // arrivalInformation, static
						file: this.selectedFile.content,
						roles: JSON.stringify(selectedRoles)
					}
				}

				$loader.message = 'Handleiding uploaden'
				$container.upload(uploadOptions).then(response => {
					$snackbar.add('Handleiding geüpload')
					this.selectedFile = {
						name: null,
						content: null
					}
					for (let i = 0; i < this.rolesList.length; i++) {
						this.rolesList[i].status = false
					}
					$loader.message = null
				})
			},
			downloadFile (fileName) {
				let open = window.open(this._api.fileDownloadFull('arrivalInformation', fileName), '_blank')
				if (!open) {
					$snackbar.addWarning('Gelieve pop-ups toe te staan in de browser om dit bestand te downloaden.')
				}
			}
		}
	}
</script>

<style lang="scss" scoped src="../../../assets/scss/pages/data/data.scss" />
