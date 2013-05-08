'use strict';

var app = angular.module('pebbleMessenger', ['pebbleMessenger.filters', 'pebbleMessenger.services', 'pebbleMessenger.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/send/', { templateUrl: 'partials/send', controller: SendCtrl });
    $routeProvider.when('/about/', { templateUrl: 'partials/about', controller: AboutCtrl });
    $routeProvider.otherwise({redirectTo: '/send/'});
    $locationProvider.html5Mode(true);
  }]);