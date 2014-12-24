var microKernelModule = angular.module('uiMicrokernel', []);

microKernelModule.factory('$helpers', function($rootScope) {

	function AsyncTask(action,success,fail){

		var actionFunc = action	;
		var successFunc = success;
		var failFunc = fail;

		function start(data, taskObject) {
			actionFunc(data, taskObject);
		}

		var taskObject = {
			start:function(data){ 
        		start(data, taskObject); 
			},
			endError: function(data){
                 $rootScope.$apply(function() {
            		failFunc(data); 
                });
			},
			endSuccess:function(data){ 
				
                $rootScope.$apply(function() {
            		successFunc(data);
                });
			}
		};

		return taskObject;

	}

	function task(actionFunc,successFunc,failFunc,inputs){
		var newTask = new AsyncTask(actionFunc,successFunc,failFunc);
		newTask.start(inputs);
	}

	return {
		task: function(actionFunc,successFunc,failFunc){ task(actionFunc,successFunc,failFunc); }
	}

});


microKernelModule.factory('$objectstore', function($http, $v6urls,$auth,$backdoor) {
  
	function ObjectStoreClient(_namespace,_class){

		var namespace = _namespace;
		var cls = _class;
		var onGetOne;
		var onGetMany;
		var onComplete;
		var onError;

		function insertLogic(data,parameters){

			var mainObject = null;
			if(angular.isArray(data))
				mainObject = {Parameters : parameters, Objects : data};
			else
				mainObject = {Parameters : parameters, Object : data};


			$http.post($v6urls.objectStore + '/' + namespace + '/' + cls,mainObject, {headers:{"securityToken" : $auth.getSecurityToken()}}).
			  success(function(data, status, headers, config) {
			  	if (onComplete)
			  		onComplete(data);				  	
			  }).
			  error(function(data, status, headers, config) {
			  	if (onError){
			  		$backdoor.log("Error inserting to Object Store");
			  		$backdoor.log(data);
			  		onError(data)
			  	}

			  	if (onComplete){
			  		if (data)
			  			onComplete(data);
			  		else
			  			onComplete({isSuccess:false, message:"Unknown Error!!!"});
			  	}
			  });
		}

		return {
			getByKeyword: function(keyword,parameters){
				$http.get($v6urls.objectStore + '/' + namespace + '/' + cls + '?keyword=' + keyword,{headers:{"securityToken" : $auth.getSecurityToken()}}).
				  success(function(data, status, headers, config) {
				  	if (onGetMany)
				  		onGetMany(data);				  	
				  }).
				  error(function(data, status, headers, config) {
				  	if (onError){
				  		$backdoor.log("Error retrieveing by keyword from Object Store");
			  			$backdoor.log(data);
				  		onError(data)
				  	}

				  	if (onGetMany)
				  		onGetMany();
				  });
			},
			getByKey: function(key){
				$http.get($v6urls.objectStore + '/' + namespace + '/' + cls + '/' + key,{headers:{"securityToken" : $auth.getSecurityToken()}}).
				  success(function(data, status, headers, config) {
				  	if (onGetOne)
				  		onGetOne(data);				  	
				  }).
				  error(function(data, status, headers, config) {
				  	if (onError){
				  		$backdoor.log("Error retrieveing by unique key from Object Store");
			  			$backdoor.log(data);
				  		onError()
				  	}

				  	if (onGetOne)
				  		onGetOne();
				  });
			},
			getAll: function(parameters){
				
			},
			getByFiltering: function(filter,parameters){
				//,"Content-Type":"application/json"
				$http.post($v6urls.objectStore + '/' + namespace + '/' + cls ,{"Query" : {"Type" : "", "Parameters": filter}}, {headers:{"securityToken" : $auth.getSecurityToken()}}).
				  success(function(data, status, headers, config) {
				  	if (onGetMany)
				  		onGetMany(data);				  	
				  }).
				  error(function(data, status, headers, config) {
				  	if (onError){
				  		$backdoor.log("Error retrieveing by query from Object Store");
			  			$backdoor.log(data);
				  		onError()
				  	}

				  	if (onGetMany)
				  		onGetMany();
				  });
			},
			insert: function(data,parameters){
				insertLogic(data,parameters);
			},
			update: function(data,parameters){
				insertLogic(data,parameters);
			},
			delete: function(data,parameters){

			},
			onGetOne: function(func){ onGetOne = func },
			onGetMany:function(func){ onGetMany = func },
			onComplete:function(func){ onComplete = func },
			onError: function(func){ onError = func}
		}
	}


	return {
  		getClient:function(namespace,cls){
  			var req = new ObjectStoreClient(namespace,cls);
  			return req;
  		}
  	}
});





