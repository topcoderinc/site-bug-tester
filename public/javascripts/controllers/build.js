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
		$scope.formData = {};

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
				$scope.organizations.push({ id: null, name: 'personal', displayName: 'Personal' });

				lodash.forEach(data.boards,function(board){
					var org=lodash.find($scope.organizations,{ id: board.idOrganization});

					if(org){
						if(!lodash.has(org,'boards')){
							org.boards=[];
						}

						org.boards.push(board);
					} else {
						console.log('no org for board!');
						console.log(board);
					}
				});

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
			transclude: true,
			templateUrl: 'views/trello-boards.html',
			scope: {
				org: '=org',
				boards: '=boards'
			}
		};
	});
