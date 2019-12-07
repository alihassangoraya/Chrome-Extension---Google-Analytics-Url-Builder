function generateXML(jsonCombinations) {
	if (!jsonCombinations || jsonCombinations === '[]') { // if jsonCombinations is undefined or empty
		return '';
	}
	else {
		var combinations = JSON.parse(jsonCombinations);

		var root = '<?xml version="1.0" encoding="utf-8"?>';

		var metadata = '\t\t<timestamp>' + Date.today().toString("dd/MM/yyyy") + ' ' + new Date().toString("HH:mm:ss") + '</timestamp>\n' +
			'\t\t<setcount>' + combinations.length.toString() + '</setcount>\n';

		var elements = '';
		for (var i = 0; i < combinations.length; i++) {
			var setname = '\t\t\t\t<setname>' + combinations[i]["combinationName"] + '</setname>\n';
			var source = '\t\t\t\t<src>' + combinations[i]["source"] + '</src>\n';
			var medium = '\t\t\t\t<medium>' + combinations[i]["medium"] + '</medium>\n';
			var term = '\t\t\t\t<term>' + combinations[i]["term"] + '</term>\n';
			var content = '\t\t\t\t<content>' + combinations[i]["content"] + '</content>\n';
			var campaign = '\t\t\t\t<campaign>' + combinations[i]["campaign"] + '</campaign>\n';
			var isdefault = '\t\t\t\t<isdefault>' + combinations[i]["isDefault"] + '</isdefault>\n';
			var element = '\t\t\t<quickset>\n' + setname + source + medium + term + content + campaign + isdefault + '\t\t\t</quickset>\n';
			elements += element;
		}

		return root + '\n\t<backup>\n' + metadata + '\t\t<quicksets>\n' + elements + '\t\t</quicksets>' + '\n\t</backup>';
	}
}