microKernelModule.factory('$auth', function($http, $v6urls, $backdoor) {
 
 	var sessionInfo;
 	var userName;
 	var securityToken;
	var onLoggedInResultEvent;

	function login(username, password,domain){
		var loginResult = {isSuccess:true, message:"Success", securityToken:"", details:{}};

		$http.get($v6urls.auth + "/Login/" + username +"/" + password + "/" + domain).
		  success(function(data, status, headers, config) {
		  	userName = data.Username;
		  	loginResult.details = data;
		  	loginResult.securityToken = data.SecurityToken;
		  	

		  	sessionInfo = data;
		  	securityToken = data.SecurityToken;

		  	if (onLoggedInResultEvent)
		  		onLoggedInResultEvent(loginResult);				  	
		  }).
		  error(function(data, status, headers, config) {
		  	loginResult.isSuccess = false;
		  	loginResult.message = data;
	  		
	  		$backdoor.log("Auth service returned an error when logging in.");
  			$backdoor.log(data);

		  	if (onLoggedInResultEvent)
				onLoggedInResultEvent(loginResult);
		  });

		
	}

	return {
  		login: function(username,password, domain){
  			login(username, password, domain)
  		},
  		logout: function(securityToken){
  			var req = new Requestor(namespace,cls,token);
  			return req;
  		},
  		onLoginResult: function(func){
  			onLoggedInResultEvent = func;
  		},
  		getSecurityToken:function(){
  			if (securityToken)
  				return securityToken;
  			else
  				return "N/A";
  		},
  		getUserName:function(){
  			if (userName)
  				return userName;
  			else{
				var now = new Date();
				userName = now.getHours() + ":" + now.getMinutes() + ":" +   now.getSeconds();
  				return userName;
  			}
  		},
  		getSession:function(){
  			return sessionInfo;
  		},
  		forceLogin:function(username, password,domain){
		  	userName = username;
		  	var loginResult = {}
		  	loginResult.details = {};

		  	var now = new Date();
			loginResult.securityToken = now.getHours() + ":" + now.getMinutes() + ":" +   now.getSeconds();

		  	sessionInfo = loginResult.details;
		  	securityToken = loginResult.securityToken;

		  	if (onLoggedInResultEvent)
		  		onLoggedInResultEvent(loginResult);				  	
  		}

  	}
});


