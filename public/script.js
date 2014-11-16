function initialize() {
	console.log("h");
	var mainArray = window.pts;
	var centerLat = mainArray[0]//((maxLat + minLat)/2)
	var centerLong = mainArray[1]//((maxLong + minLong)/2)
	var myLatlng = new google.maps.LatLng(centerLat,centerLong);
	  var mapOptions = {
	    zoom: 12,
	    center: myLatlng
	  }
	 var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	var markerArray = []
	var endIndex = mainArray.length-1
	var startPos = new google.maps.LatLng(mainArray[0],mainArray[1]);
	var endPos = new google.maps.LatLng(mainArray[endIndex-1],mainArray[endIndex]);

	markerArray.push(startPos);
	new google.maps.Marker({
	      position: startPos,
		icon: {
  		path: google.maps.SymbolPath.CIRCLE,
  		scale: 10
			},
	      map: map,
	      title: 'Start'
	  });
	var totalDistance;
	for (var i=2; i<(mainArray.length)-2; i= i+2){
		var location = new google.maps.LatLng(mainArray[i],mainArray[i+1])
		markerArray.push(location)
		new google.maps.Marker({
	      position: location,
	      map: map,
	      title: 'Plot ' + (i/2)
	  });
		var ih = i/2
		totalDistance += distBetween(markerArray[ih], markerArray[ih-1])
	}
	markerArray.push(endPos)
	var lengthOfMarker = markerArray.length
		totalDistance += distBetween(markerArray[lengthOfMarker],markerArray[lengthOfMarker-1])
	new google.maps.Marker({
	      position: endPos,
	      map: map,
	      title: 'End'
	  });

	var flightPlanCoordinates = markerArray
  	var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: .9,
    strokeWeight: 2
  });

		flightPath.setMap(map);
	}

	google.maps.event.addDomListener(window, 'load', initialize);


	var distBetween = function(pos1,pos2){
		var R = 6371; // km
		lat1 = pos1.lat();
		lon1 = pos1.lng();
		lat2 = pos2.lat();
		lon1 = pos2.lng();
		var φ1 = lat1.toRadians();
		var φ2 = lat2.toRadians();
		var Δφ = (lat2-lat1).toRadians();
		var Δλ = (lon2-lon1).toRadians();

		var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		        Math.cos(φ1) * Math.cos(φ2) *
		        Math.sin(Δλ/2) * Math.sin(Δλ/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		var d = R * c;
		return d*3280.84;
	}
