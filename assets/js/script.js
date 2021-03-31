var parksAPIKey = "cLPFutN3JOEcVqfEXTU1EekbZDczkTNkqEsKFCDX";
var weatherAPIKey = "8192203cac5ae6d369c41fb47e14d962";
var parksData = {};
var singleParkData = {};
var totalPages = 0;
var currentPage = 1;
var picPage = 0;
var picPageMax = 0;
var historyList = {
    text: [],
    id: []
};


// funtion to get parks from (word, state);
var getPark = function(city, state) {
    var apiUrl = "https://developer.nps.gov/api/v1/parks?q=" + city + "&stateCode=" + state + "&api_key=" + parksAPIKey;
    if (!city) {
        var apiUrl = "https://developer.nps.gov/api/v1/parks?stateCode=" + state + "&api_key=" + parksAPIKey;
    }
    if (!state)
    var apiUrl = "https://developer.nps.gov/api/v1/parks?q=" + city + "&api_key=" + parksAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                if (data.data.length === 0) {
                    $("#error-message").text("No National Parks found with that keyword, please try something else.")
                    $(".modal").addClass("is-active");
                    return false;
                }
                // show results container
                $("#search-results-container").show();
                // call display data function
                pagesDefinition(data);
            });
        } else {
            $("#error-message").text("National Parks server response error. Please try again later.")
            $(".modal").addClass("is-active");
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
            $("#error-message").text("National Parks server response error. Please try again later.")
            $(".modal").addClass("is-active");
        }
    });
};

// function to get weather by lat and lon 
var getWeather = function(lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + weatherAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(weatherData) {
                console.log(weatherData);
                // call current weather display function
                displayWeather(weatherData);
            });
        } else {
            $("#error-message").text("OpenWeather server response error. Please try again later.")
            $(".modal").addClass("is-active");
        }
    });
};

// result number of pages definition function
var pagesDefinition = function (data) {
    // set aside data to global variable for other function to use and in case search bottom is clicked again.
    parksData = data;
    totalPages = Math.floor((data.data.length - 1) / 10) + 1;
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
    var total = data.data.length;
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
    // remove form history if exist in there
    var elId = parksData.data[parkId].parkCode;
    if ($("#"+elId)) {
        $("#"+elId).remove();  
    }
    // add on top of history list
    $("#history-list").prepend("<li id='" + elId + "'>" + parksData.data[parkId].fullName + ' - ' + parksData.data[parkId].states + "</li>");
    // show history elements if they are hidden
    $("#history-container").show();
    $("#clear").show();
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
    if (loadedHistoryList.id.length) {
        $("#history-container").show();
        $("#clear").show();
        for (i = 0; i < loadedHistoryList.id.length; i++) {
            $("#history-list").append("<li id='" + loadedHistoryList.id[i] + "'>" + loadedHistoryList.text[i] + "</li>");
        }
    }
};

// Clear History button was click
$("#clear").on("click", function() {
    // hide history elements
    $("#history-container").hide();
    $("#clear").hide();
    // clear history element and save
    $("#history-list").empty();
    historyList = {
        text: [],
        id: []
    };
    saveHistoryList();
});

// Park on history was clicked
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

// click on search button. 
$("#search").on("click", function() {
    // get values from word and state and pass to function
    var searchWord = $("#word").val();
    var state = $("#state-select").val();
    if ((searchWord) || (state)) {
        // reset current page
        currentPage = 1;
        // Call get park function
        getPark(searchWord, state);
    } else {
        $("#error-message").text("You must use at least one search key. Type a keyword or select a state to search.")
        $(".modal").addClass("is-active");

    }
});

$(".close, .popup-overlay").on("click", function() {
    $(".popup-overlay, .popup-content").removeClass("active");
});