microKernelModule.factory('$fws', function($rootScope, $v6urls, $auth) {
    
    var socket

/*
	var onConnected;
	var onConnectError;
	var onRegistered;
	var onDisconneted;
*/

	isOnline = false;


	function triggerCommand(command, data){
    	var commandObject = {name:command, type:"command", data:data, token:$auth.getSecurityToken()};
        
        socket.emit("command", commandObject, function() {
        	$rootScope.$apply();
        });
	}

    return {
        connect: function(){
        	if (!isOnline){
				socket = io.connect($v6urls.fws + "/");
				
				socket.on("connected", function(data) {
		        	if (data.isSuccess)
		        	{
			        	socket.on("message", function() {
			                var args = arguments;
			                var command = args[0];
			                
			                if (command.type == "command"){
				                $rootScope.$apply(function() {
				                    //callback.apply(socket, args);
				                    $rootScope.$emit("fwscommand_" + command.name, command.data);
				                });
			            	}
			            	else { 
				                $rootScope.$apply(function() {
				                    //callback.apply(socket, args);
				                    $rootScope.$emit("fwsevent_" + command.name, command.data);
				                });
			            	}
							
							
			            });

			            socket.emit("register",{userName:$auth.getUserName(), securityToken:$auth.getSecurityToken()},function(regResult){
			            	isOnline = true;
							$rootScope.$emit("fws_core_registered", {});
			            });
					}
					else {
						$rootScope.$emit("fws_core_connection_error", data.message);
					}
				});
        	}
        },
        disconnect:function(){
        	socket.close();
        },
        command:function(command,data){
        	triggerCommand(command,data);
        },
		forward: function(to, command, data){
			data.from = $auth.getUserName();
			triggerCommand("commandforward",{to:to, command:command, data:data, persistIfOffline:false, alwaysPersist:false});			
		},
        triggerevent:function(event,data){
        	var commandObject = {name:event, type:"event", data:data, token:$auth.getSecurityToken()};
	        
	        socket.emit("command", commandObject, function() {
	        	$rootScope.$apply();
            });
        },
        subscribeEvent:function(event){
        	var commandObject = {name:event, type:"event-subscribe", data: {userName:$auth.getUserName(), event:event}, token:$auth.getSecurityToken()};
	        
	        socket.emit("command", commandObject, function() {
	        	$rootScope.$apply();
            });
        },
        unsubscribeEvent:function(event){ 
        	var commandObject = {name:event, type:"event-unsubscribe", data: {userName:$auth.getUserName(), event:event}, token:$auth.getSecurityToken()};
	        
	        socket.emit("command", commandObject, function() {
	        	$rootScope.$apply();
            });
	    },
        onConnected:function(func){ $rootScope.$on("webrtc_chat_call_establishing", func);},
        onRegistered: function(func){ $rootScope.$on("fws_core_registered", func);},
        onDisconneted:function(func){$rootScope.$on("webrtc_chat_call_establishing", func); },
        onRecieveCommand:function(command,callback){
			$rootScope.$on("fwscommand_" + command, callback);
        },
        onRecieveEvent:function(event,callback){
			$rootScope.$on("fwsevent_" + event, callback);
        },
        isOnline: function(){return isOnline}
    };
});


microKernelModule.factory('$chat', function($rootScope, $fws, $auth) {

	$fws.onRegistered(function(){
		$fws.onRecieveCommand("chatmessage",function(e,data){
			$rootScope.$emit("fws_chat_message", data);
		});
	});


	return {
		onMessage: function(func){ $rootScope.$on("fws_chat_message", func); },
		send:function(to,from,message){
			$fws.command("chatmessage",{to:to, from:from, message:message});
		}
	};
});

microKernelModule.factory('$matrics', function($rootScope, $fws, $auth) {

	$fws.onRecieveCommand("matrics",function(e,data){
		//{serverId:"xxx", category:"yyy", matrics:{}}
		$rootScope.$emit("fws_matric_message", data);
	});
	
	return {
		onMessage: function(func){ $rootScope.$on("fws_matric_message", func); },
		on:function(serverId){
			$fws.forward(serverId, "matricMessage",{state:"on"});
		},
		off:function(serverId){
			$fws.forward(serverId, "matricMessage",{state:"off"});
		}
	};
});

