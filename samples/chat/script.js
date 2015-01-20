function main(){
	scope.currentUser;
	scope.password;

	scope.currentMessage = "XX";
	scope.toUser = "XX";

	scope.messages = [];
	scope.allUsers = [];


	scope.selectUser = function(user){
		scope.toUser = user.userName;
	}


	scope.sendMessage = function(){
		$chat.send(scope.toUser, scope.currentUser, scope.currentMessage);
		scope.messages.push(scope.currentMessage);
		scope.currentMessage = "";
	}

	scope.getAllUsers= function(){
		$chat.getOnlineUsers();
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

		$chat.onMessage(function(e,data){
			scope.messages.push(data.message);
		});
	}

	return{}
}