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
    el: '#contain',
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
        input_text: ''
    },
    methods: {
        getInfo: function (allplace) {
            this.placedata(allplace);
            this.setInfo(allplace);
        },
        allsetting: function () {
            //從Firebase拿取所有資料(Object)，放到allplace裡面
            firebase.database().ref().once('value', snap => {
                this.getplace.push(snap.val());
                this.getInfo(this.getplace);
            });
        },
        placedata: function (allplace) {
            //從Firebase拿取資料(Object)換成Array的形式push到自己定義的陣列中
            for (j = 0; j < Object.keys(allplace['0']['id']).length; j++) {
                this.placename.push(allplace['0']['id'][`${j}`]['場所名稱']);
                this.address.push(allplace['0']['id'][`${j}`]['場所地址']);
                this.opentime.push(allplace['0']['id'][`${j}`]['場所開放時間']);
                this.management.push(allplace['0']['id'][`${j}`]['管理單位']);
                this.longitude.push(allplace['0']['id'][`${j}`]['經度']);
                this.latitude.push(allplace['0']['id'][`${j}`]['緯度']);
                this.Administrativearea.push(allplace['0']['id'][`${j}`]['行政區']);
                this.setplace.push(allplace['0']['id'][`${j}`]['設置地點']);
                this.connect.push(allplace['0']['id'][`${j}`]['連絡電話']);
                this.numberofdrinker.push(allplace['0']['id'][`${j}`]['飲水台數']);
                //從這邊拿取經緯度
                this.getlocation.push({
                    "lat": this.latitude[j],
                    "lng": this.longitude[j]
                });
                //Autocomplete的部份，去除重複元素，搜尋範圍限制在開頭文字
                this.autocomplete_text.push(this.placename[j], this.address[j], this.Administrativearea[j]);
            }
            //autocomplete use data
            this.autocompletes();
        },
        setInfo: function (allplace) {
            //將蒐集的標點匯入到Google Map上
            this.initialize(this.getlocation);
            google.maps.event.addDomListener(window, 'load', this.initialize);
        },
        autocompletes: function () {
            //去除重複元素
            ac_text = this.autocomplete_text;
            result = ac_text.filter(function (element, index, arr) {
                return arr.indexOf(element) === index;
            });
            //限制成開頭
            $('.searchTerm').autocomplete({
                source: function (request, response) {
                    matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
                    response($.grep(result, function (item) {
                        return matcher.test(item);
                    }));
                }
            });
        },
        searching: function () {
            search_success = false;
            searchloacation = [];
            s_allplace = this.getplace;
            s_placename = this.placename;
            s_address = this.address;
            s_latitude = this.latitude;
            s_longitude = this.longitude;
            s_Administrativearea = this.Administrativearea;
            for (m = 0; m < Object.keys(s_allplace[0]['id']).length; m++) {
                if ($('.searchTerm').val() == s_placename[m]) {

                    searchloacation.push({
                        "lat": s_latitude[m],
                        "lng": s_longitude[m]
                    });

                    this.aftersearch(searchloacation, s_latitude[m], s_longitude[m], 19);

                    $('html,body').animate({
                        scrollTop: $('#map').offset().top - 55
                    }, 1000);
                    search_success = true;
                    break;
                } else if ($('.searchTerm').val() == s_address[m]) {

                    searchloacation.push({
                        "lat": latitude[m],
                        "lng": longitude[m]
                    });
                    this.aftersearch(searchloacation, s_latitude[m], s_longitude[m], 19);

                    $('html,body').animate({
                        scrollTop: $('#map').offset().top - 55
                    }, 1000);
                    search_success = true;
                    break;
                } else if ($('.searchTerm').val() == s_Administrativearea[m]) {

                    indices = [];
                    element = `${$('.searchTerm').val()}`;
                    idx = s_Administrativearea.indexOf(element);
                    while (idx != -1) {
                        indices.push(idx);
                        idx = s_Administrativearea.indexOf(element, idx + 1);
                    }
                    for (o = 0; o < indices.length; o++) {
                        searchloacation.push({
                            "lat": s_latitude[indices[o]],
                            "lng": s_longitude[indices[o]]
                        });
                    }
                    lat_center = this.CalculateAvgLat(searchloacation);
                    lng_center = this.CalculateAvgLng(searchloacation);
                    this.aftersearch(searchloacation, lat_center, lng_center, 15);
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
        //搜尋框進行搜尋動作後要做的動作
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
            total_lat = 0;
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
            total_lng = 0;
            for (m = 0; m < searcharray.length; m++) {
                total_lng = total_lng + searcharray[m]['lng'];
            }
            avg_lat = total_lng / searcharray.length;
            return avg_lat;
        },
        refresh: function () {
            this.initialize(this.getlocation);
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
        }
    }
});


$(document).ready(function () {

    mapcontroller.allsetting();

});