microKernelModule.factory('$webrtc', function($fws, $auth,$rootScope, $helpers) {
	//idle,establishing, outgoing,incoming,oncall

	var isStreamStarted = false;

	var localStream, localPeerConnection;

	var localVideo,remoteVideo;

	var partnerDescription,localDescription;
	
	var toUserName;

	var sendChannel, receiveChannel;

	var servers = null;

	var currentState = "idle";

	if (navigator.webkitGetUserMedia) {
		RTCPeerConnection = webkitRTCPeerConnection;
	} else if(navigator.mozGetUserMedia){
		RTCPeerConnection = mozRTCPeerConnection;
		RTCSessionDescription = mozRTCSessionDescription;
		RTCIceCandidate = mozRTCIceCandidate;
	}

	$fws.onRecieveCommand("webrtc",function(e,data){
		handleState(data.from, data.state,data.data);
	});

	$fws.onRecieveCommand("webrtc_candidate",function(e,data){
		var candidate = new RTCIceCandidate({sdpMLineIndex:data.label, candidate:data.candidate});
		localPeerConnection.addIceCandidate(candidate);
	});

	function handleState(from, state,data){

		switch(state){
			case "idle":
				switch(currentState){
					case "establishing":
						$rootScope.$emit("webrtc_chat_call_establishing_error", data);
						break;
					case "outgoing":
						$rootScope.$emit("webrtc_chat_call_cancled", data);
						break;
					case "incoming":
						$rootScope.$emit("webrtc_chat_rejected", data);
						break;
					case "oncall":
						$rootScope.$emit("webrtc_chat_ended", data);
						break;
				}
				break;
			case "establishing":
				if (currentState == "idle"){
					$rootScope.$emit("webrtc_chat_call_establishing", data);
				}
				break;
			case "outgoing":
				if (currentState == "establishing"){
					$rootScope.$emit("webrtc_chat_call_establishing_success", data);
				}
				break;
			case "incoming":
				if (currentState == "idle"){
					partnerDescription = data;
					toUserName = data.from;

					localPeerConnection = new RTCPeerConnection(servers);
					localPeerConnection.addStream(localStream);

					localPeerConnection.onicecandidate = gotLocalIceCandidate;
					localPeerConnection.onaddstream = gotRemoteStream;

					forwardCommand(from, "outgoing", {});
					$rootScope.$emit("webrtc_chat_ringing", data);
				}
				break;
			case "oncall":
				switch(currentState){
					case "outgoing":
						partnerDescription = data;
						//handle answer for outgoing call
						answerOtherSide();
						$rootScope.$emit("webrtc_chat_reciever_answered", data);
						break;
					case "incoming":
						
						$rootScope.$emit("webrtc_chat_answered", data);
						break;
				}
				
				break;
		}

		currentState = state;
		$rootScope.$emit("webrtc_chat_state_change", state);

	}

	//to, command, data, persistIfOffline, alwaysPersist

	function forwardCommand(to, state, args){
		$fws.command("commandforward",{to:to, command:"webrtc", data:{state:state, data:args, from:$auth.getUserName()}, persistIfOffline:false, alwaysPersist:false});
	}




	function startLocalStream(){
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		
		navigator.getUserMedia({audio:true, video:true}, function(stream){
			if (window.URL) {
				localVideo.src = URL.createObjectURL(stream);
			} else {
				localVideo.src = stream;
			}

			localStream = stream;
			isStreamStarted = true;
		},
		function(error) {
			
		});
	}

	function getLocalSDP(to, task) {

		toUserName = to;

		/*
		if(navigator.webkitGetUserMedia) {
			if (localStream.getVideoTracks().length > 0) {
				log('Using video device: ' + localStream.getVideoTracks()[0].label);
			}
			if (localStream.getAudioTracks().length > 0) {
				log('Using audio device: ' + localStream.getAudioTracks()[0].label);
			}
		}
		*/

		localPeerConnection = new RTCPeerConnection(servers);
		localPeerConnection.addStream(localStream);

		localPeerConnection.onicecandidate = gotLocalIceCandidate;
		localPeerConnection.onaddstream = gotRemoteStream;
	
	

		try {
		
			sendChannel = localPeerConnection.createDataChannel("sendDataChannel",{reliable: true});
			
		} catch (e) {
			alert('Failed to create data channel. ');
			
		}

		sendChannel.onopen = handleSendChannelStateChange;
		sendChannel.onmessage = handleMessage;
		sendChannel.onclose = handleSendChannelStateChange;

		var localDescFunc =	function (description){
		localPeerConnection.setLocalDescription(description);
		
		task.endSuccess({sdp:description.sdp, type:"offer", from:$auth.getUserName()});
		//task.endSuccess(description);

		}

		localPeerConnection.createOffer(localDescFunc, onSignalingError);
	}



	function handleReceiveChannelStateChange() {
		var readyState = sendChannel.readyState;
		console.log('Send channel state is: ' + readyState);
		if (readyState == "open") {

		} else {
		}
	}


	function handleSendChannelStateChange() {
		var readyState = sendChannel.readyState;
		console.log('Send channel state is: ' + readyState);
		if (readyState == "open") {

		} else {
		}
	}

	function handleMessage(event) {
		console.log('Received message: ' + event.data);
	}


	function answerOtherSide(){
		var desc = new RTCSessionDescription();
		desc.sdp = partnerDescription.sdp;
		desc.type = partnerDescription.type;
		localPeerConnection.setRemoteDescription(desc);
		localPeerConnection.createAnswer(gotRemoteDescription, onSignalingError);		
	}

	function gotRemoteDescription (description){
		localPeerConnection.setRemoteDescription(description);
	}


	function answerThisSide(task){
		var desc = new RTCSessionDescription();
		desc.sdp = partnerDescription.sdp;
		desc.type = partnerDescription.type;


		/*
		localPeerConnection = new RTCPeerConnection(servers);
		localPeerConnection.addStream(localStream);

		localPeerConnection.onicecandidate = gotLocalIceCandidate;
		localPeerConnection.onaddstream = gotRemoteStream;
		*/

		localPeerConnection.setRemoteDescription(desc);
		
		try {
		
			sendChannel = localPeerConnection.createDataChannel("sendDataChannel",{reliable: true});
			
		} catch (e) {
			alert('Failed to create data channel. ');
			
		}

		sendChannel.ondatachannel = function (event) {
			trace('Receive Channel Callback');
			receiveChannel = event.channel;
			receiveChannel.onmessage = handleMessage;
			receiveChannel.onopen = handleReceiveChannelStateChange;
			receiveChannel.onclose = handleReceiveChannelStateChange;
		};



		localPeerConnection.createAnswer(			
			function (description){
				localPeerConnection.setLocalDescription(description);		
				
				task.endSuccess({sdp:description.sdp, type:"answer"});
			}, function (error){
				console.log("Call Answer ERROR!!!");
			});		


	}


	function hangup() {
		localPeerConnection.close();
	}

	function gotRemoteStream(event){
		if (window.URL) {
			// Chrome
			var url= window.URL.createObjectURL(event.stream);
			console.log("Remote Stream Url : " + url);
			remoteVideo.src = url;

		} else {
			// Firefox
			remoteVideo.src = event.stream;
		}
	}


	function gotLocalIceCandidate(event){
		if (event.candidate) {
			localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));

			var sendData = {
							type: 'candidate',
							label: event.candidate.sdpMLineIndex,
							id: event.candidate.sdpMid,
							candidate: event.candidate.candidate
						};

			$fws.command("commandforward",{to:toUserName, command:"webrtc_candidate", data:sendData, persistIfOffline:false, alwaysPersist:false});


		}
	}


	function onSignalingError(error){
		console.log(error);
	}

	return {
		onCallEstablishing: function(func){$rootScope.$on("webrtc_chat_call_establishing", func);},
		onCallEstablishError: function(func){$rootScope.$on("webrtc_chat_call_establishing_error", func);},
		onCallEstablishSuccess: function(func){$rootScope.$on("webrtc_chat_call_establishing_success", func);},
		onCallCallCancelled: function(func){$rootScope.$on("webrtc_chat_call_cancled", func);},
		onRecieverAnswered: function(func){$rootScope.$on("webrtc_chat_reciever_answered", func);},
		onRejected: function(func){$rootScope.$on("webrtc_chat_rejected", func);},
		onRinging: function(func){$rootScope.$on("webrtc_chat_ringing", func);},
		onAnswered: function(func){$rootScope.$on("webrtc_chat_answered", func);},
		onEnded: function(func){$rootScope.$on("webrtc_chat_ended", func);},
		onStateChange: function(func){$rootScope.$on("webrtc_chat_state_change", func);},
		getState: function(){ return currentState;},
		
		call: function(to, args){ 
			
			$helpers.task(function(data, task){
				//call method to get current SDP
				getLocalSDP(to, task);
			}, function(data){
				forwardCommand(to, "incoming", data);  
				handleState($auth.getUserName(), "establishing",{});

			}, function(data){

			});
		},
		
		reject: function(to, args){ 
			forwardCommand(to, "idle", args); 
			handleState($auth.getUserName(), "idle",{});
		},
		
		answer:function(to, args){ 

			$helpers.task(function(data, task){
				//call method to get current SDP
				//getLocalSDP("", task);

				answerThisSide(task);

			}, function(data){
				
				//handle answer for incoming call
				//createRemoteAnswer();

				forwardCommand(to, "oncall", data); 
				handleState($auth.getUserName(), "oncall",data);
			}, function(data){

			});
		},
		
		end:function(to, args){ 
			hangup();

			forwardCommand(to, "idle", args);  
			handleState($auth.getUserName(), "idle",{});
		},

		setVideoTags: function(localVideoTag,remoteVideoTag){
			localVideo = document.getElementById(localVideoTag);
			remoteVideo = document.getElementById(remoteVideoTag);
		},

		startLocalStream: function(){
			startLocalStream();
		},

		startRemoteStream: function(){

		},
		stopLocalStream: function(){

		},
		stopRemoteStream:function(){

		}
	};
});

