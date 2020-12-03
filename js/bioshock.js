var map;
var minValue;
var attributes = []; //making a global attribute variable with an empty array
var dataStats = {}; //making a global variable list to append max, mean, and min values to

function createMap(){
    // create map and set parameters
     map = L.map('mapid', {
        center: [39.0119, 261.5158],
        zoom: 4,
        minZoom: 2,
        maxZoom: 20,
    });

    L.tileLayer('https://api.mapbox.com/styles/v1/mbiehlgis/ck86q6jjm0h6f1jpacswyunt3/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWJpZWhsZ2lzIiwiYSI6ImNrODZwaW9vODBrNWUzZm1jdjJzeHF0OTkifQ.UpFmEKrUbl4A7qD8nuaHUQ', {
        subdomains: 'abcd',
        maxZoom: 30,
        accessToken: 'pk.eyJ1IjoibWJpZWhsZ2lzIiwiYSI6ImNrODZwaW9vODBrNWUzZm1jdjJzeHF0OTkifQ.UpFmEKrUbl4A7qD8nuaHUQ'
      }).addTo(map);
      map.zoomControl.setPosition('bottomright');

};


//Loads map when all functions run and are ready for display
$(document).ready(createMap);
