function markerSize(magnitude) {
  return magnitude * 30000;
};

function makerColor(marker) {
  var colors = ['lightgreen','yellowgreen','yellow','orange','salmon','red'];
  return  marker > 5? colors[5]:
          marker > 4? colors[4]:
          marker > 3? colors[3]:
          marker > 2? colors[2]:
          marker > 1? colors[1]:
          colors[0];
};

function createlayers(data) {
  var earthquake = L.geoJSON(data,{
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3 > Magnitude: "+ feature.properties.mag + 
      "</h3><h3>Location: " + feature.properties.place +
      "</h3><hr><h3>" + new Date(feature.properties.time) + "</h3>" );
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: markerSize(feature.properties.mag),
        fillColor: makerColor(feature.properties.mag),
        fillOpacity: .8,
        color: 'grey',
        weight: .5
      })
    }    
  });

  createMap(earthquake);
};  
  
function createMap(earthquakes) {
  var url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
  var accessToken = 'pk.eyJ1IjoiY2FwMDE1NzAwIiwiYSI6ImNqZng1ZjBhbjQxMWozM21kZzkzNW1kdjAifQ.VdaKJu8FPaDob9yWS4kTSw';
  var light = L.tileLayer(url, {id: 'mapbox.light', maxZoom: 20, accessToken: accessToken});
  var outdoor = L.tileLayer(url, {id: 'mapbox.run-bike-hike', maxZoom: 20, accessToken: accessToken});
  var satellite = L.tileLayer(url, {id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: accessToken});

  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (tecPlateData) {
    L.geoJSON(tecPlateData,
      {
        color: 'orange',
        weight: 2
      })
      .addTo(tectonicPlates);
  });    

  var baseMaps = {
    "Grayscale": light,
    "Outdoors": outdoor,
    "Satellite Map" : satellite
  };
  
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  var myMap = L.map("map-id", {
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [light, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(map) {

    var div = L.DomUtil.create('div','info legend'),
        magnitude = [0,1,2,3,4,5],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
    for (var i=0; i < magnitude.length; i++){
      div.innerHTML +=
        '<i style="background:' + makerColor(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i+1]?'&ndash;' + magnitude[i+1] +'<br>': '+');
      }
      return div;
  };
  legend.addTo(myMap);
}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeData) {
    createlayers(earthquakeData.features);
});