microKernelModule.factory('$presence', function($fws,$rootScope, $auth) {
	
	function setOnline(){
		$fws.connect();	
	}
	
	$fws.onRegistered(function(){
		
		$fws.onRecieveCommand("usersloaded", function(e,data){
			$rootScope.$emit("fws_pres_users", data);
		});
		
		$fws.onRecieveEvent("userstatechanged", function(e,data){
			$rootScope.$emit("fws_pres_user_state", data);
		});

		$fws.subscribeEvent("userstatechanged");
		$rootScope.$emit("fws_pres_state", {state:"online"});
	});


	return {
		setOnline:function(){setOnline();},
		setOffline:function(){},
		onOnlineUsersLoaded:function(func){ $rootScope.$on("fws_pres_users", func);},
		onUserStateChanged:function(func){ $rootScope.$on("fws_pres_user_state", func); },
		onStateChanged:function(func){ $rootScope.$on("fws_pres_state", func);},
		getOnlineUsers: function(){
			$fws.command("getallusers",{from:$auth.getUserName()});
		},
		getUsers:function(){}
	};
});

microKernelModule.factory('$notifications', function($fws) {
	return {
		onRecieve: function(func){}
	};
});


microKernelModule.factory('$backdoor', function() {
   
   	var logLines = [];
	var onItemAdded;

	function timeStamp() {
		var now = new Date();
		var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
		var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
		 
		var suffix = ( time[0] < 12 ) ? "AM" : "PM";
		 
		time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
		 
		time[0] = time[0] || 12;
		 
		for ( var i = 1; i < 3; i++ )
			if ( time[i] < 10 )
				time[i] = "0" + time[i];
		 
		return date.join("/") + " " + time.join(":") + " " + suffix;
	} 

    return {
		log: function(data){
			var newLine = timeStamp() + "           " +  data;

			logLines.push(newLine);

			if (onItemAdded){
				onItemAdded(newLine, logLines);
			}
		},
		onUpdate: function(func){
			onItemAdded = func;
		}
    };
});

microKernelModule.factory('$v6urls', function() {
   
	var urls={
		auth:"http://192.168.2.40:3048",
		objectStore:"http://192.168.2.42:3000",
		fws:"http://localhost:4000"
	};

    return urls;
});

