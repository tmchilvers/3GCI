// From https://gist.github.com/sebz/efddfc8fdcb6b480f567
// Modified sections pointed out

var lunrIndex,
    $results,
    pagesIndex;



// Initialize lunrjs using our generated index file
// Changed the file-loader to do it non-caching because then search results will update correctly
function initLunr() {
    // First retrieve the index file
    $.ajax({
        cache: false,
        url: "/created/js/jason/PagesIndex.json",
        dataType: "json",
        success: function(index) {

            pagesIndex = index;
            // Set up lunrjs by declaring the fields we use
            // Also provide their boost level for the ranking
            lunrIndex = lunr(function () {
                this.field("title", {
                    boost: 10
                });
                this.field("tags", {
                    boost: 5
                });
                this.field("content");

                // ref is the result item identifier (I chose the page URL)
                this.ref("href");

                // Feed lunr with each file and let lunr actually index them
                //Modified to work with newer version
                // uses basic for loop instead of for each to prevent this from going out of scope
                for (var i = 0; i < pagesIndex.length; i++) {
                    this.add(pagesIndex[i]);
                }

                console.log("Search Data Loaded");
            });
        },
        fail: function () {
            console("Error: failed to download search file");
        }
    })
}

// Nothing crazy here, just hook up a listener on the input field
function initUI() {
    $results = $("#results");

    var inputs = ['#input_mobile', '#input_modal', '#input_desk'];

    $(".search_button").click(function() {
        $results.empty();

        //Needs to be here to trigger correctly, not in no_scroll.js
        $('#carouselExampleControls').carousel('pause');

        var query = $(getVisible(inputs)).val();

        //To prevent the input from having a different value than what is searched
        $(inputs[1]).val('');

        if (query.length < 2) {
            return;
        }

        $('#modal_title').text(' ' + query);
        $('#search_modal').modal('show');

        getOut(query);
    });

    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            $( "#modal_search_but" ).trigger( "click" );
        }
    });
}

function getOut(query) {
    var results = search(query);
    renderResults(results);
}

function getVisible(inputs) {
    var current_visible;
    if ($('#mobile_search').is(":visible")) {
        current_visible = inputs[0];
    } else {
        current_visible = inputs[2];
    }

    if ($('#search_modal').is(":visible")) {
        current_visible = inputs[1];
    }

    return current_visible;
}

/**
 * Trigger a search in lunr and transform the result
 *
 * @param  {String} query
 * @return {Array}  results
 */
function search(query) {
    // Find the item in our index corresponding to the lunr one to have more info
    // Lunr result:
    //  {ref: "/section/page1", score: 0.2725657778206127}
    // Our result:
    //  {title:"Page1", href:"/section/page1", ...}
    return lunrIndex.search(query).map(function(result) {
        return pagesIndex.filter(function(page) {
            return page.href === result.ref;
        })[0];
    });
}

/**
 * Display the 10 first results
 *
 * @param  {Array} results to display
 */
function renderResults(results) {
    if (!results.length) {
        var $result = $('<h3 class="p-3">No Results, try a different phrase above</h3>');
        $results.append($result);
    }

    // Only show the ten first results
    results.slice(0, 10).forEach(function(result) {
        var $result = $('<li class="search_list pr-4">');
        $result.append($("<a>", {
            href: result.href,
            text: result.title,
            class: "search_link red-underline"
        }));
        $result.append($("<p>", {
            text: result.description,
            class: "normal"
        }));
        $results.append($result);
    });

}

// Let's get started
initLunr();

$(document).ready(function() {
    initUI();
});