'use strict';

/**
 * @ngdoc function
 * @name trelloBaerApp.controller:JarbsController
 * @description
 * # JarbsController
 * Controller of the trelloBaerApp
 */
angular.module('trelloBaerApp')
	.controller('JarbsController', ['$scope','lodash','TrelloAPI','JobsAPI', function ($scope,lodash,TrelloAPI,JobsAPI) {
		$scope.errorMsg='';
		$scope.isAuthenticated=false;
		$scope.completedJobs={};
		$scope.activeJobs={};

		TrelloAPI.getUser(function(userData){
			$scope.isAuthenticated=userData.isAuthenticated;
		});

		$scope.activeJobs=JobsAPI.query({ state: 'active', n: 100});
		$scope.completedJobs=JobsAPI.query({ state: 'completed', n: 100});
	}]);