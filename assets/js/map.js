//-----------Current Date----------//
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
var lastCompletedDay;
var lastCompletedMonth;
var lastCompletedYear;
var completeHabitState;

function getCurrentDate(){
    if (dd < 10) {
      dd = '0' + dd;
    }
    
    if (mm < 10) {
      mm = '0' + mm;
    }
    
    today = mm + '/' + dd + '/' + yyyy;
    console.log(today);
}

// -----------Firebase Code----------//
var userDetail;
var currentUserId;
var preloadMap = true;

function getCurrentUser() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = firebase.auth().currentUser;
            currentUserId = currentUser.uid;
            firebase.database().ref('items/' + currentUserId).on('value', function (snapshot) {
                userDetail = snapshot.val();
                //Expected Result
                //{age: "32", gender: "Female", habits: [{daysLeft: 0, frecuency: ["Mo", "We", "Fr"], id: 1, location: {lat: 0, long: 0}, name: "Yoga"},{{daysLeft: 0, frecuency: ["Mo", "We", "Fr"], id: 1, location: {lat: 0, long: 0}, name: "Gym"}}], name: "Monica Desantiago 2"}
                console.log(userDetail);
                addChartData();
                if(preloadMap == true){
                    var geoSuccess = function (position) {
                        startPos = position;
                        posLat = position.coords.latitude;
                        posLong = position.coords.longitude;
                        initMap();
                        getCurrentDate();
                        console.log('Mapreloaded');
                        // preloadMarker();
                    };
                    navigator.geolocation.getCurrentPosition(geoSuccess);
                    preloadMap = false;
                    lastCompletedDay = userDetail.habits[0].lastDayCompleted[1];
                    lastCompletedMonth = userDetail.habits[0].lastDayCompleted[0];
                    lastCompletedYear = userDetail.habits[0].lastDayCompleted[2];
                    completeHabitState = userDetail.habits[0].state;

                    if(parseInt(mm) == lastCompletedMonth && parseInt(dd) == lastCompletedDay && parseInt(yyyy) == lastCompletedYear && completeHabitState == false){
                        console.log("TODAY ALREADY COMPLETED");
                        timerCanStart = false;
                    }else{
                        userDetail.habits[0].state = true;
                        timerCanStart = true;
                        $('#completeHabit1').addClass('hover');
                        updateUserInformation(userDetail);
                    }
                }
            });

        } else {
            console.log("returning to home user not logged in");
            window.location.href = "home.html";
        }
    });
}

function updateUserInformation(Userdata) {
    firebase.database().ref('items/').child(currentUserId).update(Userdata)
        .then((snap) => {
            //TODO: PLEASE RETURN TO A PROPER PAGE IT CAN BE THE SAME PAGE YOU ARE 
            // window.location.href="dashboard.html"; 
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            showError(errorMessage);
            console.log(errorCode);
            console.log(errorMessage);
            // ...
        });
}
//--------------Data for Map--------------//

var map, service, infowindow, marker, center, startPos, posLat, posLong, searchState, queryText, myPosition, iconLink, icon;
var setHabitButtonState = true;
var queryPosition = 0;
var queryPositionCounter = 7;
var markerSetAsHabit = false;
var onloadMarker = true;
var range = 2000; //ft
var currentHabitCoord = [];
var queryCoord = [];
var placeArray = [];
var markerIcon = {
    "1": ["./assets/imgs/mapImg/gym.png", 27],
    "2": ["./assets/imgs/mapImg/parks.png", 35],
    "3": ["./assets/imgs/mapImg/yoga.png", 38],
    "4": ["./assets/imgs/mapImg/spinning.png", 30],
    "5": ["./assets/imgs/mapImg/dance.png", 30],
    "6": ["./assets/imgs/mapImg/rock.png", 28],
    "7": ["./assets/imgs/mapImg/custom.png", 35],
    "8": ["./assets/imgs/mapImg/custom.png", 35],
    "9": ["./assets/imgs/mapImg/custom.png", 35]
};
var habitCoord = {};

//-------------Timer Vars----------------//
var timerCanStart = false;
var timeAtHabit = 5 * 2;
var timerVar;
var timePercentage;
var minutes = 0;
var seconds = 0;
var tens = 0;
var time = 0;


window.onload = function () {
    $('.progress').hide();
    $('#timerDisplay').hide();
    $('#completeHabit1').hide();
    $('#habit1Metrics').hide();
    getCurrentUser();
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: posLat, lng: posLong },
        zoom: 15
    });
    marker = new google.maps.Marker({
        position: { lat: posLat, lng: posLong },
        map: map
    });
    if (onloadMarker == true) {
        google.maps.event.addListener(marker, 'click', function () {
            var infowindow = new google.maps.InfoWindow();
            infowindow.setContent('<p>You Are Here<p>');
            infowindow.open(map, this);
        });
        onloadMarker = false;
    }
    myPosition = [posLat, posLong];
    $('.preloader-background').delay(600).fadeOut('slow');
    $('.preloader-wrapper').fadeOut();
    
    if (userDetail.habits[0].name == "" || !userDetail.habits[0].address) {
        $('.habitButton').eq(0).addClass('hover');
        $('#modifyHabit').hide();
        return;
    } else {
        marker = new google.maps.Marker({
            position: { lat: userDetail.habits[0].location.lat, lng: userDetail.habits[0].location.long },
            map: map,
            icon: {
                url: markerIcon["7"][0],
                scaledSize: new google.maps.Size(markerIcon["7"][1], markerIcon["7"][1]), // scaled size
            },
        });
        markerSetAsHabit = false;
        setHabitButtonState = false;
        $('#habitName').text(userDetail.habits[0].name);
        $('#habitAddress').text(userDetail.habits[0].address);

        if(userDetail.habits[0].state==true){
            $('.progress').show('slow');
            $('#timerDisplay').show('slow');       
        }else{
            $('#completeHabit1 h4').text('Habit Completed!');
            $('#completeHabit1').show('slow');
        }
        $('#habit1Metrics').show('slow');
        $('#completeHabit1').show('slow');
    }
}

