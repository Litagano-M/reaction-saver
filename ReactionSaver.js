chrome.storage.sync.get("bookmarks", function(items) {
	if (items.bookmarks === undefined) {
		chrome.storage.sync.set( {"bookmarks": []} );
		console.log("Bookmarks created");
	} else {
		console.log("Bookmarks already exist");
	}
});

chrome.contextMenus.create({
	"type": "normal",
	"id": "addImage",
	"title": "Add this reaction",
	"contexts": ["image"]
});

chrome.contextMenus.onClicked.addListener(reactionListener);

function reactionListener(info) {
	if (info.menuItemId === "addImage") {
		chrome.storage.sync.get(function(items) {
			var bookmarks = items.bookmarks;

			bookmarks.push({
				"url": info.srcUrl,
				"timestamp": new Date().getTime()
			});

			console.log(bookmarks);

			chrome.storage.sync.set( {"bookmarks": bookmarks} );
		});
	}
}
