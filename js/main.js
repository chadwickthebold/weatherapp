/*
 * Application namespace
 */
var weatherapp = weatherapp || {};



(function() {



























/**********************************
 Utilities
**********************************/
weatherapp.util = {};

/*
 * Function debounce utility
 * Courtesy of David Walsh + Underscore
 */
weatherapp.util.debounce = function(func, wait, immediate) {
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
 Configuration
**********************************/



/*
 * Application Configuration
 */
weatherapp.options = {
	'lang' : 'en',
	'units' : 'metric'
};

































/*
 * openWeatherMap configuration and utilities
 */
weatherapp.openweathermap = (function() {
	var openweathermap = {},
			apikey = 'b3bca1dfe94a0bce42d25c1533403005',
			urls = {
				'find' : 'http://api.openweathermap.org/data/2.5/find?',
				'current' : 'http://api.openweathermap.org/data/2.5/weather?',
				'forecast3h' : 'http://api.openweathermap.org/data/2.5/forecast?',
				'forecast16d' : 'http://api.openweathermap.org/data/2.5/forecast/daily?',
				'history' : 'http://api.openweathermap.org/data/2.5/history/city?'
			},
			iconMap = { // Condition icons for weather-icons
				'01d' : 'wi-day-sunny',
				'01n' : 'wi-night-clear',
				'02d' : 'wi-day-cloudy',
				'02n' : 'wi-night-alt-cloudy',
				'03d' : 'wi-cloudy',
				'03n' : 'wi-cloudy',
				'04d' : 'wi-cloudy',
				'04n' : 'wi-cloudy',
				'09d' : 'wi-rain',
				'09n' : 'wi-rain',
				'10d' : 'wi-day-rain',
				'10n' : 'wi-night-alt-rain',
				'11d' : 'wi-day-thunderstorm',
				'11n' : 'wi-night-alt-thunderstorm',
				'13d' : 'wi-day-snow',
				'13n' : 'wi-night-alt-snow',
				'50d' : 'wi-dust',
				'50n' : 'wi-dust',
			}

		// Generic request to openweathermap API, returnes deferred object
		function request(url, params) {

			return $.get(url + $.param(params));

		}


		// Search for a given city name, returns array of objects with name and id
		function citySearch(name) {
			var params = {
				q : name,
				APIID : apikey,
				type : "like",
				units : weatherapp.options.units
			}

			return request(urls['find'], params);

		}

		// get the current weather for a given city ID
		function getCurrent(id) {
			var params = {
				id : id,
				APIDID : apikey,
				units : weatherapp.options.units
			};

			return request(urls['current'], params);
		}

		function getDaily(id) {
			var params = {
				id : id,
				APIID : apikey,
				units : weatherapp.options.units
			}

			return request(urls['forecast16d'], params);

		}

		function getHourly(id) {
			var params = {
				id : id,
				APIID : apikey,
				units : weatherapp.options.units
			}

			return request(urls['forecast3h'], params);
		}


	// Expose public attributes and methods
	(function(self) {
		self.apikey = apikey;
		self.urls = urls;
		self.getCurrent = getCurrent;
		self.getDaily = getDaily;
		self.getHourly = getHourly;
		self.citySearch = citySearch;
		self.iconMap = iconMap;
	}(openweathermap));

	return openweathermap;

}());
























/*
 * Geocoding configuration and utilities
 */
weatherapp.geocoding =  (function() {
	var geocoding = {},
			apikey = 'AIzaSyC6y5K_nqcuCxnqOTpKc6JVA2M0p_vQ9oI',
			url = 'https://maps.googleapis.com/maps/api/geocode/json?';

			// given comma separated lat/lng coodinates, return the short name of the US state. Assume admin level 1
			function requestState(latlng) {

				return $.get(url + "latlng=" + latlng);

			}

			// Get the US state given the geocode response
			function getState(data) {
				if (data.results.length) {
					for (var i = 0; i < data.results[0].address_components.length; i++) {
						if (data.results[0].address_components[i].types.indexOf("administrative_area_level_1") > -1) {
							return data.results[0].address_components[i].short_name;
						}
					}
				}
			}

			(function(self){
				self.apikey = apikey;
				self.url = url;
				self.getState = getState;
				self.requestState = requestState;
			}(geocoding));

			return geocoding
}());




































/**********************************
 Component Models
**********************************/

























/*
 * City Consturctor
 */
weatherapp.city = function(designation) {
	var self = this,
			$input = $('#' + designation + '-search').find('input');

	//Set the city using a given ID, returning a deferred object to work with
	function setCity(id) {
		self.id = id,
		$deferred = $.Deferred();
		return weatherapp.openweathermap.getCurrent(id).then(function(data) {
			self.weather_current = data;
			if (data.sys.country == "US" && data.coord.lon && data.coord.lat) { // Need to find state name
				return weatherapp.geocoding.requestState(''+data.coord.lat+','+data.coord.lon).done(function(geocode) {
					self.name = data.name + ', ' + weatherapp.geocoding.getState(geocode) + ', ' + data.sys.country;
					$input.val(self.name);
				});
			} else {
				self.name = data.name + ', ' + data.sys.country;
				$input.val(self.name);
			}
		});
	}

	function setDailyForecast() {
		return weatherapp.openweathermap.getDaily(self.id).done(function(data) {
			self.daily_forecast = data;
		});
	}

	function setHourlyForecast() {
		return weatherapp.openweathermap.getHourly(self.id).done(function(data) {
			self.hourly_forecast = data;
		});
	}


	// Expose attributes and methods
	(function(self) {
		self.designation = designation,
		self.id = 0,
		self.name = '',
		self.searchResults = undefined,
		self.weather_current = undefined,
		self.daily_forecast = undefined,
		self.hourly_forecast = undefined,
		self.$input = $input,
		self.setCity = setCity,
		self.setDailyForecast = setDailyForecast,
		self.setHourlyForecast = setHourlyForecast
	}(self));

};




























/*
 * Chart component
 */
weatherapp.chart = (function() {
	var chart = {},
			$me,
			$container = $('#chart-container'),
			$controls = $container.find('.wa-charts-controls'),
			$chart = $container.find('.wa-charts-chart'),
			active_type = '',
			active_time = '',
			chart_defaults = {
				bindto : "#chart"
			}








	function getTempData() {
		var temp = {},
				numRows,
				date,
				timestamps = ['timestamps'],
				data1 = [weatherapp.city1.name],
				data2 = [weatherapp.city2.name];

		temp.data = {};

		temp.axis = {
			y : {
				label : {
					text : "Temperature ( °C )",
					position: 'outer-middle'
				} 
			}, 
			x : {
				label : {
					text : "Time ( %m-%d %H:%M )",
					position: "outer-right"
				},
				type: 'timeseries',
				tick: {
						format: '%m-%d %H:%M',
						 culling: {
								max: 7
							}
				}
			}
		}

		temp.data.colors = {};
		temp.data.colors[weatherapp.city1.name] = "#DE584C";
		temp.data.colors[weatherapp.city2.name] = "#28609B";
		temp.data.type = 'spline';
		temp.data.x = "timestamps";
		temp.data.columns = [];

		numRows = Math.min(weatherapp.city1.hourly_forecast.cnt, weatherapp.city2.hourly_forecast.cnt);

		for (var i = 0; i< numRows; i++) {
			date = new Date(weatherapp.city1.hourly_forecast.list[i].dt * 1000);
			timestamps.push(date);

			data1.push(weatherapp.city1.hourly_forecast.list[i].main.temp);
			data2.push(weatherapp.city2.hourly_forecast.list[i].main.temp);
		}

		temp.data.columns.push(timestamps);
		temp.data.columns.push(data1);
		temp.data.columns.push(data2);

		return temp;
	}










	function getAtmosphereData() {
		var atmosphere = {},
				numRows,
				timestamps = ['timestamps'],
				data1_clouds = [weatherapp.city1.name + ' (Clouds)'],
				data2_clouds = [weatherapp.city2.name+' (Clouds)']
				data1_pressure = [weatherapp.city1.name+' (Pressure)']
				data2_pressure = [weatherapp.city2.name+' (Pressure)'];

		atmosphere.axis = {
			y : {
				label : {
					text : "Pressure ( hPa )",
					position: 'outer-middle'
				} 
			},
			y2 : {
				show : true,
				label : {
					text : "Cloud Coverage ( % )",
					position: 'outer-middle'
				}
			},
			x : {
				label : {
					text : "Time ( %m-%d %H:%M )",
					position: "outer-right"
				},
				type: 'timeseries',
				tick: {
						format: '%m-%d %H:%M',
						 culling: {
								max: 7
							}
				}
			}
		}

		atmosphere.data = {};
		atmosphere.data.colors = {};
		atmosphere.data.colors[weatherapp.city1.name+' (Clouds)'] = "#DE584C";
		atmosphere.data.colors[weatherapp.city2.name+' (Clouds)'] = "#28609B";
		atmosphere.data.colors[weatherapp.city1.name+' (Pressure)'] = "#DE584C";
		atmosphere.data.colors[weatherapp.city2.name+' (Pressure)'] = "#28609B";
		atmosphere.data.type = 'bar';
		atmosphere.data.types = {};
		atmosphere.data.types[weatherapp.city1.name+' (Pressure)'] = 'spline';
		atmosphere.data.types[weatherapp.city2.name+' (Pressure)'] = 'spline';
		atmosphere.data.x = "timestamps";
		atmosphere.data.columns = [];
		atmosphere.data.axes = {};
		atmosphere.data.axes[weatherapp.city1.name+' (Clouds)'] = 'y2';
		atmosphere.data.axes[weatherapp.city2.name+' (Clouds)'] = 'y2';
		atmosphere.data.axes[weatherapp.city1.name+' (Pressure)'] = 'y';
		atmosphere.data.axes[weatherapp.city2.name+' (Pressure)'] = 'y';


		numRows = Math.min(weatherapp.city1.hourly_forecast.cnt, weatherapp.city2.hourly_forecast.cnt);


		for (var i = 0; i< numRows; i++) {
			date = new Date(weatherapp.city1.hourly_forecast.list[i].dt * 1000);
			timestamps.push(date);

			data1_clouds.push(weatherapp.city1.hourly_forecast.list[i].clouds.all);
			data2_clouds.push(weatherapp.city2.hourly_forecast.list[i].clouds.all);

			data1_pressure.push(weatherapp.city1.hourly_forecast.list[i].main.pressure);
			data2_pressure.push(weatherapp.city2.hourly_forecast.list[i].main.pressure);
		}

		atmosphere.data.columns.push(timestamps);
		atmosphere.data.columns.push(data1_clouds);
		atmosphere.data.columns.push(data1_pressure);
		atmosphere.data.columns.push(data2_clouds);
		atmosphere.data.columns.push(data2_pressure);

		return atmosphere;
	}





	function getWindData() {
		var wind = {},
				numRows,
				date,
				timestamps = ['timestamps'],
				data1 = [weatherapp.city1.name],
				data2 = [weatherapp.city2.name];

		wind.data = {};

		wind.axis = {
			y : {
				label : {
					text : "Wind ( m/s s)",
					position: 'outer-middle'
				} 
			}, 
			x : {
				label : {
					text : "Time ( %m-%d %H:%M )",
					position: "outer-right"
				},
				type: 'timeseries',
				tick: {
						format: '%m-%d %H:%M',
						 culling: {
								max: 7
							}
				}
			}
		}

		wind.data.colors = {};
		wind.data.colors[weatherapp.city1.name] = "#DE584C";
		wind.data.colors[weatherapp.city2.name] = "#28609B";
		wind.data.type = 'spline';
		wind.data.x = "timestamps";
		wind.data.columns = [];

		numRows = Math.min(weatherapp.city1.hourly_forecast.cnt, weatherapp.city2.hourly_forecast.cnt);

		for (var i = 0; i< numRows; i++) {
			date = new Date(weatherapp.city1.hourly_forecast.list[i].dt * 1000);
			timestamps.push(date);

			data1.push(weatherapp.city1.hourly_forecast.list[i].wind.speed);
			data2.push(weatherapp.city2.hourly_forecast.list[i].wind.speed);
		}

		wind.data.columns.push(timestamps);
		wind.data.columns.push(data1);
		wind.data.columns.push(data2);

		return wind;
	}








	function getData(dataType) {
		switch (dataType) {
			case 'atmosphere':
				return getAtmosphereData();
				break;

			case 'wind':
				return getWindData();
				break;

			default:
				return getTempData();

		}
	}








	function setMeasurement(type) {

		if (type != active_type) {
			active_type = type;

			$controls.find('.pure-button-active').removeClass('pure-button-active');
			$controls.find('button[data-charttype='+type+']').addClass('pure-button-active');

			render();
		}

	}








	function render() {
		var data = getData(active_type),
				chartOpts;

		chartOpts = $.extend({}, chart_defaults, data);

		if($me) {
			$me.destroy();
		}


		$me = c3.generate(chartOpts);
	}








	function attachEvents() {
		$controls.on('click.chart-button', 'button', function() {
			setMeasurement($(this).data('charttype'));
		});
	}








	// Expose public attributes and methods
	(function(self) {
		self.$chart = $chart,
		self.setMeasurement = setMeasurement,
		self.render = render,
		self.attachEvents = attachEvents
	}(chart));

	return chart;

}());







































/*
 * Statistics component
 */
weatherapp.statistics = (function() {
	var stats = {},
			$container = $('#statistics'),
			active_table = {
				type : '',
				$elem : undefined
			},
			$buttons = $('#statistics-controls button'),
			$city1Input = $('#city1-search input'),
			$city2Input = $('#city2-search input');









	/*
	 * Current conditions table
	 */
	var table_current = (function(){
		var tc = {};

		tc.$me = $('#stats_current');

		tc.render = function() {
			this.$me.find('td').empty();
			this.$me.find('.temp').siblings()
				.eq(0).html(Math.round(weatherapp.city1.weather_current.main.temp) + '&deg;').end()
				.eq(1).html(Math.round(weatherapp.city2.weather_current.main.temp) + '&deg;');
			this.$me.find('.cond').siblings() //Append weather-icon
				.eq(0).html('<span class="wa-current-icon wi ' + weatherapp.openweathermap.iconMap[weatherapp.city1.weather_current.weather[0].icon] + '"></span>'
						+ weatherapp.city1.weather_current.weather[0].description).end()
				.eq(1).html('<span class="wa-current-icon wi ' + weatherapp.openweathermap.iconMap[weatherapp.city2.weather_current.weather[0].icon] + '"></span>'
						+ weatherapp.city2.weather_current.weather[0].description);
			this.$me.find('.hum').siblings()
				.eq(0).html(weatherapp.city1.weather_current.main.humidity + '%').end()
				.eq(1).html(weatherapp.city2.weather_current.main.humidity + '%');
			this.$me.find('.wind').siblings() //Append direction icon
				.eq(0).html(weatherapp.city1.weather_current.wind.speed).end()
				.eq(1).html(weatherapp.city2.weather_current.wind.speed);
			this.$me.find('.pres').siblings()
				.eq(0).html(weatherapp.city1.weather_current.main.pressure).end()
				.eq(1).html(weatherapp.city2.weather_current.main.pressure);
			this.$me.find('.cloud').siblings()
				.eq(0).html(weatherapp.city1.weather_current.clouds.all + '%').end()
				.eq(1).html(weatherapp.city2.weather_current.clouds.all + '%');

			// Add tooltip functionality
			tc.$me.find('.tooltip-enabled[title]').qtip({
				style : {
					classes : 'wa-tooltip qtip-shadow'
				},
				position: {
					my: 'bottom center',
					at: 'top center'
				}
			});
		}

		return tc;
	}());








	/*
	 * Hourly Forecast table
	 */
	var table_hourly = (function(){
		var th = {};

		th.$me = $('#stats_hourly');

		th.render = function() {
			th.$me.empty(); // Empty the existing structure (if any)

			var numRows = Math.min(weatherapp.city1.hourly_forecast.cnt, weatherapp.city2.hourly_forecast.cnt),
					rows = [];

			for (var i = 0; i< numRows; i++) {
				var tr = $('<tr>'),
						td1 = $('<td>').append(createForecastCard('hour', weatherapp.city1.hourly_forecast.list[i])),
						td2 = $('<td>').append(createForecastCard('hour', weatherapp.city2.hourly_forecast.list[i])),
						date = new Date(weatherapp.city1.hourly_forecast.list[i].dt * 1000),

				date = date.toString();
				date = date.substr(0, date.length-18) //Remove trailing format from date string


				tr.append('<th class="date">'+date).append(td1).append(td2);
				rows.push(tr);
			}
			th.$me.append(rows);

			// Add tooltip functionality
			th.$me.find('.tooltip-enabled[title]').qtip({
				style : {
					classes : 'wa-tooltip qtip-shadow'
				},
				position: {
					my: 'bottom center',
					at: 'top center'
				}
			});
		}

		return th

	}());













	/*
	 * Daily Forecast table
	 */
	var table_daily = (function(){
		var td = {};

		td.$me = $('#stats_daily');

		td.render = function() {
			td.$me.empty(); // Empty the existing structure (if any)

			var numRows = Math.min(weatherapp.city1.daily_forecast.cnt, weatherapp.city2.daily_forecast.cnt),
					rows = [];

			for (var i = 0; i< numRows; i++) {
				var tr = $('<tr>'),
						td1 = $('<td>').append(createForecastCard('day', weatherapp.city1.daily_forecast.list[i])),
						td2 = $('<td>').append(createForecastCard('day', weatherapp.city2.daily_forecast.list[i])),
						date = new Date(weatherapp.city1.hourly_forecast.list[i].dt * 1000),

				date = date.toString();
				date = date.substr(0, date.length-29) //Remove trailing format from date string


				tr.append('<th class="date">'+date).append(td1).append(td2);
				rows.push(tr);
			}

			td.$me.append(rows);

			// Add tooltip functionality
			td.$me.find('.tooltip-enabled[title]').qtip({
				style : {
					classes : 'wa-tooltip qtip-shadow'
				},
				position: {
					my: 'bottom center',
					at: 'top center'
				}
			});

		}

		return td

	}());


















	function showTable(table) {
		$buttons.removeClass('pure-button-active');
		$buttons.filter('[data-tabletype='+table+']').addClass('pure-button-active');
		switch (table) {
			case 'current':
				if (active_table.type != 'current') {
					if (active_table.$elem) {
						active_table.$elem.toggleClass('is-visible');
					}
					table_current.$me.toggleClass('is-visible');
					active_table.type = 'current';
					active_table.$elem = table_current.$me;
				}
				break;
			case 'hourly':
				if (active_table.type != 'hourly') {
					if (active_table.$elem) {
						active_table.$elem.toggleClass('is-visible');
					}
					table_hourly.$me.toggleClass('is-visible');
					active_table.type = 'hourly';
					active_table.$elem = table_hourly.$me;
				}
				break;
			case 'daily':
				if (active_table.type != 'daily') {
					if (active_table.$elem) {
						active_table.$elem.toggleClass('is-visible');
					}
					table_daily.$me.toggleClass('is-visible');
					active_table.type = 'daily';
					active_table.$elem = table_daily.$me;
				}
				break;
			default:

		}
	}
















	function createForecastCard(type, data) {
		var card = $('<div class="wa-forecast-card">'),
				conditions,
				icon = $('<span class="wa-card-icon wi tooltip-enabled">'),
				temp,
				temp_max,
				temp_min,
				clouds,
				humidity,
				wind;


		switch (type) {
			case 'hour':
				card.addClass('forecast-hour');
				temp = data.main.temp + '&deg;';
				humidity = data.main.humidity + '%';
				clouds = data.clouds.all + '%';
				wind = data.wind.speed + ' m/s';

				icon.attr('title', data.weather[0].description);
				icon.addClass(weatherapp.openweathermap.iconMap[data.weather[0].icon]);
				card.append(icon);

				card.append('<span>'+temp+'</span><br>');
				card.append('<span>Humidity: '+humidity+'</span><br>');
				card.append('<span>Clouds: '+clouds+'</span><br>');
				card.append('<span>Wind: '+wind+'</span>');

				break;


			case 'day':
				card.addClass('forecast-day');
				temp_min = Math.round(data.temp.min) + '&deg;',
				temp_max = Math.round(data.temp.max)  + '&deg;',
				humidity = data.humidity + '%',
				clouds = data.clouds + '%',
				wind = data.speed + ' m/s';

				icon.attr('title', data.weather[0].description);
				icon.addClass(weatherapp.openweathermap.iconMap[data.weather[0].icon]);
				card.append(icon);

				card.append('<span class="temp-max">' + temp_max + '</span> &#124; <span class="temp-min">' +temp_min + '</span><br>');
				card.append('<span>Humidity: '+humidity+'</span><br>');
				card.append('<span>Clouds: '+clouds+'</span><br>');
				card.append('<span>Wind: '+wind+'</span>');

				break;


			default:
				// Nothing to do!
		}

		return card;
	}







	function showSearchSuggestions(input, data) {
		var searchbox = $(input),
				container = searchbox.closest('.wa-city-search'),
				suggestionList = container.find('.wa-search-suggestions').empty(),
				icons = $(input).siblings('.wa-icon-container'),
				listItem,
				suggestionElem,
				state;

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

						//getUSState(suggestionElem, geocodingParams, listItem, suggestionList);
						(function(suggestionElem) {
							weatherapp.geocoding.requestState(''+listItem.coord.lat+','+listItem.coord.lon)
							.done(function(geocode) {
								state = weatherapp.geocoding.getState(geocode);
								suggestionElem.append(', ' + state);
								suggestionElem.append(', ' + listItem.sys.country);
								suggestionElem.data('city_name', suggestionElem.data('city_name') + ', ' + state + ', ' + listItem.sys.country);
								suggestionList.append(suggestionElem);
							});
						}(suggestionElem));


					} else {
						suggestionElem.append(', ' + listItem.sys.country);
						suggestionElem.data('city_name', suggestionElem.data('city_name') + ', ' + listItem.sys.country);
						suggestionList.append(suggestionElem);
					}
				}

			}

			suggestionList.css('width', container.width());
			suggestionList.removeClass('is-closed');

		} else {
			icons.find('.fa-exclamation-circle').toggleClass('is-active is-inactive');
		}
	}









	function citySearch() {
		var input = $(this),
				city = input.closest('.wa-city-search').data('citymodel'),
				icons = input.siblings('.wa-icon-container');

				icons.find('.fa-spinner').toggleClass('is-active is-inactive');

				weatherapp.openweathermap.citySearch(input.val())
					.done(function(data) {
						icons.find('.fa-spinner').toggleClass('is-active is-inactive');
						showSearchSuggestions(input, data)
						weatherapp[city].searchResults = data;
					}).fail(function() {
						icons.find('.fa-spinner').toggleClass('is-active is-inactive');
						icons.find('.fa-exclamation-triangle').toggleClass('is-active is-inactive');
					});

	}








	function rerenderSection(city, id) {
		var deferreds = [];

		deferreds.push(weatherapp[city].setCity(id));
		deferreds.push(weatherapp[city].setHourlyForecast());
		deferreds.push(weatherapp[city].setDailyForecast());

		$.when.apply($, deferreds).done(function() {
			weatherapp.statistics.table_current.render();
			weatherapp.statistics.table_daily.render();
			weatherapp.statistics.table_hourly.render();
			weatherapp.chart.render();
		});
	}










	function attachEvents() {
		var table = $container;

		$buttons.on('click.stats-button', function() {
			showTable($(this).data('tabletype'));
		});

		$container.find('.wa-city-search').on('keydown.city-search', 'input', weatherapp.util.debounce(citySearch, 750))
			.on('click.select-city', '.wa-suggestions-elem', function() {
				var elem = $(this),
						cityName = elem.data('city_name'),
						cityID = elem.data('city_id'),
						input = elem.closest('.wa-city-search').find('input'),
						city = elem.closest('.wa-city-search').data('citymodel');

				input.val(cityName);

				weatherapp[city].id = cityID;

				// Request weather conditions for new city
				rerenderSection(city, cityID);

				elem.parent().addClass('is-closed');
		});
	}




	// Expose public attributes and methods
	(function(self) {
		self.$container = $container,
		self.active_table = active_table,
		self.table_current = table_current,
		self.table_hourly = table_hourly,
		self.table_daily = table_daily,
		self.showTable = showTable,
		self.attachEvents = attachEvents;
	}(stats));

	return stats;

}());





















