chrome.storage.sync.get("bookmarks", function(items) {
	if (items.bookmarks === undefined) {
		chrome.storage.sync.set( {"bookmarks": []} );
		console.log("Bookmarks created");
	} else {
		console.log("Bookmarks already exist");
		console.log(items.bookmarks);
	}
});

chrome.contextMenus.create({
	"type": "normal",
	"id": "addReaction",
	"title": "Add this media",
	"contexts": ["image"]
});

chrome.contextMenus.create({
	"type": "normal",
	"id": "openReactionWindow",
	"title": "Insert reaction",
	"contexts": ["editable"]
});

chrome.contextMenus.onClicked.addListener(reactionListener);

function reactionListener(info, tab) {
	if (info.menuItemId === "addReaction") {
		addBookmark(info);
	}

	if (info.menuItemId === "openReactionWindow") {
		viewBookmarks(tab);
	}
}

function addBookmark(info) {
	chrome.storage.sync.get(function(items) {
		var bookmarks = items.bookmarks;

		bookmarks.push({
			"url": info.srcUrl,
			"timestamp": new Date().getTime()
		});

		chrome.storage.sync.set( {"bookmarks": bookmarks} );
	});
}

function viewBookmarks(tab) {
	chrome.windows.create({
		"url": "InsertReaction.html#" + tab.id,
		"width": 600,
		"height": 700,
		"type": "popup"
	});
}
