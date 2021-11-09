import { apis, endpoints } from '../axios'
import { BaseTemplate } from './base-template'
import { HTTPRequestMethod } from '@/common/model'

const updateSettings = (obj) => apis.post(endpoints.settings.updateSettings, {data: obj})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getSettingsList = (obj) => BaseTemplate.request(endpoints.settings.getList, HTTPRequestMethod.Get, {data: obj})


export {
	updateSettings,
	getSettingsList
}
