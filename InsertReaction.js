function insertURL(url) {
	var tabID = parseInt(location.hash.substring(1));
	console.log(tabID);

	if (isNaN(tabID)) {
		chrome.tabs.query( {"active": true, "currentWindow": true}, function(tabs) {
			tabID = tabs[0].id;
			console.log(tabID);

			chrome.tabs.executeScript(tabID, {"file": "jquery-3.1.1.min.js"}, function() {
				chrome.tabs.executeScript(tabID, {"file": "ReactionScript.js"}, function() {
					chrome.tabs.sendMessage(tabID, {"url": url});
				});
			});
		});
	} else {
		chrome.tabs.executeScript(tabID, {"file": "jquery-3.1.1.min.js"}, function() {
			chrome.tabs.executeScript(tabID, {"file": "ReactionScript.js"}, function() {
				chrome.tabs.sendMessage(tabID, {"url": url}, function() {
					chrome.windows.getCurrent(function(window) {
						chrome.windows.remove(window.id);
					});
				});
			});
		});
	}
}

chrome.storage.sync.get("bookmarks", function(items) {
	items.bookmarks.forEach(function(bookmark) {
		var $container = $("<div>")
			.addClass("media-container")
			.click(function() {
				console.log("Reaction clicked!");
				insertURL(bookmark.url);
			});

		var $image = $("<img>")
			.attr("src", bookmark.url);

		$container.append($image);
		$("#media-collection").append($container);
	});
});
