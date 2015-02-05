// Application namespace
var weatherapp = weatherapp || {};



(function() {












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



// Data Models
weatherapp.city1 = {
	searchResults : {},
	weather_current : {},
	name : '',
	id : 0
};

weatherapp.city2 = {
	searchResults : {},
	weather_current : {},
	name : '',
	id : 0
};

weatherapp.chart = {};












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

	var getUSState = function(suggestionElem, geocodingParams, listItem, suggestionList) {
		$.get(weatherapp.geocoding.url + '?' + $.param(geocodingParams))
		.done(function(data) {
			for (var i = 0; i < data.results[0].address_components.length; i++) {
				if (data.results[0].address_components[i].types.indexOf("administrative_area_level_1") > -1) {
					suggestionElem.append(', ' + data.results[0].address_components[i].short_name);
					suggestionElem.data('city_name', suggestionElem.data('city_name') + ', ' + data.results[0].address_components[i].short_name);
				}
			}

			suggestionElem.append(', ' + listItem.sys.country);
			suggestionElem.data('city_name', suggestionElem.data('city_name') + ', ' + listItem.sys.country);
			suggestionList.append(suggestionElem);
			
		});
	}

	if (data.count) {

		for (var i = 0; i < data.count; i++) {
			listItem = data.list[i];
			suggestionElem = $('<li class="wa-suggestions-elem">');

			if (listItem.name) {
				suggestionElem.append(listItem.name)
				suggestionElem.data('city_id', listItem.id);
				suggestionElem.data('city_name', listItem.name);
			}

			if (listItem.sys && listItem.sys.country) {
				if (listItem.sys.country == 'US') {
					icons.find('.fa-spinner').addClass('is-active').removeClass('is-inactive');

					geocodingParams = {
						'key' : weatherapp.geocoding.apikey,
						'latlng' : listItem.coord.lat + ',' + listItem.coord.lon
					}

					getUSState(suggestionElem, geocodingParams, listItem, suggestionList);


				} else {
					suggestionElem.append(', ' + listItem.sys.country);
					suggestionElem.data('city_name', suggestionElem.data('city_name') + ', ' + listItem.sys.country);
					suggestionList.append(suggestionElem);
				}
			}

			icons.find('.fa-spinner').addClass('is-inactive').removeClass('is-active');
		}

		suggestionList.css('min-width', container.width());
		suggestionList.removeClass('is-closed');

	} else {
		icons.find('.fa-exclamation-circle').toggleClass('is-active is-inactive');
	}
}








function citysearch() {
	var input = $(this),
			findParameters = $.extend({}, weatherapp.openweathermap.options.find, {'q':input.val()}),
			urlString = weatherapp.openweathermap.urls.find + '?' + $.param(findParameters),
			icons = input.siblings('.wa-icon-container'),
			city = input.closest('.wa-city-search').data('citymodel');

	icons.find('.fa-spinner').toggleClass('is-active is-inactive');
	console.log('making ajax request for q=' + input.value);


	$.get(urlString)
		.done(function(data) {
			icons.find('.fa-spinner').toggleClass('is-active is-inactive');
			populateSearchSuggestions(input, data);
			weatherapp[city].searchResults = data;
		}).fail(function() {
			icons.find('.fa-spinner').toggleClass('is-active is-inactive');
			icons.find('.fa-exclamation-triangle').toggleClass('is-active is-inactive');
		});
};



var citysearch_debounced = debounce(citysearch, 750);










// Search funtionality

$('.wa-city-search').on('keydown.city-search', 'input', citysearch_debounced)
	.on('click.select-city', '.wa-suggestions-elem', function() {
		var elem = $(this),
				cityName = elem.data('city_name'),
				cityID = elem.data('city_id'),
				input = elem.closest('.wa-city-search').find('input'),
				city = elem.closest('.wa-city-search').data('citymodel');

		input.val(cityName);

		weatherapp[city].name = cityName;
		weatherapp[city].id = cityID;
		weatherapp[city].weather_current = weatherapp[city].searchResults.list.filter(function( obj ) {
			return obj.id == cityID;
		})[0];

		elem.parent().addClass('is-closed');
});



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











}());