# Weatherapp

This project is a demonstration of a simple app comparing the weather between two cities. It pulls data from the [OpenWeatherMap API](http://openweathermap.org/api).

## Description

As stated above, this project is a simple application of the OpenWeatherMap API. Two input boxes provide the ability to search for two cities to compare, defaulting to London and New York. The current weather metrics are shown below these inputs in tabular form by default. Three buttons in this section allow this table to toggle between current metrics, an hourly forecast, and a daily forecast.

The lower section displays an interactive chart which defaults to showing a forecast for the next 7-day period for temperature. Three buttons in this section allow toggling between temperature, atmosperic conditions (cloud cover, rain, and snow), and wind. The chart combines information from both cities. A control is available under the chart to control the time range for this information. Time permitting, this will be expanded to allow viewing of historical weather data from the past month. 

Several options for configuration are available under the gear icon in the header. These options include unit conversion, layout, and themeing. 

## Installation

1. Pull this repo
2. Run ```npm install``` and ```bower install``` to pull required modules & components
	* Optionally change the API keys in js/main.js to your own API key
3. Run ```gulp``` to start the app on localhost:4444, while listening for changes to less and js files

A deployed version of this project can be viewed at [tylerchadwick.com/weatherapp](http://tylerchadwick.com/weatherapp)

## Process

1. Requirements
2. Research
3. Design
4. Iteration
5. Delivery


## TODO

- [ ] Add unrequired node_modules and bower_components directories to .gitignore
- [ ] Create a distribution build with concat'd/min'd/uglify'd files
- [ ] Create an interactive chart using d3, c3, or the google charting API
- [ ] Adjust the tooltip styles to reflect the selected theme
- [ ] Verify Browser support
- [ ] Use promises in a more generic way in resolving lat/long coordinates and states
- [ ] Implement MVC to handle data manipulation, views, and component relationships
- [ ] Add translations with i18next
- [ ] Add feature detection with Modernizr
- [ ] Add horizontal/veritcal selection for statistics table
- [ ] Compelte themeing support
- [ ] Add range selection for forecasting time
- [ ] Clean up main.js (organization, comments, variables)
- [ ] Implement require/browserify
- [ ] Handle AJAX errors
- [ ] Get local time for hourly forecasts
- [ ] Add global indicator for in-progress AJAX calls
- [ ] Use one generic function for all 3 stats tables
- [ ] Investigate closure compiler warnings