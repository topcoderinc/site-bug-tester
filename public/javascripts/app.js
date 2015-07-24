'use strict';

/**
 * @ngdoc overview
 * @name trelloBaerApp
 * @description
 * # trelloBaerApp
 *
 * Main module of the application.
 */
angular
  .module('trelloBaerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('buildJarb',{
        templateUrl: 'views/buildJarb.html',
        controller: 'BuildJarbController',
        controllerAs: 'build'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
