function shortenUrl(longUrl, callback) {
	chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
		if (!token) {
			return;
		}
		var request = $.ajax({
			url: "https://www.googleapis.com/urlshortener/v1/url",
			type: 'POST',
			contentType: 'application/json',
			data: '{longUrl:"' + longUrl + '"}',
			dataType: 'json',
			beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + token); }
		});
		request.done(function (data) {
			callback({ status: 'success', url: data.id });
		});
		request.fail(function () {
			chrome.identity.removeCachedAuthToken({ token: token }, function () { });
		});
	});
}

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === "install") {
		chrome.tabs.create({ url: "http://www.quickwin.io/extension/" });
		if (!localStorage['combinations']) {
			localStorage['combinations'] = "[{\"combinationName\":\"Facebook cpc\",\"source\":\"Facebook\",\"medium\":\"cpc\",\"term\":\"{{ad.name}}\",\"content\":\"{{adset.name}}\",\"campaign\":\"{{campaign.name}}\",\"isDefault\":false}," +
				"{\"combinationName\":\"Facebook Page\",\"source\":\"Facebook\",\"medium\":\"Social\",\"term\":\"\",\"content\":\"\",\"campaign\":\"Promotion\",\"isDefault\":false}," +
				"{\"combinationName\":\"Outbrain\",\"source\":\"Outbrain\",\"medium\":\"Content Discovery\",\"term\":\"{{ad_title}}\",\"content\":\"{{origsrcname}}\",\"campaign\":\"Promotion\",\"isDefault\":false}," +
				"{\"combinationName\":\"Taboola\",\"source\":\"Taboola\",\"medium\":\"Content Discovery\",\"term\":\"{title}\",\"content\":\"{site}\",\"campaign\":\"Promotion\",\"isDefault\":false}," +
				"{\"combinationName\":\"My Newsletter\",\"source\":\"Newsletter\",\"medium\":\"email\",\"term\":\"List Name\",\"content\":\"\",\"campaign\":\"Promotion\",\"isDefault\":false}]";
		}
	}
});

chrome.runtime.setUninstallURL("http://www.quickwin.io/uninstall/");

function revokeToken(callback) {
	chrome.identity.getAuthToken({ 'interactive': false },
		function (current_token) {
			if (!chrome.runtime.lastError) {
				chrome.identity.removeCachedAuthToken({ token: current_token }, function () { });
				$.ajax({
					type: 'GET',
					url: 'https://accounts.google.com/o/oauth2/revoke?token=' + current_token,
					contentType: "application/json",
					dataType: 'json',
					success: function () {
						callback();
					}
				});
			}
		});
}

function checkGoogleToken(callback) {
	chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
		if (chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		}
		callback(token);
	});
}

function grantAccess(callback) {
	chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
		callback(token);
	});
}

function authenticateBitly(callback) {
	var clientId = '4e9b817d9524d77866db5252bfa1acd995c8891c';
	var redirectUri = chrome.identity.getRedirectURL("oauth2");
	var authUrl = "https://bitly.com/oauth/authorize?client_id=" + clientId + "&redirect_uri=" + redirectUri;

  chrome.identity.launchWebAuthFlow({'url': authUrl, 'interactive': true}, function (resultUrl) {
    // Handle case when use turn off the auth flow window
    // In that case, we simple do nothing.
    if (!resultUrl || chrome.runtime.lastError) {
      callback(null);
      return;
    }
    // console.log(chrome.runtime.lastError);
    var code = getParameterByName("code", resultUrl);
    $.ajax({
      type: "POST",
      url: "https://api-ssl.bitly.com/oauth/access_token",
      data: {
        client_id: clientId,
        client_secret: "cc5c8432861a2a819ee48e10a3fa464c2ceb22a8",
        code: code,
        redirect_uri: redirectUri
      },
      success: function (data) {
        // Handle when users cancel launching web flow auth
        if (data && data.status_code === 500) {
          callback(null);
          return;
        }
        var accessToken = parseResult(data).access_token;
        callback(accessToken);
      }
    });
  });

}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function parseResult( queryString ) {
	var params = {}, temp, i, l;
	// Split into key/value pairs
	var queries = queryString.split("&");
	// Convert the array of strings into an object
	for ( i = 0, l = queries.length; i < l; i++ ) {
		temp = queries[i].split('=');
		params[temp[0]] = temp[1];
	}
	return params;
}
