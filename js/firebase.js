	$(document).ready(function () {
	    var database = firebase.database();
	    //Create refernces
	    var dbRef = database.ref();
	    var placename = [];
	    var longitude = [];
	    var latitude = [];
	    var userInfo = document.getElementById('textlist');
	    var userInfoText = [];
	    var ullist = document.getElementById('list');

	    var map;

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

	    getlongandlat(initMap);

	});
	//獲取經緯度
	function getlongandlat(callback) {
        var name = new Array();
	    for (i = 0; i < 270; i++) {

	        dbRef.child(`${i}`).on('value', function (data) {
	            placename[i] = data.val();
	            //			$('#searchbar').autocomplete({source: placename});
	            //callback(placename);
	            longitude[i] = Object.values(placename[i])[4];
	            latitude[i] = Object.values(placename[i])[5];

                name[i] = placename[i])[0];

	            console.log(Object.values(placename[i])[0]);

                $('#searchbar').autocomplete({source: name});

	        });
	    }
	    callback();
	}

	//	function initMap() {
	//		console.log(long);
	map = new google.maps.Map(document.getElementById('map'), {
	    zoom: 12,
	    center: new google.maps.LatLng(25.04, 121.54),
	    mapTypeId: 'roadmap'
	});

	var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
	var icons = {
	    parking: {
	        icon: iconBase + 'parking_lot_maps.png'
	    },
	    library: {
	        icon: iconBase + 'library_maps.png'
	    },
	    info: {
	        icon: iconBase + 'info-i_maps.png'
	    }
	};

	var features = [
	    {
	        position: new google.maps.LatLng(25.025879, 121.506281),
	        type: 'info'
          }
        ];

	// Create markers.
	features.forEach(function (feature) {
	    var marker = new google.maps.Marker({
	        position: feature.position,
	        icon: icons[feature.type].icon,
	        map: map
	    });
	});
	//	}

	function snapshotToArray(snapshot) {
	    var returnArr = [];

	    snapshot.forEach(function (childSnapshot) {
	        var item = childSnapshot.val();
	        item.key = childSnapshot.key;

	        returnArr.push(item);
	    });

	    return returnArr;
	};
