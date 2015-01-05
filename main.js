var mainModule = angular.module("mainApp", ["uiMicrokernel"]);

mainModule.controller("mainController", function ($scope, $presence, $chat, $webrtc, $auth, $backdoor, $objectstore, $agent) {

////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// OBJECT STORE //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

	$scope.osNames = [];
	$scope.osNewUser = {Id:"1987",Name:"supun"};

	var client = $objectstore.getClient("com.duosoftware.test","testobject");

	$scope.objectStoreSave = function(){
		client.insert([$scope.osNewUser], {KeyProperty:"Id"});
	};

	$scope.objectStoreLoad = function(){
		//requestor.getByKeyword ("supun");
		client.getByKey("element_input_1");
	};

	
	client.onComplete(function(data){ 
		alert(data);
	});

	client.onError(function(data){
		alert ("Error occured!!");
	});

	client.onGetOne(function(data){
		if (data)
			$scope.osNames = [data];
	});

	client.onGetMany(function(data){
		if (data)
			$scope.osNames = data;
	});

///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////CHAT AND AUTH//////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

	$scope.currentUser;
	$scope.password;

	$scope.currentMessage = "XX";
	$scope.toUser = "XX";

	$scope.messages = [];
	$scope.allUsers = [];

	$scope.login = function(){
		$auth.forceLogin($scope.currentUser, $scope.password, "");
	}

	$scope.selectUser = function(user){
		$scope.toUser = user.userName;
	}


	$scope.sendMessage = function(){
		$chat.send($scope.toUser, $scope.currentUser, $scope.currentMessage);
		$scope.messages.push($scope.currentMessage);
		$scope.currentMessage = "";
	}

	$scope.getAllUsers= function(){
		$chat.getOnlineUsers();
	}

	$auth.onLoginResult(function(data){
		$("#dialog").dialog('close');

		$presence.setOnline();
		
		$presence.onStateChanged(function(e,data){
			$presence.getOnlineUsers();
		});
		
		$presence.onUserStateChanged(function(e,data){
			if (data.state == "online"){
				$scope.allUsers.push({userName:data.userName});
			} else{
				var removeIndex =-1;
				for (index in $scope.allUsers)
				if ($scope.allUsers[index].userName==data.userName){
					removeIndex = index;
					break;
				}

				if (removeIndex!=-1)
					$scope.allUsers.splice(removeIndex,1);
			}
		});

		$presence.onOnlineUsersLoaded(function(e,data){
			$scope.allUsers = data.users;
		});

		$chat.onMessage(function(e,data){
			$scope.messages.push(data.message);
		});
	});

///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////   WEB RTC   //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
	
	$scope.displayState;

	$scope.answer = function(){
		$webrtc.answer($scope.toUser,{});
	}

	$scope.reject = function(){
		$webrtc.reject($scope.toUser,{});
		$webrtc.end($scope.toUser,{});
	}

	$scope.call = function(){
		$webrtc.call($scope.toUser,{});
	}

	$scope.startStream = function(){
		$webrtc.startLocalStream();
	}

	$webrtc.setVideoTags("idLocalStream","idRemoteStream");

	$webrtc.onCallEstablishing(function(e,data){
		$scope.displayState = "Call Establishing";
	});
	
	$webrtc.onCallEstablishError(function(e,data){
		$scope.displayState = "Call Establish Error";
	});
	
	$webrtc.onCallEstablishSuccess(function(e,data){
		$scope.displayState = "Call Establish Success";
	});
	
	$webrtc.onCallCallCancelled(function(e,data){
		$scope.displayState = "Call Cancled";
	});
	
	$webrtc.onRecieverAnswered(function(e,data){
		$scope.displayState = "Reciever Answered";
	});
	
	$webrtc.onRejected(function(e,data){
		$scope.displayState = "Rejected";
	});
	
	$webrtc.onRinging(function(e,data){
		$scope.displayState = "Ringing";
	});
	
	$webrtc.onAnswered(function(e,data){
		$scope.displayState = "Answered";
	});
	
	$webrtc.onEnded(function(e,data){
		$scope.displayState = "Ended";
	});


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////   BACKDOOR  //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


	$scope.logs = [];
	$backdoor.onUpdate(function(newline, alllines){
		$scope.logs = alllines;
	})

	$(".chatUserStyle").selectable();


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////    MATRIX   //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

	$scope.allmatrics = [];

	$scope.on = function(){
		$agent.on("ObjectStore@SUPUN1-LAP.duosl.duosoftware.com");
	}

	$scope.off = function(){
		$agent.off("ObjectStore@SUPUN1-LAP.duosl.duosoftware.com");
	}

	$scope.getTenantInfo = function(){
		$agent.getTenantInfo();
	}

	$scope.getAgentInfo = function(){
		$agent.getAgentInfo();
	}


	$agent.onTenantInfo(function (e, data){
		$scope.tenantInfo = data;
	});

	$agent.onAgentInfo(function (e, data){
		$scope.agentInfo = data;
	});

	$agent.onInfo(function (e, data){
		//$scope.allmatrics.push(data)
	})

	$agent.onLogInfo(function (e, data){
		$scope.allmatrics.push(data.data.Output)
	})

	
});