function searchPlaces() {
    var userPosition = new google.maps.LatLng(posLat, posLong);
    var request = {
        location: userPosition,
        radius: '500',
        query: queryText
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
};

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK && searchState == "false") {
        placeArray[queryPosition] = [];
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    } else if (searchState == "true") {
        setMapOnAll(null);
    }
}

function createMarker(place) {
    icon = {
        url: markerIcon[iconLink][0],
        scaledSize: new google.maps.Size(markerIcon[iconLink][1], markerIcon[iconLink][1]), // scaled size
    };
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP,
        icon: icon
    });

    google.maps.event.addListener(marker, 'click', function () {
        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + place.formatted_address + '</div>');
        infowindow.open(map, this);

        if (markerSetAsHabit == true) {
            markerSetAsHabit = false;
            setHabitButtonState = false;
            timerCanStart = true;
            preloadMap = true;
            currentHabitCoord = [place.geometry.location.lat(), place.geometry.location.lng()];
            userDetail.habits[0].location.lat = currentHabitCoord[0];
            userDetail.habits[0].location.long = currentHabitCoord[1];
            userDetail.habits[0].name = place.name;
            userDetail.habits[0].address = place.formatted_address;
            updateUserInformation(userDetail)
            $('.habitButton').eq(0).removeClass('hover');
            $('#habitName').text(place.name);
            $('#habitAddress').text(place.formatted_address);
            $('#completeHabit1 h4').text('Complete Habit!');
            $('#completeHabit1').show('slow');
            $('#habit1Metrics').show('slow');
            $('.progress').show('slow');
            $('#timerDisplay').show('slow');
            $('#modifyHabit').show('slow');
        }
    });
    placeArray[queryPosition].push(marker);
}

function setMapOnAll(map) {
    for (var i = 0; i < placeArray[queryPosition].length; i++) {
        placeArray[queryPosition][i].setMap(map);
    }
}

function searchButton() {
    iconLink = $(this).attr('data-position');
    queryPosition = $(this).attr('data-position');
    searchState = $(this).attr('data-state');
    queryText = $(this).attr('data-name');
    // console.log(iconLink);
    // console.log(queryPosition);
    // console.log(searchState);
    // console.log(queryText);
    searchPlaces();
    if ($(this).attr('data-state') == "false") {
        $(this).attr('data-state', 'true');
    } else if ($(this).attr('data-state') == "true") {
        $(this).attr('data-state', 'false');
    }
};

function timerQuarter() {
    time++
    if (time == timeAtHabit) {
        stopTimer();
        var month = parseInt(mm)-1;
        userDetail.habits[0].totalCompleted[month]++;
        userDetail.habits[0].lastDayCompleted = [parseInt(mm),parseInt(dd),parseInt(yyyy)];
        $('#completeHabit1').removeClass('hover');
        $('#completeHabit1 h4').text(`Today's Habit is Completed!`);
        $('.progress').hide();
        $('#timerDisplay').hide();
        userDetail.habits[0].state = false;
        updateUserInformation(userDetail);
    } else if (time == 270) {
        navigator.geolocation.getCurrentPosition(geoSuccess);
        if (!getDistanceFromLatLonInFt(myPosition[0], myPosition[1], userDetail.habits[0].location.lat, userDetail.habits[0].location.long)) {
            stopTimer();
            alert("You are too far away from your habit location!");
            time = 0;
            seconds = 0;
            tens = 0;
            minutes = 0;
        }
    }

    if (seconds < 9) {
        seconds++;
    } else if (tens < 5) {
        seconds = 0;
        tens++
    } else if (tens = 6) {
        seconds = 0;
        tens = 0;
        minutes++
    }

    $('#timerDisplay').text(minutes + ':' + tens + '' + seconds);
    timePercentage = (time / timeAtHabit) * 100;
    $('#habit1Timer').css('width', timePercentage + '%');
}

function stopTimer() {
    clearInterval(timerVar);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function getDistanceFromLatLonInFt(lat1, lon1, lat2, lon2) {
    var R = 20924640; // Radius of the earth in ft
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in ft
    console.log(d);
    if (d > range) {
        alert(`You are not close enough! Out of range by: ${Math.floor(d-range)} ft`);
        return false;
    } else {
        $(this).css('background-color', 'red');
        return true;
    }
}

//-----------------Extra Features (Not In Use)-----------------//
function preloadMarker() {
    console.log(userDetail.preload);
    for(let i = 0; i<userDetail.preload.length; i++){
        iconLink = userDetail.preload[i].position + "";
        queryPosition = userDetail.preload[i].position + "";
        searchState = userDetail.preload[i].state + "";
        queryText = userDetail.preload[i].name;
        console.log(queryText)
        searchPlaces();
    }
}

function addButt() {
    var $butt = $('<button></button>');
    $butt.append($('input').val());
    $butt.addClass('btn btn-success location');
    $butt.attr('data-state', 'false');
    $butt.attr('data-name', $('input').val());
    $butt.attr('data-position', queryPositionCounter);
    $butt.on('click', searchButton);
    $('.allLocations').append($butt);
    queryPositionCounter++;
}