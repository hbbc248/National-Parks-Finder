
var parksAPIKey = "cLPFutN3JOEcVqfEXTU1EekbZDczkTNkqEsKFCDX";

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
            });
        } else {
            alert("Error: " + response.status);
        }
    });
};