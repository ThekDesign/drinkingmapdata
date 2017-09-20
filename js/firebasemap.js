$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCtLlrzFQ3BMAFosmp5sspNCUfk7AXBWnc",
        authDomain: "drinkmap-dec5e.firebaseapp.com",
        databaseURL: "https://drinkmap-dec5e.firebaseio.com",
        projectId: "drinkmap-dec5e",
        storageBucket: "",
        messagingSenderId: "885775453119"
    };
    firebase.initializeApp(config);

    getlongandlat();
});

//獲取經緯度
function getlongandlat() {

    var database = firebase.database();
    //Create refernces
    var dbRef = database.ref();
    var placename = [];
    var longitude = [];
    var latitude = [];
    var userInfo = document.getElementById('textlist');
    var userInfoText = [];
    var ullist = document.getElementById('list');

    for (i = 0; i < 270; i++) {

        dbRef.child(`${i}`).on('value', function (data) {
            placename[i] = data.val();
            //			$('#searchbar').autocomplete({source: placename});
            //callback(placename);
            longitude[i] = Object.values(placename[i])[4];
            latitude[i] = Object.values(placename[i])[5];

           var locations = [{
                lat: latitude[i],
                lng: longitude[i]
            }];

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: {
                    lat: 25.04,
                    lng: 121.54
                }
            });

            // Create an array of alphabetical characters used to label the markers.
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

            // Add some markers to the map.
            // Note: The code uses the JavaScript Array.prototype.map() method to
            // create an array of markers based on a given "locations" array.
            // The map() method here has nothing to do with the Google Maps API.
            var markers = locations.map(function (location, i) {
                return new google.maps.Marker({
                    position: location,
                    label: labels[i % labels.length]
                });
            });

            // Add a marker clusterer to manage the markers.
            var markerCluster = new MarkerClusterer(map, markers, {
                imagePath: 'https://github.com/googlemaps/js-marker-clusterer/tree/gh-pages/images/m'
                //		imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });

            console.log(Object.values(placename[i])[0]);

        });

    }
}
