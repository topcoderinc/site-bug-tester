'use strict';

/**
 * @ngdoc function
 * @name trelloBaerApp.controller:BuildJarbController
 * @description
 * # BuildJarbController
 * Controller of the trelloBaerApp
 */
angular.module('trelloBaerApp')
	.controller('BuildJarbController', ['$scope','lodash','TrelloAPI','JobsAPI', function ($scope,lodash,TrelloAPI,JobsAPI) {
		$scope.errorMsg='';
		$scope.isAuthenticated=false;
		$scope.boards=[];
		$scope.organizations=[];
		$scope.formData = {};
		$scope.job={};

		$scope.postJob=function(){
			var job=new JobsAPI();
			job.boardIds=lodash.keys($scope.formData.selectedBoards);
			job.organizationId='cwd'; //CWD-- this is sorta useless now
			job.name=$scope.formData.reportName;
			job.lists=['Done']; //CWD-- need to think about this one as well
			job.emailRecipient=$scope.formData.emailRecipient;
			job.$save()
				.then(function(j){ console.log(j); $scope.job='report created successfully!'; })
				.catch(function(e){ $scope.errorMsg=e; });
		};

		TrelloAPI.getUser(function(userData){
			$scope.isAuthenticated=userData.isAuthenticated;
		});

		TrelloAPI.getBoards(function(data){
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
			}
		});
	}]);