/*
 * Application Initialization
 */
weatherapp.init = function () {

	weatherapp.city1 = new weatherapp.city('city1');
	weatherapp.city2 = new weatherapp.city('city2');
	
	// Get the weather data for the two default cities
	var deferreds = [];
	deferreds.push(city1_current = weatherapp.city1.setCity(5128638)); //New York
	deferreds.push(city2_current = weatherapp.city2.setCity(2643743)); //London
	deferreds.push(city1_hourly = weatherapp.city1.setHourlyForecast());
	deferreds.push(city2_hourly = weatherapp.city2.setHourlyForecast());
	deferreds.push(city1_daily = weatherapp.city1.setDailyForecast());
	deferreds.push(city2_daily = weatherapp.city2.setDailyForecast());

	// Wait for the ajax calls to resolve before trying to render tables & charts
	$.when.apply($, deferreds).done(function() {
		weatherapp.statistics.table_current.render();
		weatherapp.statistics.table_daily.render();
		weatherapp.statistics.table_hourly.render();

		weatherapp.statistics.showTable('current');

		weatherapp.statistics.attachEvents();

		weatherapp.chart.setMeasurement('temp');
		weatherapp.chart.render();

		weatherapp.chart.attachEvents();
	});


	/*
	 * Tooltip configuration
	 */
	$('.tooltip-enabled[title]').qtip({
		style : {
			classes : 'wa-tooltip qtip-shadow'
		},
		position: {
			my: 'bottom center',
			at: 'top center'
		}
	});

}

weatherapp.init();

























}());