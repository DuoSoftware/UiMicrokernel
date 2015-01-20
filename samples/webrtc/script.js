function main(){
	scope.allUsers = [];
	scope.test = "XXX"

	$webrtc.onCallEstablishing(function(e,data){
		scope.displayState = "Call Establishing";
	});

	$webrtc.onCallEstablishError(function(e,data){
		scope.displayState = "Call Establish Error";
	});

	$webrtc.onCallEstablishSuccess(function(e,data){
		scope.displayState = "Call Establish Success";
	});

	$webrtc.onCallCallCancelled(function(e,data){
		scope.displayState = "Call Cancled";
	});

	$webrtc.onRecieverAnswered(function(e,data){
		scope.displayState = "Reciever Answered";
	});

	$webrtc.onRejected(function(e,data){
		scope.displayState = "Rejected";
	});

	$webrtc.onRinging(function(e,data){
		scope.displayState = "Ringing";
	});

	$webrtc.onAnswered(function(e,data){
		scope.displayState = "Answered";
	});

	$webrtc.onEnded(function(e,data){
		scope.displayState = "Ended";
	});


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


	return {
		answer : function(){
			$webrtc.answer(scope.toUser,{});
		},
		reject: function(){
			$webrtc.reject(scope.toUser,{});
			$webrtc.end(scope.toUser,{});
		},
		call: function(){
			$webrtc.call(scope.toUser,{});
		},
		startStream: function(){
			$webrtc.setVideoTags("idNewLocalStream","idNewRemoteStream");
			$webrtc.startLocalStream();
		},
		selectUser: function(u){
			scope.toUser = u.userName;
		},
		getAll: function(){
			$presence.getOnlineUsers();
		}
	}
}