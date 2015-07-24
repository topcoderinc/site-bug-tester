'use strict';

/**
 * @ngdoc function
 * @name trelloBaerApp.controller:BuildJarbController
 * @description
 * # BuildJarbController
 * Controller of the trelloBaerApp
 */
angular.module('trelloBaerApp')
	.controller('BuildJarbController', ['$scope','lodash','TrelloAPI', function ($scope,lodash,TrelloAPI) {
		$scope.errorMsg='';
		$scope.isAuthenticated=false;
		$scope.boards=[];
		$scope.organizations=[];

		TrelloAPI.getUser(function(userData){
			console.log(userData);
			$scope.isAuthenticated=userData.isAuthenticated;
		});

		TrelloAPI.getBoards(function(data){
			console.log(data);

			if(data.err){
				$scope.errorMsg=data.err;
			} else{
				$scope.boards=data.boards;
				$scope.organizations=data.organizations;
				console.log('data.organziations');
				console.log(data.organizations);
				console.log($scope.organizations);
			}
		});
	}])
	.directive('trelloOrganizations', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/trello-organizations.html',
			scope: {
				organizations: '=orgs',
				boards: '=boards'
			}
		};
	})
	.directive('trelloBoards', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/trello-boards.html',
			scope: {
				org: '=org',
				boards: '=boards'
			}
		};
	});
