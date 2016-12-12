if (!$("body").hasClass("reaction-listener-added")) {
	$("body").addClass("reaction-listener-added");
	chrome.runtime.onMessage.addListener(function (message) {
		$(document.activeElement).val(function(index, value) {
			return value + message.url;
		});
	});
}
