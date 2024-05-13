// window.addEventListener('contextmenu', function (e) {
//     // Cancel the default right-click behavior
//     e.preventDefault();
// }, false);

function clearBar(){
    document.getElementById("searchInput").value = "";
}

function searchWikipedia() {
    var searchQuery = document.getElementById("searchInput").value.trim();
    if (searchQuery === "") {
        document.getElementById("result").innerHTML = "Please enter a search term.";
        document.getElementById("result").style.textAlign = "center";
        return;
    }

    var apiUrl = "https://en.wikipedia.org/w/api.php";
    var searchParams = {
        action: "query",
        format: "json",
        list: "search",
        srsearch: searchQuery
    };

    var searchUrl = apiUrl + "?origin=*";
    Object.keys(searchParams).forEach(function(key) {
        searchUrl += "&" + key + "=" + encodeURIComponent(searchParams[key]);
    });

    fetch(searchUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var searchResults = data.query.search;
            if (searchResults.length === 0) {
                document.getElementById("result").innerHTML = "No result found for the given search term.";
                return;
            }

            // Get the most relevant search result
            var pageTitle = searchResults[0].title;

            // Now fetch the content of the page using the obtained title
            var pageParams = {
                action: "query",
                format: "json",
                prop: "extracts|pageimages",
                explaintext: true,
                piprop: "original",
                titles: pageTitle
            };

            var pageUrl = apiUrl + "?origin=*";
            Object.keys(pageParams).forEach(function(key) {
                pageUrl += "&" + key + "=" + encodeURIComponent(pageParams[key]);
            });

            return fetch(pageUrl);
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var pages = data.query.pages;
            var pageId = Object.keys(pages)[0];
            if (pageId === "-1") {
                document.getElementById("result").innerHTML = "No result found for the given search term.";
                document.getElementById("result").style.textAlign = "center";
                return;
            }

            var extract = pages[pageId].extract;
            var images = pages[pageId].original ? pages[pageId].original : null;

            var resultHTML = "";
            var splitIndex = Math.floor(extract.length / 2);

            // First part of the text
            var firstPart = extract.substr(0, splitIndex);
            resultHTML += "<div class='resultText'>" + firstPart + "</div>";

            // Display all images
            if (images) {
                resultHTML += "<div id='imageContainer'>";
                for (var key in images) {
                    if (key === "source") {
                        if (Array.isArray(images[key])) {
                            images[key].forEach(function(imageUrl) {
                                resultHTML += "<img class='image' src='" + imageUrl + "' />";
                            });
                        } else {
                            resultHTML += "<img class='image' src='" + images[key] + "' />";
                        }
                    }
                }
                resultHTML += "</div>";
            }

            // Second part of the text
            var secondPart = extract.substr(splitIndex);
            resultHTML += "<div class='resultText'>" + secondPart + "</div>";

            document.getElementById("result").innerHTML = resultHTML;
        })
        .catch(function(error) {
            console.log(error);
            document.getElementById("result").innerHTML = "Error occurred while fetching data.";
            document.getElementById("result").style.textAlign = "center";
        });
}