$(function () {
	ga('send', 'pageview', '/options.html');

	var backgroundPage = chrome.extension.getBackgroundPage();
	var googleTokenValid = false;

	var tokenCheck = function() {
		var deferred = new $.Deferred();
		backgroundPage.checkGoogleToken(function (token) {
			/*if (!token) {
				$('#btnEnableGoogle').show();
				$('#btnEnabledGoogle').hide();
				$('#btnRevokeGoogle').hide();
			} else {
				$('#btnEnableGoogle').hide();
				$('#btnEnabledGoogle').show();
				$('#btnRevokeGoogle').show();
			}*/
			if (token) {
        $('#btnRevokeGoogle').show();
      } else {
				$('#googleSection').hide();
      }
			googleTokenValid = token;
			deferred.resolve();
		});
		return deferred.promise();
	};

	var main = function() {

		/*$('#btnEnableGoogle').click(function () {
			backgroundPage.grantAccess(function (token) {
				if (token) {
					$('#btnEnableGoogle').hide();
					$('#btnEnabledGoogle').show();
					$('#btnRevokeGoogle').show();
				}
			});
		});*/

		$('#btnEnableBitly').click(function () {
			backgroundPage.authenticateBitly(function (token) {
				// handler case when there is no token.
				if (!token) {
					return;
				}
				localStorage.removeItem('bitlyApiKey');
				localStorage.removeItem('bitlyUser');
				localStorage['bitlyToken'] = token;
				if (token) {
					$('#btnEnableBitly').hide();
					$('#btnEnabledBitly').show();
          $('#btnRevokeBitly').show();
				}
			});
		});

		$('#btnRevokeBitly').click(function() {
      localStorage.removeItem('bitlyApiKey');
      localStorage.removeItem('bitlyUser');
      localStorage.removeItem('bitlyToken');
      $('#btnEnableBitly').show();
      $('#btnEnabledBitly').hide();
      $('#btnRevokeBitly').hide();
    });

		$('.sidebar a:not(.dockLink)').on('click', function (event) {
			event.preventDefault();
			$('html,body').animate({ scrollTop: $(this.hash).offset().top }, 500);
		});

		$('.dockLink').click(function () {
			chrome.tabs.create({ url: "dock.html" });
		});

		$('#btnRevokeGoogle').click(function () {
			backgroundPage.revokeToken(function () {
				/*$('#btnEnableGoogle').show();
				$('#btnEnabledGoogle').hide();*/
				$('#btnRevokeGoogle').hide();
			});
		});

		$('.sidebar li').click(function () {
			$('.sidebar li').removeClass("active");
			$(this).addClass("active");
		});

		setTimeout(function() {
			if(location.hash){
				$('a[href="' + location.hash.replace('-section', '') + '"]').click();
			}
		}, 1);

		function setsViewModel() {
			var self = this;

			self.sets = ko.mapping.fromJS(getSetsFromStorage());

			self.canChangeState = ko.computed(function () {
				var result = _.all(self.sets(), function (set) {
					return set.mode() === 'view';
				});
				return result;
			}, this);

			self.save = function (set) {
				//if (set.combinationName() && set.source()) {
				// removing source as mandatory field
				if (set.combinationName()) {
					ga('send', 'event', 'config', 'preset - save'); // after add or edit
					saveToLocalStorage();
					set.mode("view");
				} else {
					alert("Please fill all required fields: 'SET NAME', 'SOURCE'");
				}
			}

			self.cancel = function () {
				self.loadFromStorage();
			}

			self.loadFromStorage = function () {
				ko.mapping.fromJS(getSetsFromStorage(), self.sets);
			}

			self.editSet = function (set) {
				set.mode('edit');
			};

			self.deleteSet = function (set) {
				ga('send', 'event', 'config', 'preset - delete');
				var indexOfSet = self.sets.indexOf(set);
				self.sets.splice(indexOfSet, 1);
				saveToLocalStorage();
			};

			self.makeDefault = function (set) {
				ga('send', 'event', 'config', 'preset - default'); //make a preset as default
				for (var i = 0; i < self.sets().length; i++) {
					self.sets()[i].isDefault(false);
				}
				set.isDefault(true);
				saveToLocalStorage();
			};

			self.addSet = function () {
				ga('send', 'event', 'config', 'preset - add'); //clicking the add button
				var newSet = {
					combinationName: ko.observable(""),
					source: ko.observable(""),
					medium: ko.observable(""),
					term: ko.observable(""),
					content: ko.observable(""),
					campaign: ko.observable(""),
					isDefault: ko.observable(false),
					mode: ko.observable("edit")
				};
				self.sets.unshift(newSet);
			}

			function saveToLocalStorage() {
				var newData = ko.mapping.toJS(self.sets);
				for (var i = 0; i < newData.length; i++) {
					delete newData[i].mode;
				}
				localStorage['combinations'] = JSON.stringify(ko.mapping.toJS(newData));
			}

			function getSetsFromStorage() {
				var data;
				if (localStorage['combinations']) {
					data = JSON.parse(localStorage['combinations']);
				} else {
					data = [];
				}
				for (var i = 0; i < data.length; i++) {
					data[i].mode = "view";
				}
				return data;
			}
		}

		var options = {
			attribute: "data-bind",        // default "data-sbind"
			globals: window,               // default {}
			bindings: ko.bindingHandlers,  // default ko.bindingHandlers
			noVirtualElements: false       // default true
		};
		ko.bindingProvider.instance = new ko.secureBindingsProvider(options);
		var viewModel = new setsViewModel();
		ko.applyBindings(viewModel);

		if (localStorage['bitlyToken']) {
			$('#btnEnableBitly').hide();
			$('#btnEnabledBitly').show();
      $('#btnRevokeBitly').show();
		}
		else {
			$('#btnEnableBitly').show();
			$('#btnEnabledBitly').hide();
      $('#btnRevokeBitly').hide();
		}
		/*if (localStorage['defaultShort']) {
			$('.shortening-section div[data-val="' + localStorage['defaultShort'] + '"]').addClass('active');
			toggleShortening();
		} else if (localStorage['bitlyToken']) {
			localStorage['defaultShort'] = "bitly";
			$('.shortening-section div[data-val="' + localStorage['defaultShort'] + '"]').addClass('active');
			toggleShortening();
		} else if (googleTokenValid) {
			localStorage['defaultShort'] = "google";
			$('.shortening-section div[data-val="' + localStorage['defaultShort'] + '"]').addClass('active');
			toggleShortening();
		}*/
/*

		$('.switcher.short .btn').click(function () {
			$('.switcher.short .btn').removeClass('active');
			$(this).addClass('active');
			localStorage['defaultShort'] = $(this).data('val');
			toggleShortening();
		});
*/

		$('.switcher.lowercase .btn').click(function () {
			$('.switcher.lowercase .btn').removeClass('active');
			if ($(this).data('val')) {
				localStorage['performLowercase'] = true;
				$('.switcher.lowercase div[data-val="true"]').addClass('active');
			} else {
				localStorage.removeItem('performLowercase');
				$('.switcher.lowercase div[data-val="false"]').addClass('active');
			}
		});

		if (localStorage['performLowercase']) {
			$('.switcher.lowercase div[data-val="true"]').addClass('active');
		} else {
			$('.switcher.lowercase div[data-val="false"]').addClass('active');
		}

		function toggleShortening() {
			if (localStorage['defaultShort'] === 'google') {
				$('#googleSection').show();
				$('#bitlySection').hide();
			} else if (localStorage['defaultShort'] === 'bitly') {
				$('#googleSection').hide();
				$('#bitlySection').show();
			}
		}

		$('#backupFile').click(function (e) {
			ga('send', 'event', 'config', 'backup'); //click the backup button
			e.preventDefault();
			if (generateXML(localStorage['combinations']) === '') {
				alert('Quicksets are empty!');
				return;
			}
			var bb = new BlobBuilder();
			bb.append(generateXML(localStorage['combinations']));
			var blob = bb.getBlob("text/xml");
			saveAs(blob, 'GAUrlBuilder' + Date.today().toString('ddMMyy') + '.backup.txt');
		});

		document.getElementById('fileElem').addEventListener('change',
			function () {
				var fileList = this.files;
				var file = fileList[0];

				// check for filetypes, because large files will freeze the page
				if (file.type !== 'text/xml' && file.type !== 'text/plain') {
					alert('Invalid backup file.');
					return;
				}

				// process the file:
				var reader = new FileReader();
				reader.onload = (function () {
					return function (e) {
						var xml = e.target.result;
						var dataXml = [];
						$(xml).find("quickset").each(
							function () {
								var d = {};
								d["combinationName"] = $(this).find("setname").text();
								d["source"] = $(this).find("src").text(); // "src" not "source"
								d["medium"] = $(this).find("medium").text();
								d["term"] = $(this).find("term").text();
								d["content"] = $(this).find("content").text();
								d["campaign"] = $(this).find("campaign").text();
								if ($(this).find("isdefault").text() === 'true' || $(this).find("isdefault").text() === 'checked') {
									d["isDefault"] = true;
								} else {
									d["isDefault"] = false;
								}
								dataXml.push(d);
							});
						localStorage['combinations'] = JSON.stringify(dataXml);
						viewModel.loadFromStorage();
						document.getElementById("fileElem").value =
							""; // clear file input: if user wants to load the same file twice, change event should be fired again
					};
				})(file);
				reader.readAsText(file);
			},
			false);

		var fileSelect = document.getElementById("fileSelect"), fileElem = document.getElementById("fileElem");
		fileSelect.addEventListener("click", function (e) { // delegate event to input fileElem, because it is hidden
			ga('send', 'event', 'config', 'restore'); //click the restore  button
			if (fileElem) {
				fileElem.click();
			}
			e.preventDefault(); // prevent navigation to "#"
		}, false);
	};

	$.when(tokenCheck()).then(main);
});
