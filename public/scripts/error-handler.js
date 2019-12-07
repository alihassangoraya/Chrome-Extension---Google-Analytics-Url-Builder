window.onerror = function (msg, url, lineNo, columnNo, error) {
	var message = [
		'Message: ' + msg,
		'URL: ' + url,
		'Line: ' + lineNo,
		'Column: ' + columnNo,
		'Error object: ' + JSON.stringify(error)
	].join(' - ');

	if (ga) {
		ga('send', 'event', 'JS ERROR', message);
	}
	
	return false;
};