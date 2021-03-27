
var parksAPIKey = "cLPFutN3JOEcVqfEXTU1EekbZDczkTNkqEsKFCDX";
var weatherAPIKey = "8192203cac5ae6d369c41fb47e14d962";
var parksData = {};
var totalPages = 0;
var currentPage = 1;
var historyList = {
    text: [],
    id: []
};

// funtion to get parks from (word, state);
var getPark = function(word, state) {
    var apiUrl = "https://developer.nps.gov/api/v1/parks?q=" + word + "&stateCode=" + state + "&api_key=" + parksAPIKey;
    if (!word) {
        var apiUrl = "https://developer.nps.gov/api/v1/parks?stateCode=" + state + "&api_key=" + parksAPIKey;
    }
    if (!state)
    var apiUrl = "https://developer.nps.gov/api/v1/parks?q=" + word + "&api_key=" + parksAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {
                parksData = data;
                console.log(parksData);
                // call display data function
                pagesDefinition(parksData);
            });
        } else {
            alert("Error: " + response.status);
        }
    });
};

// funtion to get single park by code (parkCode);
var getParkByCode = function(parkCode) {
    var apiUrl = "https://developer.nps.gov/api/v1/parks?parkCode=" + parkCode + "&api_key=" + parksAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                // call display data function with park index and data
                var index = 0;
                displayParkInfo(index, data);
            });
        } else {
            alert("Error: " + response.status);
        }
    });
};

// function to get weather by lat and lon 
var getWeather = function(lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + weatherAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                // call current weather display function
                
            });
        } else {
            alert("Error: " + response.status);
        }
    });
};

// result number of pages definition function
var pagesDefinition = function (data) {
    totalPages = Math.floor((data.total - 1) / 10) + 1;
    displaySearchResults(data);
};

// right button was clicked
$("#right").on("click", function () {
    // go to next page if current is not the last one
    if (currentPage < totalPages) {
        currentPage++;
        displaySearchResults(parksData);
    } else {
        return false;
    }
});

// left button was clicked
$("#left").on("click", function () {
    // go to previous page if current is not the first one
    if (currentPage > 1) {
        currentPage--;
        displaySearchResults(parksData);
    } else {
        return false;
    }
});

// function to display list of search results (need a UL element with id=search-list on html)
var displaySearchResults = function(data) {
    var total = data.total;
    var iMax = currentPage * 10;
    if (total < iMax) {
        iMax = total;
    }      
    // clears data before displaying new one
    $("#search-list").empty();
    for (i = (currentPage - 1)*10; i < iMax; i++) {
        $("#search-list").append("<li id='" + i + "'>" + data.data[i].fullName + ' - ' + data.data[i].states + "</li>");        
    }
    $("#page-info").text("Page " + currentPage + " of " + totalPages);
};

// One of the parks in search result was clicked
$("#search-list").click (function(e) {
    var parkId = e.target.id;
    $("#history-list").prepend("<li id='" + parksData.data[parkId].parkCode + "'>" + parksData.data[parkId].fullName + ' - ' + parksData.data[parkId].states + "</li>");
    // call history filter function
    historyCrop();
    // call display data function with park index and data
    displayParkInfo(parkId, parksData);
});

// History list crop and saving funtion
var historyCrop = function() {
    // convert li elements text content into an object of arrays 
    historyList.text = $("ul#history-list > li").map(function(j, element) { 
        return $(element).text(); 
    }).get();
    historyList.id = $("ul#history-list > li").map(function(j, element) { 
        return $(element).attr("id"); 
    }).get();
    // cut the array at a max of 10 and eliminate the extra elements
    if (historyList.text.length > 10) {
        historyList.text.length  = 10;
        historyList.id.length = 10;
        $("ul#history-list > li").slice(10).remove();
    }
    // call save function
    saveHistoryList();
};

// save history to localstorage
var saveHistoryList = function() {
    localStorage.setItem("history-list", JSON.stringify(historyList));
};

// load history from localstorage
var loadHistory = function() {
    var loadedHistoryList = JSON.parse(localStorage.getItem("history-list"));
    if (loadedHistoryList) {
        for (i = 0; i < loadedHistoryList.id.length; i++) {
            $("#history-list").append("<li id='" + loadedHistoryList.id[i] + "'>" + loadedHistoryList.text[i] + "</li>");
        }
    }
};

// Clear History button was click
$("#clear").on("click", function() {
    $("#history-list").empty();
    historyList = {
        text: [],
        id: []
    };
    saveHistoryList();
});

// city on history was clicked
$("#history-list").click (function(e) {
    var parkName = e.target.innerText;
    var parkCode = e.target.id;
    // remove element clicked from list
    $("#" + parkCode).remove();
    // add clicked element to top of the list
    $("#history-list").prepend("<li id='" + parkCode + "'>" + parkName + "</li>");
    // call history list crop and saving function
    historyCrop();
    // call the get park by Id function
    getParkByCode(parkCode);
});

// click on search button. Get city name and pass to getWeather
$("#search").on("click", function() {
    var searchWord = $("#word").val();
    var state = $("#state-select").val();
    if ((searchWord) || (state)) {
        getPark(searchWord, state);
    } else {
        alert("You must enter a search word and/or select state to search");
    }
});

// Display park data function
var displayParkInfo = function(index, data) {
    // display park name
    $("#park-name").text(data.data[index].fullName);
    // call pictures pagination filter
   

    // display park description
    $("#park-description").text("Description: " + data.data[index].description);
    // display park activities
    var activities = "";
    for (i = 0; i < data.data[index].activities.length; i++) {
        if (i < data.data[index].activities.length - 2) {
            activities += data.data[index].activities[i].name + ", ";
        }
        if (i === data.data[index].activities.length - 2) {
            activities += data.data[index].activities[i].name;
        }
        if (i === data.data[index].activities.length - 1) {
            activities += " and " + data.data[index].activities[i].name + ".";
        } 
    }
    $("#activities").text("Activities: " + activities);
    // entrance fees display
    $("#entrance-fees").empty();
    $("#entrance-fees").append("<p>Entrance Fees:</p>");
    for (i = 0; i < data.data[index].entranceFees.length; i++) {
        $("#entrance-fees").append("<p>Cost: $" + data.data[index].entranceFees[i].cost + ", " + data.data[index].entranceFees[i].description + "</p>");
    }
    





};



















loadHistory();








