// Get the bookmarks from Chrome's synced storage. If no such entry in the Chrome storage exists, create one with an empty array.
chrome.storage.sync.get("bookmarks", function(items) {
	if (items.bookmarks === undefined) {
		chrome.storage.sync.set( {"bookmarks": []} );
		console.log("Bookmarks created");
	} else {
		console.log("Bookmarks already exist");
		console.log(items.bookmarks);
	}
});

// Create the context menu entry for adding reactions.
chrome.contextMenus.create({
	"type": "normal",
	"id": "addReaction",
	"title": "Add this media",
	"contexts": ["image"]
});

// Create the context menu entry for inserting saved reactions.
chrome.contextMenus.create({
	"type": "normal",
	"id": "openReactionWindow",
	"title": "Insert reaction",
	"contexts": ["editable"]
});

// Add the listener.
chrome.contextMenus.onClicked.addListener(reactionListener);

// Listener for the extension.
function reactionListener(info, tab) {
	// If the menu item clicked is the one to add reactions, add a bookmark with addBookmark().
	if (info.menuItemId === "addReaction") {
		addBookmark(info);
	}

	// If the menu item clicked is the one to open the saved reactions, open them with viewBookmarks().
	if (info.menuItemId === "openReactionWindow") {
		viewBookmarks(tab);
	}
}

// Function for adding bookmarks.
function addBookmark(info) {
	chrome.storage.sync.get(function(items) {
		var bookmarks = items.bookmarks; // Get the array of bookmark objects from Chrome's synced storage and store it in a variable so we can change it.

		// Add a new object storing the image's URL and the timestamp.
		bookmarks.push({
			"url": info.srcUrl,
			"timestamp": new Date().getTime(),
			"favorite": false
		});

		chrome.storage.sync.set( {"bookmarks": bookmarks} ); // After we're done, set the bookmarks in Chrome's synced storage to the one stored in the bookmarks variable creeted above.
	});
}

// Function for viewing bookmarks. Creates a window storing the ID of the current tab as a hash at the end of the window's URL, so we can place the URL that the user wants in the right area.
function viewBookmarks(tab) {
	chrome.windows.create({
		"url": "InsertReaction.html#" + tab.id,
		"width": 600,
		"height": 700,
		"type": "popup"
	});
}
