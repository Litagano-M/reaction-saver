// Attach a listener to listen for the message from InsertReaction.js and add a "reaction-listener-added" class to the body. This class is used to check if this script has been run on the page already, so as to not add duplicate listeners.
if (!$("body").hasClass("reaction-listener-added")) {
	$("body").addClass("reaction-listener-added");
	chrome.runtime.onMessage.addListener(function (message) {
		$(document.activeElement).val(function(index, value) { // Get the value of the currently active element on the page (should be a text box or text area)
			return value + message.url; // Set the value to what was originally in the text box/area plus the URL from the message sent
		});
	});
}
