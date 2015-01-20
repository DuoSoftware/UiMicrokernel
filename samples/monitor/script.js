function main(){
	scope.allmatrics = [];

	scope.selectUser = function(user){
		scope.toUser = user.userName;
	}
	
	scope.on = function(){
		$agent.on(scope.toUser);
	}

	scope.off = function(){
		$agent.off(scope.toUser);
	}

	scope.getTenantInfo = function(){
		$agent.getTenantInfo();
	}

	scope.getAgentInfo = function(){
		$agent.getAgentInfo();
	}

	scope.setOnline = function(){

		$presence.getOnlineUsers();
		
		$presence.onUserStateChanged(function(e,data){
			if (data.state == "online"){
				scope.allUsers.push({userName:data.userName});
			} else{
				var removeIndex =-1;
				for (index in $scope.allUsers)
				if (scope.allUsers[index].userName==data.userName){
					removeIndex = index;
					break;
				}

				if (removeIndex!=-1)
					scope.allUsers.splice(removeIndex,1);
			}
		});

		$presence.onOnlineUsersLoaded(function(e,data){
			scope.allUsers = data.users;
		});

		$agent.onClusterInfo(function (e, data){
			scope.tenantInfo = data;
		});

		$agent.onDisplayInfo(function (e, data){
			scope.agentInfo = data;
		});


		$agent.onAgentLogInfo(function (e, data){
			scope.allmatrics.push(data.data.Output)
		});

		$agent.onAgentStatInfo(function (e, data){
			scope.allmatrics.push(data.data)
		});
	}


}