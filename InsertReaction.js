// Function for inserting URLs into text fields.
function insertURL(url) {
	var tabID = parseInt(location.hash.substring(1)); // Extract the tab ID from the window's URL.

	if (isNaN(tabID)) { // This is for when the list of reactions is accessed from a non-tab context (the browserAction popup)
		chrome.tabs.query( {"active": true, "currentWindow": true}, function(tabs) { // Query for the active tab in the current window (the tab in which the toolbar icon is clicked)
			tabID = tabs[0].id; // Get that tab

			chrome.tabs.executeScript(tabID, {"file": "jquery-3.1.1.min.js"}, function() { // Inject the jQuery file into the page
				chrome.tabs.executeScript(tabID, {"file": "ReactionScript.js"}, function() { // Inject my custom script into the page
					chrome.tabs.sendMessage(tabID, {"url": url}, function() { // Send a message to be used by ReactionScript.js containing the URL passed into the function
						chrome.windows.getCurrent(function(window) { // Get the current window (should be the window in which you want to paste a reaction in)
							chrome.windows.update(window.id, {"focused": true}); // Focus it so the browserAction popup goes away
						});
					});
				});
			});
		});
	} else { // This is for when the list of reactions is accessed from a valid tab context (right-clicking on a text field)
		chrome.tabs.executeScript(tabID, {"file": "jquery-3.1.1.min.js"}, function() { // Inject the jQuery file into the page
			chrome.tabs.executeScript(tabID, {"file": "ReactionScript.js"}, function() { // Inject my custom script into the page
				chrome.tabs.sendMessage(tabID, {"url": url}, function() { // Send a message to be used by ReactionScript.js containing the URL passed into the function
					chrome.windows.getCurrent(function(window) { // Get the current window (should be the window displaying InsertReaction.html)
						chrome.windows.remove(window.id); // Close that window
					});
				});
			});
		});
	}
}

// Function for removing bookmarks.
function removeBookmark(bookmarkToRemove) {
	// Get the bookmarks from Chrome's synced storage.
	chrome.storage.sync.get("bookmarks", function(items) {
		var bookmarks = items.bookmarks; // Store the bookmark array in a variable so we can change it

		// For each bookmark...
		bookmarks.forEach(function(bookmark) {
			// ...if the current bookmark's URL is equal to the URL of the bookmark passed into the function AND
			//    if the current bookmark's timestamp is equal to the timestamp of the bookmark passed into the function...
			if (bookmarkToRemove.url === bookmark.url &&
				bookmarkToRemove.timestamp === bookmark.timestamp) {
				// ...get its index and remove it from the list of bookmarks.
				var indexToRemove = bookmarks.indexOf(bookmark);
				bookmarks.splice(indexToRemove, 1);
			}
		});

		chrome.storage.sync.set( {"bookmarks": bookmarks} ); // Store the array in the bookmarks variable back into Chrome's synced storage.
	});
}

// Function for populating the list of bookmarks in InsertReaction.html.
function populateList() {
	// Get the bookmarks from Chrome's synced storage.
	chrome.storage.sync.get("bookmarks", function(items) {
		// For each bookmark...
		items.bookmarks.forEach(function(bookmark) {
			// Create a container div.
			var $container = $("<div>")
				.addClass("media-container") // Add the media-container class
				.click(function() { // Add a click handler that passes the value in the current bookmark's url key into the insertURL() function
					insertURL(bookmark.url);
				});

			// Create an img node.
			var $image = $("<img>")
				.attr("src", bookmark.url); // Set it to link to the current bookmark's url.

			// Create a remove button.
			var $removeButton = $("<div>")
				.addClass("remove-button") // Add the remove-button class
				.click(function(event) { // Add a click handler that passes the current bookmark to the removeBookmark() function and deletes the container node from the HTML page
					event.stopPropagation();
					removeBookmark(bookmark);
					$container.detach();
				})
				.hover( // Add a hover handler that animates the opacity of the button
					function() { $(this).animate( {"opacity": "1"}, 100 ).dequeue(); },
					function() { $(this).animate( {"opacity": "0.5"}, 100 ).dequeue(); }
				);

			$container.append($removeButton); // Append the remove button to the container
			$container.append($image); // Append the image to the container

            // If the bookmark is a favorite...
            if (bookmark.favorite) {
                $("#favorites-collection").append($container); // ...append the container to the div that holds all the favorites
            } else {
                $("#media-collection").append($container); // ...else append the container to the div that holds all the saved bookmarks
            }
		});
	});
}

populateList();
