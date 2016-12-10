chrome.contextMenus.create({
	"type": "normal",
	"id": "addImage",
	"title": "Add this image",
	"contexts": ["image"]
});

chrome.contextMenus.onClicked.addListener(testListener);

function testListener() {
	console.log("This is an image");
}