// Display park data function
var displayParkInfo = function(index, data) {
    // display park name
    $("#park-name").text(data.data[index].fullName);
    // puts single park data into global variable to be use by other  functions
    singleParkData = data.data[index];
    console.log(singleParkData);
    // call pictures display
    picDisplay();
    // get park lat and long for weather
    var lat = data.data[index].latitude;
    var lon = data.data[index].longitude;
    // call weather fetch with lat and long
    getWeather(lat, lon);
    // display park description
    $("#park-description-title").empty();
    $("#park-description-title").text("Description:");
    $("#park-description").empty();
    $("#park-description").text(data.data[index].description);
    $("#park-description").append("</br></br>");
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
    $("#activities-title").empty();
    $("#activities-title").text("Activities: ");
    $("#activities").empty();
    $("#activities").text(activities);
    $("#activities").append("</br></br>");
    
    // entrance fees display
    $("#entrance-fees").empty();
    $("#entrance-fees").text("Entrance Fees:");
    $("#entrance-fees-items").empty();
    for (i = 0; i < data.data[index].entranceFees.length; i++) {
        $("#entrance-fees-items").append("<p>Fee: $" + data.data[index].entranceFees[i].cost + ", " + data.data[index].entranceFees[i].description + "</p>");
    }
    $("#entrance-fees-items").append("</br>");

    // hours of operation display
    $("#operating-hours").empty();
    $("#operating-hours").text("Operating hours:");
    var hours = data.data[index].operatingHours;
    $("#operating-hours-items").empty();
    for (i = 0; i < hours.length; i++) {
        $("#operating-hours-items").append("<p>" + (i+1) + ") " + hours[i].name + ". " + hours[i].description + "</p>");
        $("#operating-hours-items").append("<p>Open-Hours: Sunday: " + hours[i].standardHours.sunday + "; Monday: " + hours[i].standardHours.monday + "; Tuesday: " + hours[i].standardHours.tuesday + "; Wednesday: " + hours[i].standardHours.wednesday + "; Thursday: " + hours[i].standardHours.thursday + "; Friday: " + hours[i].standardHours.friday + "; Saturday: " + hours[i].standardHours.saturday + ".</p>");
        $("#operating-hours-items").append("<p><em><strong>Exception days (Park Closed):</strong></em></p>"); 
        var exceptions = hours[i].exceptions;
        if (exceptions.length > 0) {
            // for loop for exceptions (park closed days)
            for (e = 0; e < exceptions.length; e++) {
                $("#operating-hours-items").append("<p>* " + exceptions[e].name + ": from " + exceptions[e].startDate + " to " + exceptions[e].endDate + "</p>");
            }
        } else {
            $("#operating-hours-items").append("<p>No exceptions</p>"); 
        }
    }
    $("#operating-hours-items").append("</br>");
    // Directions display
    $("#directions").empty();
    $("#directions").append("<p class='title is-5'>Directions:</p>");
    $("#directions").append("<p>" + data.data[index].directionsInfo + "</p>");
    $("#directions").append("</br>");
    $("#directions").append("<a class='subtitle is-5' href='" + data.data[index].directionsUrl + "' target='_blank'>For more directions information click here.</a>");
    $("#directions").append("</br></br>");
    // More Park information link
    $("#more-info").empty();
    $("#more-info").text("For more Information about " + data.data[index].fullName + " click here");
    $("#more-info").attr("href", data.data[index].url);
    $("#more-info").attr("target", "_blank");
};

// park pictures pagination filter
var picDisplay = function() {
    picPage = 0;
    picPageMax = singleParkData.images.length - 1;
    // clean everything on pictures <div>
    $("#img-holder").empty();
    $("#img-holder").append("<p class='level-item title is-5' id='imgTitle'>" + singleParkData.images[picPage].title + "</p>");
    $("#img-holder").append("<img id='image' src='" + singleParkData.images[picPage].url + "' alt='" + singleParkData.images[picPage].altText + "'></img>");
    $("#img-holder").append("<p id='imgCaption'>" + singleParkData.images[picPage].caption + " - By: " + singleParkData.images[picPage].credit + ".</p></br>");
    var picNum = picPage + 1;
    var picLast = picPageMax + 1;
    $("#img-holder").append("<em><p class='level-item' id='pic-page'>Picture " + picNum + " out of " + picLast + "</p></em>");  
    // show sections
    $("#park-info-container").show();
    $("#all-weather-container").show();
    // scroll screen to park info in 500 miliseconds
    $('html, body').animate({
        scrollTop: ($('#park-info-container').first().offset().top)
    },500); 
};

