

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
var url_plate = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";


// color function
function chooseColor(magnitude) {
    switch (true) {
    case magnitude > 5:
        return "#581845";
    case magnitude > 4:
        return "#900C3F";
    case magnitude > 3:
        return "#C70039";
    case magnitude > 2:
        return "#FF5733";
    case magnitude > 1:
        return "#FFC300";
    default:
        return "#DAF7A6";
    }
}

// marker size function
function markerSize(magnitude) {
    if (magnitude === 0) {
    return 1;
    }
    return magnitude * 3;
}

function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: chooseColor(feature.properties.mag),
      color: "#000000",
      radius: markerSize(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
}

// earthquake point
d3.json(url_plate,function(plateDate){

    d3.json(url,function(data){
        console.log(data)
        // console.log(data.features[0].geometry.coordinates);
        createFeatures(data.features,plateDate.features);
    }); 
})
    


function createFeatures(earthquakeData,plateDateset){
    function onEachFeature(feature,layer){
        layer.bindPopup("<h4>Location: " + feature.properties.place + 
        "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
        "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    };

    // earthquake cirle
    var earthquakes = L.geoJSON(earthquakeData,{
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style:styleInfo,
        onEachFeature: onEachFeature
    })

    // Fault lines
    var myStyle = {
        "color":"orange",
        "weight": 5,
        "opacity": 1,
        "fillOpacity":0.01,
        "weight":1.5
    };
    var faultLine = L.geoJSON(plateDateset, {
        style: myStyle
    })

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes,faultLine);
}

function createMap(earthquakes,faultLine){
    // Adding tile layer to the map
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Map": satellite,
        "Dark Map": darkmap
    };
    
    var overlayMaps = {
        Earthquakes: earthquakes,
        "Fault lines":faultLine
    };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 3,
        layers: [earthquakes,satellite]
    });
    
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
      }).addTo(myMap);
    

    // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [0, 1, 2, 3, 4, 5];

        div.innerHTML += "<h3>Magnitude</h3>"

        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend to the Map
    legend.addTo(myMap);
};