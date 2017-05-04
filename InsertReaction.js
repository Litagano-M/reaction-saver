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

// Function for toggling favorites on bookmarks.
function toggleFavorite(bookmarkToToggle) {
	// Get the bookmarks from Chrome's synced storage.
	chrome.storage.sync.get("bookmarks", function(items) {
		var bookmarks = items.bookmarks; // Store the bookmark array in a variable so we can change it

		// For each bookmark...
		bookmarks.forEach(function(bookmark) {
			// ...if the current bookmark's URL is equal to the URL of the bookmark passed into the function AND
			//    if the current bookmark's timestamp is equal to the timestamp of the bookmark passed into the function...
			if (bookmarkToToggle.url === bookmark.url &&
				bookmarkToToggle.timestamp === bookmark.timestamp) {
				// ...get its index and toggle its favorite value.
				var indexToToggle = bookmarks.indexOf(bookmark);
				bookmarks[indexToToggle].favorite = !bookmarks[indexToToggle].favorite;
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
				.addClass("button remove") // Add the button and remove classes (together, they make the remove button appearance)
				.click(function(event) { // Add a click handler that passes the current bookmark to the removeBookmark() function and deletes the container node from the HTML page
					event.stopPropagation();
					removeBookmark(bookmark);
					$container.detach();
				})
				.hover( // Add a hover handler that animates the opacity of the button
					function() { $(this).animate( {"opacity": "1"}, 100 ).dequeue(); },
					function() { $(this).animate( {"opacity": "0.5"}, 100 ).dequeue(); }
				);

            // Create a favorite button.
			var $favoriteButton = $("<div>")
				.addClass("button favorite") // Add the button and favorite classes (together, they make the favorite button appearance)
                .toggleClass("favorited", bookmark.favorite) // Toggle the "favorited" class that turns the button yellow depending on whether the bookmark is favorited or not
				.click(function(event) { // Add a click handler that passes the current bookmark to the toggleFavorite function
					event.stopPropagation();

                    /* So this works non-intuitively. The "bookmark" variable passed into the callback function for the items.bookmarks.forEach() call way up above does not and is not affected by what's actually in storage. That is to say, if I were to later change anything about the bookmarks, it would not be reflected in the "bookmark" variable passed in. The "bookmark" variable only represents the bookmark storage as it was when it was queried at the chrome.storage.sync.get() call that was made when the user opened the "Insert Reaction" window.

                    Therefore, I am using the statement below to toggle the favorite value in the "bookmark" variable in order to be able to correctly change the page's appearance. The toggleFavorite() function is the one that actually changes the favorite value in actual storage, so any changes to favorites persist.

                    This is not perfect. The order in which the user sees their favorites as they change them and the order it will actually be in when the "Insert Reaction" window renders will be different, which is apparent when the user closes and reopens the window or refreshes it. Perhaps there's a better way of doing this. I'll have to see about it later. */

                    bookmark.favorite = !bookmark.favorite; // Toggle the favorite key of the current bookmark's representation in the "bookmark" variable
                    toggleFavorite(bookmark); // This is the function that actually toggles the bookmark's favorite value in the storage by passing in the "bookmark" variable and finding the bookmark in storage with that

                    if (bookmark.favorite) { // If the "bookmark" variable's favorite value is true...
                        $container.detach().appendTo($("#favorites-collection")); // ...then detach the container from the regular collection div and place it in the favorites collection div
                    } else {
                        $container.detach().appendTo($("#regular-collection")); // ...else detach the container from the favorites collection div and place it in the regular collection div
                    }

                    $(this).toggleClass("favorited", bookmark.favorite); // Toggles the "favorited" class responsible for changing the color of the button
				})
				.hover( // Add a hover handler that animates the opacity of the button
					function() { $(this).animate( {"opacity": "1"}, 100 ).dequeue(); },
					function() { $(this).animate( {"opacity": "0.5"}, 100 ).dequeue(); }
				);

			$container.append($removeButton); // Append the remove button to the container
            $container.append($favoriteButton); // Append the favorite button to the container
			$container.append($image); // Append the image to the container

            // If the bookmark is a favorite...
            if (bookmark.favorite) {
                $("#favorites-collection").append($container); // ...append the container to the div that holds all the favorites
            } else {
                $("#regular-collection").append($container); // ...else append the container to the div that holds all the regular saved bookmarks
            }
		});
	});
}

populateList();