// Previous picture button was clicked
$("#previous").on("click", function() {
    if (picPage > 0) {
        picPage--;
        // call new picture display
        newPictureDisplay();
    }
});

// Next picture button was clicked
$("#next").on("click", function() {
    if (picPage < picPageMax) {
        picPage++;
        // call new picture display
        newPictureDisplay();
    }
});
       
// new picture display
var newPictureDisplay = function() {
    $("#imgTitle").text(singleParkData.images[picPage].title);
    $("#image").attr("src", singleParkData.images[picPage].url);
    $("#image").attr("alt", singleParkData.images[picPage].altText);
    $("#imgCaption").text(singleParkData.images[picPage].caption + " - By: " + singleParkData.images[picPage].credit);
    var picNum = picPage + 1;
    var picLast = picPageMax + 1;
    $("#pic-page").text("Picture " + picNum + " out of " + picLast);
};

var displayWeather = function(weatherData) {
    $("#weather-description").text(weatherData.current.weather[0].main);
    $("#current-icon").attr("src", "http://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + "@2x.png");
    $("#temperature").text("Temperature: " + weatherData.current.temp + " \xB0F");
    $("#feels-like").text("Feels-like: " + weatherData.current.feels_like + " \xB0F");
    $("#humidity").text("Humidity: " + weatherData.current.humidity + " %");
    $("#wind-speed").text("Wind Speed: " + weatherData.current.wind_speed + " MPH");
    // UV index print
    var uvIndex = weatherData.current.uvi;
    $("#UV-index").empty();
    $("#UV-index").text("UV Index:");
    $("#UV-index").append("<span id='index' class='badge p-1 fs-6'></span>");
    $("#index").text(uvIndex);
    if (uvIndex <= 2) {
        $("#index").addClass("tag is-success");
    }
    if ((uvIndex > 2) && (uvIndex <=5)) {
        $("#index").addClass("tag is-warning");
    }
    if (uvIndex > 5) {
        $("#index").addClass("tag is-danger");
    }
    
    // display forecast data
    var forecastEl = $(".forecast");
    for (i = 0; i < forecastEl.length; i++) {
        // clean any previous data
        $(forecastEl[i]).empty();
        var forecastIndex = i + 1
        // get date for the forecast day
        var forecastDate = new Date(weatherData.daily[forecastIndex].dt * 1000);
        var forecastDay = forecastDate.getDate();
        var forecastMonth = forecastDate.getMonth() + 1;
        var forecastYear = forecastDate.getFullYear();
        // add date, image, temperature and humidity to html element
        $(forecastEl[i]).append("</br><p class='level-item subtitle is-5'>" + forecastMonth + "/" + forecastDay + "/" + forecastYear + "</p>");
        $(forecastEl[i]).append("<p class='level-item'><strong>" + weatherData.daily[forecastIndex].weather[0].main + "</strong></p>");
        $(forecastEl[i]).append("<div class='level-item'><img src='https://openweathermap.org/img/wn/" + weatherData.daily[forecastIndex].weather[0].icon + "@2x.png'></img></div>");
        $(forecastEl[i]).append("<p class='level-item'>Temp min: " + Math.floor(weatherData.daily[forecastIndex].temp.min) + " &#176F</p>");
        $(forecastEl[i]).append("<p class='level-item'>Temp max: " + Math.floor(weatherData.daily[forecastIndex].temp.max) + " &#176F</p>");
        $(forecastEl[i]).append("<p class='level-item' style='margin-bottom: 0px;'>Humidity: " + weatherData.daily[forecastIndex].humidity + " %</p>");
        
    }

}

// close modal Function
var closeModal = function () {
    $(".modal").removeClass("is-active");
    $("#error-message").empty();
    // clear value in keyword input
    $("#word").val("");
};

// modal close event lisenter
$(".modal-close").on("click", function(){
    closeModal();
});

// modal close event lisenter
$(".delete").on("click", function(){
    closeModal();
});

// this runs on page loading
// hide history elements, parkinfo and result elements
$("#park-info-container").hide();
$("#all-weather-container").hide();
$("#history-container").hide();
$("#clear").hide();
$("#search-results-container").hide();
loadHistory();