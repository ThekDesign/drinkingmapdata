$(document).ready(function () {

	var allplace = [];
	var placename = [];
	var address = [];
	var opentime = [];
	var management = [];
	var longitude = [];
	var latitude = [];
	var Administrativearea = [];
	var setplace = [];
	var connect = [];
	var numberofdrinker = [];
	var getlocation = [];
	var autocomplete_text = [];
	var search_bar = $('#searchbar');

	// Firebase的初始設定連結
	var config = {
		apiKey: "AIzaSyCtLlrzFQ3BMAFosmp5sspNCUfk7AXBWnc",
		authDomain: "drinkmap-dec5e.firebaseapp.com",
		databaseURL: "https://drinkmap-dec5e.firebaseio.com",
		projectId: "drinkmap-dec5e",
		storageBucket: "",
		messagingSenderId: "885775453119"
	};
	firebase.initializeApp(config);

	getInfo(allplace);

	setTimeout(function () {
		//從Firebase拿取資料(Object)換成Array的形式push到自己定義的陣列中
		for (j = 0; j < Object.keys(allplace['0']).length; j++) {
			placename.push(allplace['0'][`${j}`]['場所名稱']);
			address.push(allplace['0'][`${j}`]['場所地址']);
			opentime.push(allplace['0'][`${j}`]['場所開放時間']);
			management.push(allplace['0'][`${j}`]['管理單位']);
			longitude.push(allplace['0'][`${j}`]['經度']);
			latitude.push(allplace['0'][`${j}`]['緯度']);
			Administrativearea.push(allplace['0'][`${j}`]['行政區']);
			setplace.push(allplace['0'][`${j}`]['設置地點']);
			connect.push(allplace['0'][`${j}`]['連絡電話']);
			numberofdrinker.push(allplace['0'][`${j}`]['飲水台數']);
			//從這邊拿取經緯度
			getlocation.push({
				"lat": latitude[j],
				"lng": longitude[j]
			});
			//Autocomplete的部份，去除重複元素，搜尋範圍限制在開頭文字
			autocomplete_text.push(placename[j], address[j], Administrativearea[j]);
		}
		//去除重複元素
		var result = autocomplete_text.filter(function (element, index, arr) {
			return arr.indexOf(element) === index;
		});
		//限制成開頭
		search_bar.autocomplete({
			source: function (request, response) {
				var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
				response($.grep(result, function (item) {
					return matcher.test(item);
				}));
			}
		});
		//將蒐集的標點匯入到Google Map上
		initialize(getlocation);
		google.maps.event.addDomListener(window, 'load', initialize);
		//搜尋框進行搜尋動作後要做的動作
		$('#btn_search').on('click', function () {
			var search_success = false;
			for (k = 0; k < Object.keys(allplace['0']).length; k++) {
				if (search_bar.val() == placename[k]) {
					console.log(placename[k]);
					$('html,body').animate({
						scrollTop: $('#map').offset().top - 55
					}, 1000);
					search_success = true;
					break;
				} else if (search_bar.val() == address[k]) {
					console.log(address[k]);
					$('html,body').animate({
						scrollTop: $('#map').offset().top - 55
					}, 1000);
					search_success = true;
					break;
				} else if (search_bar.val() == Administrativearea[k]) {
					console.log(Administrativearea[k]);
					$('html,body').animate({
						scrollTop: $('#map').offset().top - 55
					}, 1000);
					search_success = true;
					break;
				}
			}
			if (!search_success) {
				swal("Wrong!", "Please try again!", "error");
			}
		});
	}, 2000);

});

//從Firebase拿取所有資料(Object)，放到allplace裡面
function getInfo(allplace) {
	var database = firebase.database();
	//Create refernces
	var dbRef = database.ref();
	var userInfo = document.getElementById('textlist');
	var userInfoText = [];
	var ullist = document.getElementById('list');
	(function () {
		dbRef.on('value', function (data) {
			allplace.push(data.val());
		});
	})();
	return allplace;
}
//將標點點在地圖上的function
function initialize(locations) {
	var center = new google.maps.LatLng(25.04, 121.54);
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: center,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var labels = 'D';
	var markers = locations.map(function (location, i) {
		return new google.maps.Marker({
			position: location,
			label: labels[i % labels.length],
		});
	});

	var options = {
		imagePath: 'images/markers/m'
	};

	var markerCluster = new MarkerClusterer(map, markers, options);
}
