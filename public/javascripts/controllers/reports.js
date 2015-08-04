'use strict';

/**
 * @ngdoc function
 * @name trelloBaerApp.controller:ReportsController
 * @description
 * # ReportsController
 * Controller of the trelloBaerApp
 */
angular.module('trelloBaerApp')
	.controller('ReportsController', ['$scope','lodash','TrelloAPI','Reports', function ($scope,lodash,TrelloAPI,Reports) {
		$scope.errorMsg='';
		$scope.isAuthenticated=false;
		$scope.completedJobs={};
		$scope.activeJobs={};

		TrelloAPI.getUser(function(userData){
			$scope.isAuthenticated=userData.isAuthenticated;
		});

		$scope.reports=Reports.query();
	}]);