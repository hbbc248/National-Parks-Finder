
var parksAPIKey = "cLPFutN3JOEcVqfEXTU1EekbZDczkTNkqEsKFCDX";
var weatherAPIKey = "8192203cac5ae6d369c41fb47e14d962";

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
                console.log(data);
                // call display data function

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








