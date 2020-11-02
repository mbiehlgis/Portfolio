var map;
var minValue;
var attributes = []; //making a global attribute variable with an empty array
var dataStats = {}; //making a global variable list to append max, mean, and min values to

function createMap(){
    // create map and set parameters
     map = L.map('mapid', {
        center: [36.20, 136.25],
        zoom: 2,
        minZoom: 5,
        maxZoom: 8,
        maxBounds: [(25.2, 115.7), (45.7, 155.54)],
    });

                                          //Potential Dark Mode Map//
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    // 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    // 	subdomains: 'abcd',
    // 	maxZoom: 30
    // }).addTo(map);
    // map.zoomControl.setPosition('topright');
    // getData();

    L.tileLayer('https://api.mapbox.com/styles/v1/mbiehlgis/ckh0sg05k01y219sc7owxzeqx/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWJpZWhsZ2lzIiwiYSI6ImNrODZwaW9vODBrNWUzZm1jdjJzeHF0OTkifQ.UpFmEKrUbl4A7qD8nuaHUQ', {
    	subdomains: 'abcd',
    	maxZoom: 30,
      accessToken: 'pk.eyJ1IjoibWJpZWhsZ2lzIiwiYSI6ImNrODZwaW9vODBrNWUzZm1jdjJzeHF0OTkifQ.UpFmEKrUbl4A7qD8nuaHUQ'
    }).addTo(map);
    map.zoomControl.setPosition('topright');
    getData();


    // L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
	  //   maxZoom: 30,
	  //   attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);
    //
    // //adds zoom controls to map and sets it position, I set to be in the top right but added padding for it to be in the bottom left but above my legend
    // map.zoomControl.setPosition('topright');
    //
    // //calls get data function
    // getData();
};


function calcPropRadius(attValue) {

     var minRadius = 4.5;

                  //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

     return radius;
};

