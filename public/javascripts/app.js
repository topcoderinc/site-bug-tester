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
    'ngTouch',
    'ngLodash'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/buildJarb',{
        templateUrl: 'views/buildJarb.html',
        controller: 'BuildJarbController',
        controllerAs: 'build'
      })
      .when('/jarbs',{
        templateUrl: 'views/jarbs.html',
        controller: 'JarbsController',
        controllerAs: 'jarbs'
      })
      .when('/reports',{
        templateUrl: 'views/reports.html',
        controller: 'ReportssController',
        controllerAs: 'reports'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('TrelloAPI', ['$resource',function($resource){
    return $resource('/trello/',null,{
      getUser: {
        method: 'GET',
        url: '/trello/user'
      },
      getBoards: {
        method: 'GET',
        url: '/trello/boards'   
      }
    });
  }])
  .factory('JobsAPI', ['$resource',function($resource){
    return $resource('/jobs/:state/:n',
      { state: '@state', n: '@n'});
  }])
    .factory('ReportsAPI', ['$resource',function($resource){
    return $resource('/reports/:id');
  }]);
