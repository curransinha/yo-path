function initialize() {
	console.log("h");
	var mainArray = window.pts;
	var maxLat = -1000
	var maxLong = -1000
	var minLat = 1000
	var minLong = 1000
	for (var i=0; i<(mainArray.length)-1; i++){
		if(mainArray[i]<minLat)
			minLat = mainArray[i]
		 if(mainArray[i]>maxLat)
			maxLat = mainArray[i]
		if(mainArray[i]<minLong)
			minLong = mainArray[i+1]
		if(mainArray[i]>maxLong)
			maxLong = mainArray[i+1]
	}
	var centerLat = mainArray[0]//((maxLat + minLat)/2)
	var centerLong = mainArray[1]//((maxLong + minLong)/2)
	console.log(maxLat)
	console.log(maxLong);
	console.log(minLat);
	console.log(minLong);
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
	      title: 'Hello World!'
	  });
	for (var i=2; i<(mainArray.length)-3; i= i+2){
		if(mainArray[i]<minLat)
			minLat = mainArray[i]
		else if(mainArray[i]>maxLat)
			maxLat = mainArray[i]
		if(mainArray[i+1]<minLong)
			minLat = mainArray[i+1]
		else if(mainArray[i+1]>maxLong)
			maxLat = mainArray[i+1]
		var location = new google.maps.LatLng(mainArray[i],mainArray[i+1])
		markerArray.push(location)
		new google.maps.Marker({
	      position: location,
	      map: map,
	      title: 'Hello World!'
	  });
	}
	markerArray.push(endPos)
	new google.maps.Marker({
	      position: endPos,
	      map: map,
	      title: 'Hello World!'
	  });

	  var flightPlanCoordinates = markerArray
  	var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

		flightPath.setMap(map);
	}

	google.maps.event.addDomListener(window, 'load', initialize);
