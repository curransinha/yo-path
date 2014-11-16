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
	  totalDistance += distBetween(markerArray[ih], markerArray[ih-1], "K")
	}
	markerArray.push(endPos)
	var lengthOfMarker = markerArray.length
	alert(markerArray[lengthOfMarker-1])
	totalDistance += distBetween(markerArray[lengthOfMarker-1], markerArray[lengthOfMarker-2], "K")
	document.getElementById("travelled").innerHTML += totalDistance;
	alert(totalDistance)
	
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


	var distBetween = function distance(pos1, pos2, unit) {
	var lat1 = pos1.lat()
	var lat2 = pos2.lat()
	var long1 = pos1.lono()
	var long2 = pos2.lon()
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

