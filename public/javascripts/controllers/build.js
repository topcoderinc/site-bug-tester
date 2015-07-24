'use strict';

/**
 * @ngdoc function
 * @name trelloBaerApp.controller:BuildJarbController
 * @description
 * # BuildJarbController
 * Controller of the trelloBaerApp
 */
angular.module('trelloBaerApp')
  .controller('BuildJarbController', ['$scope','TrelloAPI', function ($scope,TrelloAPI) {
    $scope.isAuthenticated=false;
    
    TrelloAPI.get(function(userData){
    	console.log(userData);
    	$scope.isAuthenticated=userData.isAuthenticated;

    });
  }]);
