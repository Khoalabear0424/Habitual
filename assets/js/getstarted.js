var StartPoint = StartPoint || {};
(function ($, undefined) {
    //firebase.initializeApp(config);
    var habitsArr = [];
    var preloadArr = [];
    var emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$");
    var userData = { name: "", gender: "", age: 0, badges: [], habits: [] };
    var name = "";
    var email = "";
    var password = "";
    var confirmPass = "";
    var gender = "";
    var age = "";

    StartPoint.Index = function () {
        function init() {
            initControls();
        }

        function initControls() {
            $("#habit").show();
            $("#signup").hide();   
            $('.materialboxed').materialbox();
			$('.modal').modal();

            $("#age").prepend("<option value=''>Select</option>").val('');
            $("#age").prop("selected", "selected")
            $("#gender").prop("selected", "selected")

            var select = $('#age');

            for (var i = 18; i <= 100; i++) {
                $('<option>', { value: i, text: i }).appendTo(select);
            }

            $("#gender").change(function () {
                gender = $(this).children("option:selected").val();
                console.log("gender changed");
            });

            $("#age").change(function () {
                age = $(this).children("option:selected").val();
                console.log("age changed");
            });

            $(".habits").on("click", function () {
                var totalCompleted =[0,0,0,0,0,0,0,0,0,0,0,0];
                var longestStreak = 0;
                var lastDayCompleted = [0,0,0];
                var habit = { id: 0,  name: "", lastDayCompleted, totalCompleted, longestStreak, daysLeft: 0, frequency: [], location: { long: 0, lat: 0 }};
                var preload = { state: false, position: 0,  name: ""};

                var selectedHabit = $(this).data("name");
                var id = parseInt($(this).data("id"));
                var idTag = this.id;

                if(habitsArr.length > 0){
                    if (includesHabit(habitsArr, selectedHabit) == false) {
                        $("#"+idTag).addClass("teal darken-2");//css("background-color","yellow");
                        //data-state="false" data-position=3 data-name="yoga"
                        habit.id = id;
                        habit.name = selectedHabit;
                        preload.name = $(this).data("name");
                        preload.state = $("#"+idTag).data("state");
                        preload.position = $("#"+idTag).data("position");
                        preloadArr.push(preload);
                        habitsArr.push(habit);
                    }
                    else{
                        $("#"+idTag).addClass("teal lighten-1")
                        removeHabit(habitsArr, selectedHabit);
                    }
                }else {
                    $("#"+idTag).addClass("teal darken-2");//css("background-color","yellow");
                        habit.id = id;
                        habit.name = selectedHabit;
                        habit.state = $("#"+idTag).data("state");
                        habit.position = $("#"+idTag).data("position");
                        habitsArr.push(habit);
                        preload.name = $(this).data("name");
                        preload.state = $("#"+idTag).data("state");
                        preload.position = $("#"+idTag).data("position");
                        preloadArr.push(preload);
                }
            });

            $("#btnNext").on("click", function () {
                $("#habit").hide();
                $("#signup").show();
            });

            $("#btnSignUp").on("click", function () {
                if (validateUserData()) {
                    userData.name = name;
                    userData.gender = gender;
                    userData.age = age;
                    userData.habits = habitsArr;
                    userData.preload = preloadArr;

                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(function (user) {
                            console.log(user);

                            updateUserInformation(name, email);
                        })
                        .catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            //showError(errorMessage);
                            console.log(errorMessage);
                            // ...
                        });
                }
            });

            $("#aLogin").on("click", function () {
                var email = $("#txtLogEmail").val();
                var logPass = $("#txtLogPassword").val()

                userLogin(email, logPass);
            });
        }


        // function publicFunction() {    
        // }
        function includesHabit(arr, habit){
            var found = false;
            for(var i = 0; i < arr.length; i++) {
                if (arr[i].name == habit) {
                    found = true;
                    break;
                }   
            }
            return found;
        }

        function removeHabit(arr, habit){
            for(var i = 0; i < arr.length; i++) {
                if (arr[i].name == habit) {
                    delete arr[i];
                }   
            }
        }

        function userLogin(email, password){
            if (email != "" && password != "") {
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                    .then(function () {
                        // Existing and future Auth states are now persisted in the current
                        // session only. Closing the window would clear any existing state even
                        // if a user forgets to sign out.
                        // ...
                        // New sign-in will be persisted with session persistence.
                        //var promise = firebase.auth().signInWithEmailAndPassword(email, password);
                        //promise.catch(e => console.log("message: " + e.message));
                        firebase.auth().signInWithEmailAndPassword(email, password)
                            .then(function (user) {
                                console.log("user " + user);
                                window.location.href = "dashboard.html";

                            })
                            .catch(function (error) {
                                // Handle Errors here.
                                var errorCode = error.code;
                                var errorMessage = error.message;
                                console.log(errorMessage);
                                // ...
                            });
                    })
                    .catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                    });
            }
        }

        function validateUserData() {

            var validData = true;
            name = $("#txtName").val();
            email = $("#txtEmail").val();
            password = $("#txtPassword").val();
            confirmPass = $("#txtConfirmPassword").val();

            if (email == "" && name == "" && password == "" && confirmPass == "") {
                alert("Please enter the information.");
                validData = false;
                return;
            } else {
                if (!emailRegex.test(email)) {
                    alert("Please enter a valid email.");
                    validData = false;
                    return;
                } else if (password.length <= 6) {
                    alert("Please enter a password with more than 6 characteres");
                    validData = false;
                    return;
                } else if (password != confirmPass) {
                    alert("Password does not match.")
                    validData = false;
                    return;
                } else if (age == "") {
                    alert("Please select age.")
                    validData = false;
                } else if (gender == "") {
                    alert("Please select age.")
                    validData = false;
                }
            }
            return validData;
        }

        function updateUserInformation(name, email) {
            firebase.auth().onAuthStateChanged(function(user) {
                name = name.charAt(0).toUpperCase() + name.slice(1);
                user.updateProfile({
                    displayName: name
                }).then(function () {
                    firebase.database().ref('items/').child(user.uid).set(userData)
                        .then(function (snap) {
                            console.log(snap)
                            window.location.href = "dashboard.html";
                            $("name").text();
                        }).catch(function () {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            //showError(errorMessage);
                            console.log(errorMessage);
                        });
                }).catch(function () {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                });
            });
        }
        
        return {
                Init: init,
                UserLogin: userLogin
            };
    }();
}) (jQuery);