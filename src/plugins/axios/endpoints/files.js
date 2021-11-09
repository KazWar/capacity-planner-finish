export default {
	download: (fileName) => 'fileStorage/download/?container=static&file=' + fileName + '&access_token=' + localStorage.getItem('sessionId'),
	downloadFile: (containerName, fileName) => 'Containers/' + containerName + '/download/' + fileName + '?access_token=' + localStorage.getItem('sessionId')
}
