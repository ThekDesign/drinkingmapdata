var configs = {
	apiKey: "AIzaSyCtLlrzFQ3BMAFosmp5sspNCUfk7AXBWnc",
	authDomain: "drinkmap-dec5e.firebaseapp.com",
	databaseURL: "https://drinkmap-dec5e.firebaseio.com",
	projectId: "drinkmap-dec5e",
	storageBucket: "",
	messagingSenderId: "885775453119"
};
firebase.initializeApp(this.configs);

var mapcontroller = new Vue({
	el: '#map',
	data: {
		getplace: [],
		allplace: [],
		placename: [],
		address: [],
		opentime: [],
		management: [],
		longitude: [],
		latitude: [],
		Administrativearea: [],
		setplace: [],
		connect: [],
		numberofdrinker: [],
		getlocation: [],
		autocomplete_text: [],
	},
	methods: {
		//從Firebase拿取所有資料(Object)，放到allplace裡面
		getInfo: function (getplace) {
			firebase.database().ref().once('value', snap => {
				this.getplace.push(snap.val());
				this.setInfo(this.getplace);
			});
		},
		allsetting: function () {
			this.getInfo(this.allplace);
		},
		setInfo: function (allplace) {
			//從Firebase拿取資料(Object)換成Array的形式push到自己定義的陣列中
			for (j = 0; j < Object.keys(allplace[0]['id']).length; j++) {
				this.placename.push(allplace[0]['id'][`${j}`]['場所名稱']);
				this.address.push(allplace[0]['id'][`${j}`]['場所地址']);
				this.opentime.push(allplace[0]['id'][`${j}`]['場所開放時間']);
				this.management.push(allplace[0]['id'][`${j}`]['管理單位']);
				this.longitude.push(allplace[0]['id'][`${j}`]['經度']);
				this.latitude.push(allplace[0]['id'][`${j}`]['緯度']);
				this.Administrativearea.push(allplace[0]['id'][`${j}`]['行政區']);
				this.setplace.push(allplace[0]['id'][`${j}`]['設置地點']);
				this.connect.push(allplace[0]['id'][`${j}`]['連絡電話']);
				this.numberofdrinker.push(allplace[0]['id'][`${j}`]['飲水台數']);
				//從這邊拿取經緯度
				this.getlocation.push({
					"lat": this.latitude[j],
					"lng": this.longitude[j]
				});
				//Autocomplete的部份，去除重複元素，搜尋範圍限制在開頭文字
				this.autocomplete_text.push(this.placename[j], this.address[j], this.Administrativearea[j]);
			}

			//去除重複元素
			this.result = this.autocomplete_text.filter(function (element, index, arr) {
				return arr.indexOf(element) === index;
			});
			//限制成開頭
			$('.searchTerm').autocomplete({
				source: function (request, response) {
					this.matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
					response($.grep(this.result, function (item) {
						return this.matcher.test(item);
					}));
				}
			});

			//將蒐集的標點匯入到Google Map上
			this.initialize(this.getlocation);
			google.maps.event.addDomListener(window, 'load', this.initialize);


		},
		//搜尋框進行搜尋動作後要做的動作
		searching: function () {
			search_success = false;
			searchloacation = [];
			for (k = 0; k < Object.keys(this.allplace[0]['id']).length; k++) {
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
		},
		testbutton: function() {
			swal("錯誤！", "請輸入正確的地點！", "error");
		},
		refresh: function () {
			this.initialize(this.getlocation);
			google.maps.event.addDomListener(window, 'load', this.initialize);
		},
		//將標點點在地圖上的function
		initialize: function (locations) {
			center = new google.maps.LatLng(25.04, 121.54);
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: 12,
				center: center,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});

			labels = 'D';
			markers = locations.map(function (location, i) {
				return new google.maps.Marker({
					position: location,
					label: labels[i % labels.length],
				});
			});

			options = {
				imagePath: 'images/markers/m'
			};

			markerCluster = new MarkerClusterer(map, markers, options);
		},
		aftersearch: function (searchloacation, center_lat, center_lng, zoom) {
			center = new google.maps.LatLng(center_lat, center_lng);
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: zoom,
				center: center,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});

			labels = 'D';
			markers = searchloacation.map(function (location, i) {
				return new google.maps.Marker({
					position: location,
					label: labels[i % labels.length],
				});
			});

			options = {
				imagePath: 'images/markers/m'
			};

			markerCluster = new MarkerClusterer(map, markers, options);
		},
		CalculateAvgLat: function (searcharray) {
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
		},
		CalculateAvgLng: function (searcharray) {
			var total_lng = 0;
			var avg_lng;
			for (m = 0; m < searcharray.length; m++) {
				total_lng = total_lng + searcharray[m]['lng'];
			}
			avg_lat = total_lng / searcharray.length;
			return avg_lat;
		}
	}
});

mapcontroller.allsetting();
