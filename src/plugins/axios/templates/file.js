
import { apis, endpoints } from '../axios'

const fileDownload = (name) => apis.get(endpoints.files.download(name), {
		responseType: 'blob'
	})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const fileDownloadFull = (containerName, fileName) => apis.get(endpoints.file.downloadFile(containerName, fileName), {
		responseType: 'blob'
	})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	fileDownload,
	fileDownloadFull,
}
