var Profile = Profile || {};
(function ($, undefined) {
    //firebase.initializeApp(config);
    var habitsArr= [];
    var emailRegex =  new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$");
    var userData = {name : "", gender: "", age: 0, badges : [], habits : []};
    
    var name = "";
    var email = "";
    var password = "";
    var confirmPass = "";
    var gender = "";
    var age = "";
    var currentUserId = "";
    var days = "";
    var currentUser;
    var userDetail;


    Profile.Index = function () {
        function init() {
            initControls();
        }
        
        function initControls() {
            $("#btnLogOut").hide();
            var select = $('#age');

            for (var i = 18; i <= 100; i++) {
                $('<option>', { value: i, text: i }).appendTo(select);
            }

            $("#gender").change(function () {
                gender = $(this).children("option:selected").val();
            });

            $("#age").change(function () {
                age = $(this).children("option:selected").val();
            });
           
            $("#btnLogOut").on("click", function(){
                $("#btnLogOut").hide(); 
                $("#btnUpdate").hide();
                $("#alogIn").hide();
                logOut();
            });

            $("#btnUpdate").on("click", function(){
                getUserData();
                updateUserInformation(userDetail);
            });

            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    //we can save the extra data here
                     $("#btnLogOut").show();
                     $("#alogIn").hide();
                     currentUser = firebase.auth().currentUser;
                     currentUserId =  currentUser.uid;//firebase.auth().currentUser.uid; 
                     firebase.database().ref('items/'+ currentUserId).on('value', function(snapshot){
                        console.log("El snap" + snapshot.val());
                        userDetail = snapshot.val();
                        fillUserData(userDetail);
                    });
            
                  } else {
                    console.log("returning user to home");
                    window.location.href="home.html"; 
                  }
                });
        }

        function logOut(){
            firebase.auth().signOut()
            .then(function() {
                console.log("Sign-out successful.");
                $("#btnLogOut").hide();
                window.location.href="home.html"; 
            })
            .catch(function(error) {
                console.log(error.message);
            });
        }

        function fillUserData(user){
            $("#txtName").val(user.name);
            $("#txtEmail").val(currentUser.email);
            $("#gender").val(user.gender);
            $("#age").val(user.age);
        }

        function getUserData(){
           userDetail.name =  $("#txtName").val();
           userDetail.gender = $("#gender").val();
           userDetail.age = $("#age").val();
        }

        function updateUserInformation(Userdata){
            firebase.database().ref('items/').child(currentUserId).update(Userdata)
                .then((snap) => {
                    //currentUser = snap;
                    console.log(snap)
                    window.location.href="profile.html"; 
                }).catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    showError(errorMessage);
                    console.log(errorMessage);
                    // ...
                });
        }

        return {
            Init: init,
            LogOut: logOut
        };

    }();
        
})(jQuery);