var microKernelModule = angular.module('uiMicrokernel', []);

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
  		}

  	}
});


microKernelModule.factory('$fws', function($rootScope, $v6urls, $auth) {
    
    var socket

	var onConnected;
	var onConnectError;
	var onRegistered;
	var onDisconneted;

	isOnline = false;

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
			                
			                //$rootScope.$apply(function() {
			                //    callback.apply(socket, args);
			                //});
							
							$rootScope.$emit("fwscommand_" + command.name, command.data);
			            });

			            socket.emit("register",{userName:$auth.getUserName(), securityToken:$auth.getSecurityToken()},function(regResult){
			            	if (onRegistered){
			            		isOnline = true;
			            		onRegistered();
			            	}
			            });
					}
					else {
						if (onConnectError)
							onConnectError(data.message);
					}
				});
        	}
        },
        disconnect:function(){
        	socket.close();
        },
        command:function(command,data){
        	var commandObject = {name:command, type:"command", data:data, token:$auth.getSecurityToken()};
	        socket.emit("command", commandObject, function() {
            });
        },
        event:function(event,data){},
        onConnected:function(func){ onConnected = func},
        onRegistered: function(func){ onRegistered = func},
        onDisconneted:function(func){onDisconneted =func },
        onRecieveCommand:function(command,callback){
			$rootScope.$on("fwscommand_" + command, callback);
        },
        isOnline: function(){return isOnline}
    };
});


microKernelModule.factory('$chat', function($rootScope, $fws) {

	function setOnline(){
		if ($fws.isOnline()){
			addEvents();
		}
		else{
			$fws.connect();
			$fws.onRegistered(function(){
				addEvents();
				$rootScope.$emit("fws_chat_state", {state:"online"});
			});
		}
	}

	function addEvents(){
		$fws.onRecieveCommand("chatmessage",function(e,data){
			$rootScope.$emit("fws_chat_message", data);
		});
		$fws.onRecieveCommand("usersloaded", function(e,data){
			$rootScope.$emit("fws_chat_users", data);
		});
	}


	return {
		onMessage: function(func){ $rootScope.$on("fws_chat_message", func); },
		onUsersUpdated:function(func){ $rootScope.$on("fws_chat_users", func); },
		onStateChanged:function(func){ $rootScope.$on("fws_chat_state", func);},
		
		send:function(to,from,message){
			$fws.command("chatmessage",{to:to, from:from, message:message});
		},
		setOnline:function(){setOnline();},
		setOffline:function(){},
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
		auth:"http://192.168.0.128:3048",
		objectStore:"http://192.168.2.42:3000",
		fws:"http://localhost:4000"
	};

    return urls;
});