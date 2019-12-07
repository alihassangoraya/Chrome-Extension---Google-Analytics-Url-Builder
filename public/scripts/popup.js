const MSG_CANNOT_BITLY_BITLY = 'You cannot Bitly a Bitly URL :)';
$(function () {
	var isDocked = $('body.docked').length > 0;
	var pageName = isDocked ? 'docked' : 'popup';

	if (isDocked) {
		ga('send', 'pageview', '/dock.html');
	} else {
		ga('send', 'pageview', '/popup.html');
	}


	function clearSelection() {
		if (document.selection)
			document.selection.empty();
		else if (window.getSelection)
			window.getSelection().removeAllRanges();
	}

	function shorten(url, callback) {
		let initialUrl = $('#url').val();
		if (!initialUrl) {
      callback({ status_code: 0, message: 'There is no URL to be shortened' });
      return;
		}
		if (initialUrl.includes('https://bitly.') || initialUrl.includes('http://bitly.')
			|| initialUrl.includes('https://bit.ly') || initialUrl.includes('http://bit.ly')) {
			callback( { status_code: 500, message: MSG_CANNOT_BITLY_BITLY });
			return;
		}
    let tmpUrl = !url ? $('#url').val() : url;
    if (!['https:', 'http:'].includes(tmpUrl.split('/')[0])) {
      callback({ status_code: 0, message: 'URL needs to start with http:// to be shortened' });
      return;
		}
		var bitlyToken = localStorage['bitlyToken'];
		var apiUrl = "api-ssl.bitly.com";

		if (!bitlyToken) { return; }
		// bitlyToken += "a random prefix to make token wrong";
		// with the callback method that was passed in used as the success handler
		$.getJSON("https://" + apiUrl + "/v3/shorten?longUrl=" + encodeURIComponent(tmpUrl) + "&access_token=" + bitlyToken + "&callback=?", callback);
	}

	var backgroundPage = chrome.extension.getBackgroundPage();
	var googleTokenValid = false;

	var googleTokenCheck = function() {
		var deferred = new $.Deferred();
		backgroundPage.checkGoogleToken(function (token) {
			if (token) {
				googleTokenValid = true;
			}
			deferred.resolve();
		});
		return deferred.promise();
	};

	var initializeCurrentUrl = function () {
		var deferred = new $.Deferred();
		//get active tab
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (!isDocked) {
				//set first input to url of active tab
				$('#url').val(tabs[0].url);
			}
			deferred.resolve();
		});
		return deferred.promise();
	};

	var main = function () {
		var currenturl = $('#url');
		var source = $('#utm_source');
		var medium = $('#utm_medium');
		var term = $('#utm_term');
		var content = $('#utm_content');
		var campaign = $('#utm_campaign');
		var result = $('#result');
		var bitResult = $('#bitResult');

		$('.optionsLink').click(function () {
			if ($(this).hasClass('extra-url')) {
				ga('send', 'event', pageName, 'config shortening'); //only when clicking the blinkind red message of no shortening configuration
			}
			if (isDocked) {
				chrome.tabs.update({ url: "options.html" + $(this).attr("href") });
			} else {
				chrome.tabs.create({ url: "options.html" + $(this).attr("href") });
			}
		});

		$('.dockLink').click(function () {
			chrome.tabs.create({ url: "dock.html" });
		});

		$(document).mouseup(function (e) {
			var container = $(".dropdown-list");

			// if the target of the click isn't the container nor a descendant of the container
			if (!container.is(e.target) && container.has(e.target).length === 0) {
				$('.dropdown').removeClass('open');
			}
		});

		if (getShorteningConfiguration()) {
			if (getShorteningConfiguration() === 're-bitly') {
				$('.extra-url').text('Click to re-authenticate Bit.ly');
				$('.extra-url').off();
				$('.extra-url').click(function(e) {
					e.preventDefault();
					backgroundPage.authenticateBitly(function(token) {
            if (!token) {
              return;
            }
						localStorage.removeItem('bitlyApiKey');
						localStorage.removeItem('bitlyUser');
						localStorage['bitlyToken'] = token;
						$('.extra-url').remove();
					});
				});
			} else {
				$('.extra-url').remove();
			}
		}

		$('.copyClipboard').click(function (e) {
			e.preventDefault();
			if ($(this).hasClass('bitlyGenerate')) {
				if (getShorteningConfiguration() === "bitly") {
					shorten(result.val(), setShortAndCopyToClip);
				} else if (getShorteningConfiguration() === "google") {
					// var message = 'Google shut down Goo.gl.\nClick here to change Shortener';
					var message = 'Google shutdown Goo.gl.';
          bitResult.val(message);
          bitResult.focus();
          bitResult[0].select();
          document.execCommand('Copy');
          clearSelection();
          $('#shortening-success').hide();
          $('#short-result-paragraph').text(message).attr('style', 'margin-left: none; color:red; font-weight: 450; display:block');
          let shortenerLink =
						$('<a></a>').css('color', 'red').text('Click here to change Shortener')
							.appendTo('#shortening-result')
							.click(function () {
                if (isDocked) {
                  chrome.tabs.update({ url: "options.html" + '#shortening' });
                } else {
                  chrome.tabs.create({ url: "options.html" + '#shortening' });
                }
              });
          $('#shortening-result').attr('style', 'float:none; margin-top: 6px').show();
          shortenerLink.fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400);

          // $('#shortening-result').show();
					/*backgroundPage.shortenUrl(result.val(),
						function(response) {
							ga('send', 'event', pageName, 'Short google success'); //only upon success
							bitResult.val(response.url);
							bitResult.focus();
							bitResult[0].select();
							document.execCommand('Copy');
							clearSelection();
							$('#short-result-paragraph').text(response.url);
							$('#shortening-result').show();
						});*/
				} else {
					ga('send', 'event', pageName, 'Short fail'); //when someone clicks the short& copy but there's no shortening service configured
					$('.extra-url').fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400);
				}
			} else if ($(this).hasClass('copyParameters')) {
				ga('send', 'event', pageName, 'Copy Parameters'); // hitting the copy parameters button
				var urlText = result.val();
				var startIndex = urlText.indexOf('utm_source=');
				var endIndex = urlText.indexOf('#') === -1 ? urlText.length : urlText.indexOf('#');
				result.focus();
				result[0].setSelectionRange(startIndex, endIndex);
				document.execCommand('Copy');
				clearSelection();
				result.focus();
			}
			else {
				ga('send', 'event', pageName, 'Copy url');  // hitting the copy url button
				result.focus();
				result[0].select();
				document.execCommand('Copy');
				clearSelection();
				result.focus();
			}
			var parametersUsed = {
				"source": source.val(),
				"medium": medium.val(),
				"term": term.val(),
				"content": content.val(),
				"campaign": campaign.val()
			};
			localStorage['lastCombination'] = JSON.stringify(parametersUsed);
			localStorage['lastCombinationTimeStamp'] = new Date().getTime();
		});

		var data = [];
		if (localStorage['combinations']) {
			data = JSON.parse(localStorage['combinations']);
		}

		var hasDefault = false;
		$.each(data, function (index, value) {
			//if is default add as selected option
			if (value["isDefault"] === "checked" || value["isDefault"] === true) {
				$('#savedCombinations').append('<li class="active"><a href="#">' + value["combinationName"] + '</a></li>');
				//set hasDefault to true
				hasDefault = true;
			} else {
				$('#savedCombinations').append('<li><a href="#">' + value["combinationName"] + '</a></li>');
			}
		});

		var timeout = new Date().getTime() - 60*60*1000;
		if (!hasDefault && localStorage['lastCombination'] && timeout < localStorage['lastCombinationTimeStamp']) {
			var lastCombination = JSON.parse(localStorage['lastCombination']);
			source.val(lastCombination["source"]);
			medium.val(lastCombination["medium"]);
			term.val(lastCombination["term"]);
			content.val(lastCombination["content"]);
			campaign.val(lastCombination["campaign"]);
			createUrl();
		}

		$('#savedCombinations li').click(function () {
			var selectedQuickSetName = $(this).text();
			if (selectedQuickSetName) {
				var selectedCombination;
				for (var i = 0; i < data.length; i++) {
					if (selectedQuickSetName === data[i]["combinationName"]) {
						selectedCombination = data[i];
					}
				}
				if (selectedCombination !== null) {
					ga('send', 'event', pageName, 'choose preset'); // when preset is chosen and form filled.
					source.val(selectedCombination["source"]);
					medium.val(selectedCombination["medium"]);
					term.val(selectedCombination["term"]);
					content.val(selectedCombination["content"]);
					campaign.val(selectedCombination["campaign"]);
					createUrl();
				}
			}
			$('.dropdown').removeClass('open');
			$('#savedCombinations li.active').removeClass('active');
			$('.presetlist_chosen').text(truncate($(this).text()));
			$(this).addClass('active');
			refreshIcons();
		});

		$('.dropdown .btn').click(function () {
			$('.dropdown').addClass('open');
		});

		//check of hasdefault in case tabs.query handler has executed first
		if (hasDefault && currenturl.val()) {
			$('#savedCombinations li.active').click();
		}

		$('input:not(#result)').keyup(function () {
			/*if (source.val()) {
				createUrl();
			} else {
				result.val('');
			}*/
			// Now we create URL even there  is no source
			createUrl();
			refreshIcons();
		});

		function handleBitlyError(bitlyResponse) {
      let eventLabel = `${currenturl.val()}|${source.val()}|${medium.val()}|${term.val()}|${content.val()}|${campaign.val()}|${result.val()}`;
			// console.log(eventLabel);
      ga('send', 'event', 'Bitly Errors', `${bitlyResponse.status_code} - ${bitlyResponse.status_txt}`, `${eventLabel}`);
      let message;
      switch (bitlyResponse.status_code) {
				// marking that this is a psudo-response, when the url is not valid one
				case 0:
					message = bitlyResponse.message;
					break;
				case 500:
					if (bitlyResponse.message !== MSG_CANNOT_BITLY_BITLY)
						message = 'Bitly has some difficulties right now, try again in a few minutes.';
					else message = bitlyResponse.message;
					break;
				case 503:
					message = 'Bitly is not responding at the moment, try again in few minutes.';
					break;
				case 403:
          message = 'Bitly says you exceeded your hourly quota, try again later.';
          break;
				default:
					message = 'Bitly requires login again.';
          let shortenerLink =
            $('<a></a>').css('color', 'red').text('Click here to authenticate')
              .appendTo('#shortening-result')
              .click(function () {
                if (isDocked) {
                  chrome.tabs.update({ url: "options.html" + '#shortening' });
                } else {
                  chrome.tabs.create({ url: "options.html" + '#shortening' });
                }
              });
          shortenerLink.fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400);
          localStorage.removeItem('bitlyApiKey');
          localStorage.removeItem('bitlyUser');
          localStorage.removeItem('bitlyToken');
      }
      $('#shortening-success').hide();
      $('#short-result-paragraph').text(message).attr('style', 'margin-left: unset; color:red; font-weight: 450; display:block; word-break: keep-all');
      $('#shortening-result').attr('style', 'float:none; margin-top: 6px').show();
		}
		function setShortAndCopyToClip(bitlyResponse) {
			// bitlyResponse.status_code = 503;
			if (bitlyResponse.status_code !== 200) {
				handleBitlyError(bitlyResponse);
				return;
			}
			ga('send', 'event', pageName, 'Short bitly success'); //only upon success
			bitResult.val(bitlyResponse["data"]["url"]);
			bitResult.focus();
			bitResult[0].select();
			document.execCommand('Copy');
			clearSelection();
      $('#shortening-success').show();
      $('#short-result-paragraph').attr('style', 'margin-left: -10px').text(bitlyResponse["data"]["url"]);
			$('#shortening-result').show();

		}

		function createUrl() {
			if (currenturl.val() === "")
				return;
			var performLowercase = localStorage['performLowercase'];
			var myurl = new URI(currenturl.val());
			if (source.val()) {
				myurl.addQuery("utm_source", performLowercase ? source.val().toLowerCase() : source.val());
			}
			if (medium.val()) {
				myurl.addQuery("utm_medium", performLowercase ? medium.val().toLowerCase() : medium.val());
			}
			if (term.val()) {
				myurl.addQuery("utm_term", performLowercase ? term.val().toLowerCase() : term.val());
			}
			if (content.val()) {
				myurl.addQuery("utm_content", performLowercase ? content.val().toLowerCase() : content.val());
			}
			if (campaign.val() !== "") {
				myurl.addQuery("utm_campaign", performLowercase ? campaign.val().toLowerCase() : campaign.val());
			}
			var myurlString = myurl.toString();
			result.val(myurlString);
			$('#shortening-result').hide();
		}

		function truncate(string) {
			if (string.length > 15)
				return string.substring(0, 15) + '...';
			else
				return string;
		};

		function refreshIcons() {
			if (currenturl.val()) {
				$('#url-success').css('visibility', 'visible');
			} else {
				$('#url-success').css('visibility', 'hidden');
			}
			if (source.val()) {
				$('#source-success').css('visibility', 'visible');
			} else {
				$('#source-success').css('visibility', 'hidden');
			}
			if (medium.val()) {
				$('#medium-success').css('visibility', 'visible');
			} else {
				$('#medium-success').css('visibility', 'hidden');
			}
			if (term.val()) {
				$('#term-success').css('visibility', 'visible');
			} else {
				$('#term-success').css('visibility', 'hidden');
			}
			if (content.val()) {
				$('#content-success').css('visibility', 'visible');
			} else {
				$('#content-success').css('visibility', 'hidden');
			}
			if (campaign.val()) {
				$('#campaign-success').css('visibility', 'visible');
			} else {
				$('#campaign-success').css('visibility', 'hidden');
			}
		}

		function getShorteningConfiguration(){
			if (localStorage['bitlyApiKey']) {
				return "re-bitly";
			}

			if (localStorage['defaultShort'] === "bitly" && localStorage['bitlyToken']) {
				return "bitly";
			} else if (localStorage['defaultShort'] === "google" && googleTokenValid) {
				return "google";
			} else if (localStorage['bitlyToken']) {
				localStorage['defaultShort'] = "bitly";
				return "bitly";
			} else if (googleTokenValid){
				localStorage['defaultShort'] = "google";
				return "google";
			}
			return null;
		}
	};

	$.when(googleTokenCheck(), initializeCurrentUrl()).then(main);
});
