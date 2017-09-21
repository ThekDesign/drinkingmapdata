$(document).ready(function () {

	var allplace = [];

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

	allsetting(allplace, setinfo);

});

function allsetting(allplace, callback) {
	getInfo(allplace, callback);
}

//從Firebase拿取所有資料(Object)，放到allplace裡面
function getInfo(getplace, callbacks) {
	var getplace = [];
	var databaseRef = firebase.database().ref();

	databaseRef.once('value', snap => {
		getplace.push(snap.val());
		callbacks(getplace);
	});
}

//拿取所有資料
function setinfo(allplace) {

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
	var search_bar = $('.searchTerm');

	//從Firebase拿取資料(Object)換成Array的形式push到自己定義的陣列中
	for (j = 0; j < Object.keys(allplace[0]['id']).length; j++) {
		placename.push(allplace[0]['id'][`${j}`]['場所名稱']);
		address.push(allplace[0]['id'][`${j}`]['場所地址']);
		opentime.push(allplace[0]['id'][`${j}`]['場所開放時間']);
		management.push(allplace[0]['id'][`${j}`]['管理單位']);
		longitude.push(allplace[0]['id'][`${j}`]['經度']);
		latitude.push(allplace[0]['id'][`${j}`]['緯度']);
		Administrativearea.push(allplace[0]['id'][`${j}`]['行政區']);
		setplace.push(allplace[0]['id'][`${j}`]['設置地點']);
		connect.push(allplace[0]['id'][`${j}`]['連絡電話']);
		numberofdrinker.push(allplace[0]['id'][`${j}`]['飲水台數']);
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
	$('.searchButton').on('click', function () {
		var search_success = false;
		var searchloacation = [];
		for (k = 0; k < Object.keys(allplace[0]['id']).length; k++) {
			if (search_bar.val() == placename[k]) {

				searchloacation.push({
					"lat": latitude[k],
					"lng": longitude[k]
				});

				aftersearch(searchloacation, latitude[k], longitude[k], 19);

				$('html,body').animate({
					scrollTop: $('#map').offset().top - 55
				}, 1000);
				search_success = true;
				break;
			} else if (search_bar.val() == address[k]) {

				searchloacation.push({
					"lat": latitude[k],
					"lng": longitude[k]
				});
				aftersearch(searchloacation, latitude[k], longitude[k], 19);

				$('html,body').animate({
					scrollTop: $('#map').offset().top - 55
				}, 1000);
				search_success = true;
				break;
			} else if (search_bar.val() == Administrativearea[k]) {

				var indices = [];
				var lat_center;
				var lng_center;
				var element = `${search_bar.val()}`;
				var idx = Administrativearea.indexOf(element);
				while (idx != -1) {
					indices.push(idx);
					idx = Administrativearea.indexOf(element, idx + 1);
				}
				for (h = 0; h < indices.length; h++) {
					searchloacation.push({
						"lat": latitude[indices[h]],
						"lng": longitude[indices[h]]
					});
				}
				console.log(searchloacation);
				lat_center = CalculateAvgLat(searchloacation);
				lng_center = CalculateAvgLng(searchloacation);
				aftersearch(searchloacation, lat_center, lng_center, 15);
				$('html,body').animate({
					scrollTop: $('#map').offset().top - 55
				}, 1000);
				search_success = true;
				break;
			}
		}
		if (!search_success) {
			swal("錯誤！", "請輸入正確的地點！", "error");
		}
	});

	$('.refreshButton').on('click', function () {
		initialize(getlocation);
	});
};

//將標點點在地圖上的function
function initialize(locations) {
	var center = new google.maps.LatLng(25.04, 121.54);
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
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

//將標點點在地圖上的function
function aftersearch(searchloacation, center_lat, center_lng, zoom) {
	var center = new google.maps.LatLng(center_lat, center_lng);
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: zoom,
		center: center,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var labels = 'D';
	var markers = searchloacation.map(function (location, i) {
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

function CalculateAvgLat(searcharray) {
	var total_lat = 0;
	var avg_lat;
	for (m = 0; m < searcharray.length; m++) {
		total_lat = total_lat + searcharray[m]['lat'];
		console.log(searcharray[m]['lat']);
	}
	avg_lat = total_lat / searcharray.length;
	console.log(searcharray[0]['lat']);
	console.log(total_lat);
	console.log(avg_lat);
	console.log(searcharray.length);
	return avg_lat;
}

function CalculateAvgLng(searcharray) {
	var total_lng = 0;
	var avg_lng;
	for (m = 0; m < searcharray.length; m++) {
		total_lng = total_lng + searcharray[m]['lng'];
	}
	avg_lat = total_lng / searcharray.length;
	return avg_lat;
}