//calculate radius for each proportional symbol on map
function createPropSymbols(data, attributes){

    L.geoJson(data, {

        pointToLayer: function(feature, latlng){

            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


function calcStats(data){

    // create empty array to store values in
    var allValues = [];

    // for loop to loop through table and push year values to the empty array above
    for(var prefecture of data.features){

        for(var year = 1980; year <= 2010; year += 5){

            var value = prefecture.properties["Pop_" + String(year)];

            allValues.push(value);
        }
    }
    var minValue = Math.min(...allValues);

    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
    console.log(dataStats) //checking if list is being added to

    return minValue;
}

// function to create sequence controls
function createSequenceControls(attributes){

    //variable to set container for sequences in bottom left using L.
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        // creating divs and naming classes for slider and buttons in the container
        onAdd: function () {

            var container = L.DomUtil.create('div', 'sequence-control-container');

            $(container).append('<input class="range-slider" type="range">');

            $(container).append('<button class="step" id="reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward">Forward</button>');

            //disabling clicks on container from affecting map
            L.DomEvent.disableClickPropagation(container);

            //returning the sequence container
            return container;
        }
    });

    // adding new controls to the map
    map.addControl(new SequenceControl());

    //setting slider parameters
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

    $('.range-slider').on('input', function(){

        var index = $(this).val();

        updatePropSymbols(attributes[index]);
    });

    //$('#panel').append('<button class="step" id="reverse">Reverse</button>');//appending button classes to panel
    //$('#panel').append('<button class="step" id="forward">Forward</button>');
    $('#reverse').html('<img src="assets/img/left_arrow.svg">'); // linking each button to the appropriate svg
    $('#forward').html('<img src="assets/img/right_arrow.svg">');

    //function to move slider forward upon user click
    $('.step').click(function(){

            var index = $('.range-slider').val();

            //if statements to determine whether to move forward or back depending on what was clicked
            if ($(this).attr('id') == 'forward'){
                index++;

                index = index > 6 ? 0 : index;
            } else if ($(this).attr('id') == 'reverse'){
                index--;

                index = index < 0 ? 6 : index;
            };

            $('.range-slider').val(index);

            updatePropSymbols(attributes[index]); //calling updatePropSymbols function and can only pass in attributes since it was defined in the callback ajax function
  });

// updates prop symbols to be in sync with slider position
function updatePropSymbols(attribute){

    map.eachLayer(function(layer){

        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = createPopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();

            popup.setContent(popupContent).update();
    };

    var year = attribute.split("_")[1];
    $('span.year').html(year);

})};

};

//convert points to circles in layer
function pointToLayer(feature, latlng, attributes){
    //creates marker options
    var attribute = attributes[0];

    // styling for the circles which are pink with white borders
    var geojsonMarkerOptions = {
        fillColor: "#FF69B4",
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5,
    };

    //creating a variable that will be used to assign the attribute value for each feature
    // the attribute is the population per prefecture
    var attValue = Number(feature.properties[attribute]);

    //each circle will now have a radius based on its attribute value (population)
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //variable to return the circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    // variable to hold popup content values
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind popup to each circle
    layer.bindPopup(popupContent, {
          //offset so that popup doesn't cover up circle
          offset: new L.Point(0, -geojsonMarkerOptions.radius * 0.5)
       });

    //returns layer with circle markers
    return layer;
};

//function to create content to be shown in popups
function createPopupContent(properties, attribute){

    // variable is equal to a string and the property in the data that relates to it
    var popupContent = "<p><b>Prefecture:</b> " + properties.Prefecture + "</p>";

    // variable to get year columns, split at the underscore to just have the numbers
    var year = attribute.split("_")[1];

    // appending string with year variable and population attribute to the popupcontent variable
    popupContent += "<p><b>Population in " + year + ":</b> " + properties[attribute] + " people</p>";

    //returns the variable
    return popupContent;
};

//legend for temporal and attributes
function createLegend(attributes){

    //adds a control panel to the bottom right of the map, control is a leaflet default to add things on map itself
    var legendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },


        onAdd: function () {
            // create the control container with 'legend-control-container' as the class name
            var container = L.DomUtil.create('div', 'legend-control-container');

                //appends temporal legend div to the container above
                //the string in the div element is a default value when opening the map that displays the first year
                $(container).append('<div id="temporal-legend">Population in <span class="year">1980</span></div>');

            // creating the attribute legend
            // using an svg tag with an id of 'attribute-legend'
            var svg = '<svg id="attribute-legend" width="160px" height="65px">';

            // variable equal to an array holding the values I intend to have on legend
            var circles = ["max", "mean", "min"];

            // for loop to append each circle and text to the svg tag
            for (var i=0; i<circles.length; i++){

                // variable containing the max, mean, and min variables created with the dataStats function
                var radius = calcPropRadius(dataStats[circles[i]]);
                console.log(radius);// log to show me the actual values of my legend as a check

                //variable to change the center y coordinate in order to nest the circes by subtracting their radii
                var cy = 59 - radius

                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="'+radius+'" fill="#FF69B4" fill-opacity="0.8" stroke="white" cx="30" cy="'+cy+'"/>'

                var textY = i * 20 + 20;

                svg += '<text id="' + circles[i] + '-text" fill="white" x="65" y="' + textY + '">' + Math.round(dataStats[circles[i]]) + " people" + '</text>';

          }

            svg += "</svg>";

            //append the svg to the container
            $(container).append(svg);

            //disables the legend from having clicks that would affect the map view
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    //adding controls to the map
    map.addControl(new legendControl());

};

//function to fill the global attribute arrau variable at top of page
function processData(data){

    //variable to store the first feature in the data
    var properties = data.features[0].properties;

    //for loop to push each attribute name into array
    for (var attribute in properties){ // looping through values with an index of "Pop" and pushing them to the array if they have a value greater than 0

        //indexOf will only allow attributes with population values to be pushed
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);

        };
    };

    return attributes; //returns attributes array to be used in callback
};

//function to retrieve the data from geojson
function getData(map){

    //load the data and call other functions
    $.getJSON("data/JapanPop.geojson", function(response){

            //creates attribute array from processData function return
            var attributes = processData(response); //variable created within this function, I could have also made attributes a global variable at the beginning

            minValue = calcStats(response);

            calcStats(response);

            createPropSymbols(response,attributes);

            createLegend(attributes);

            createSequenceControls(attributes);

            calcStats(response);

        });

};

//Loads map when all functions run and are ready for display
$(document).ready(createMap);
