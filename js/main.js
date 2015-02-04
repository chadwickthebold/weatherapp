jQuery(function() {


// Application namespace
var weatherapp = weatherapp || {};













// Utility functions

// Debounce function from underscore
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};










/**********************************
 Application Configuration
**********************************/



// Configuration options
weatherapp.options = {
	'lang' : 'en',
	'units' : 'metric'
};





// OpenWeatherMap specific configuration
weatherapp.openweathermap = {}

weatherapp.openweathermap.apikey = 'b3bca1dfe94a0bce42d25c1533403005';

weatherapp.openweathermap.urls = {
	'find' : 'http://api.openweathermap.org/data/2.5/find',
	'current' : 'http://api.openweathermap.org/data/2.5/weather',
	'forecast3h' : 'http://api.openweathermap.org/data/2.5/forecast',
	'forecast16d' : 'http://api.openweathermap.org/data/2.5/forecast/daily',
	'history' : 'http://api.openweathermap.org/data/2.5/history/city'
};

weatherapp.openweathermap.options = {};

weatherapp.openweathermap.options.find =  {
	'q' : '',
	'type' : 'like',
	'units' : weatherapp.options.units,
	'APIID' : weatherapp.openweathermap.apikey
};








// reverse geocoding specific configuration
weatherapp.geocoding = {
	'apikey' : 'AIzaSyC6y5K_nqcuCxnqOTpKc6JVA2M0p_vQ9oI',
	'url' : 'https://maps.googleapis.com/maps/api/geocode/json'
}















/**********************************
 City Search
**********************************/










function populateSearchSuggestions(input, data) {
	var searchbox = $(input),
			container = searchbox.closest('.wa-city-search'),
			suggestionList = container.find('.wa-search-suggestions').empty(),
			icons = $(input).siblings('.wa-icon-container'),
			geocodingParams,
			listItem,
			suggestionElem;

	if (data.count) {

		for (var i = 0; i < data.count; i++) {
			listItem = data.list[i];
			suggestionElem = $('<li class="wa-suggestions-elem">');

			if (listItem.name) {
				suggestionElem.append(listItem.name)
			}

			if (listItem.sys && listItem.sys.country) {
				if (listItem.sys.country == 'US') {
					// icons.find('.fa-spinner').addClass('is-active').removeClass('is-inactive');

					// geocodingParams = {
					// 	'key' : weatherapp.geocoding.apikey,
					// 	'latlng' : listItem.coord.lat + ',' + listItem.coord.lon
					// }

					// $.get(weatherapp.geocoding.url + '?' + $.param(geocodingParams))
					// 	.done(function(data) {
					// 		//suggestionElem.append(', ' + data.results[0].addressComponents);
					// 	}).fail(function() {

					// 	}).always(function() {
					// 		icons.find('.fa-spinner').addClass('is-inactive').removeClass('is-active');
					// 		suggestionElem.append(', ' + listItem.sys.country);
					// 	});

					
					


				} else {
					suggestionElem.append(', ' + listItem.sys.country);
				}
			}

			suggestionList.append(suggestionElem);
		}

		suggestionList.css('min-width', container.width());
		suggestionList.toggleClass('is-closed');

	} else {
		icons.find('.fa-exclamation-circle').toggleClass('is-active is-inactive');
	}
}








function citysearch() {
	var input = this,
			findParameters = $.extend({}, weatherapp.openweathermap.options.find, {'q':input.value}),
			urlString = weatherapp.openweathermap.urls.find + '?' + $.param(findParameters),
			icons = $(input).siblings('.wa-icon-container');

	icons.find('.fa-spinner').toggleClass('is-active is-inactive');
	console.log('making ajax request for q=' + input.value);


	$.get(urlString)
		.done(function(data) {
			icons.find('.fa-spinner').toggleClass('is-active is-inactive');
			populateSearchSuggestions(input, data);
		}).fail(function() {
			icons.find('.fa-spinner').toggleClass('is-active is-inactive');
			icons.find('.fa-exclamation-triangle').toggleClass('is-active is-inactive');
		});
};

var citysearch_debounced = debounce(citysearch, 750);










// Search funtionality
$('#city1-search').on('keydown.city1-search', citysearch_debounced);



// Tooltip functionality
$('.fa[title]').qtip({
	style : {
		classes : 'wa-tooltip qtip-shadow'
	},
	position: {
		my: 'bottom center',
		at: 'top center'
	}
});











/**********************************
 Forecast Charting
**********************************/




// Should end up with these elements
weatherapp.city1 = {}
weatherapp.city2 = {}
weatherapp.chart = {}







});