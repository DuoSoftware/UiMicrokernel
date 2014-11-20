var mocroKernelModule = angular.module('uiMicrokernel', []);

mocroKernelModule.factory('$objectstore', function($http) {
  
	function Requestor(_namespace,_class,_token){

		var namespace = _namespace;
		var cls = _class;
		var token = _token;
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


			$http.post('http://localhost:3000/com.duosoftware.customer/account',mainObject, {headers:{"securityToken" : "123"}}).
			  success(function(data, status, headers, config) {
			  	if (onComplete)
			  		onComplete(data);				  	
			  }).
			  error(function(data, status, headers, config) {
			  	if (onError)
			  		onError()

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
				$http.get('http://localhost:3000/com.duosoftware.customer/account?keyword=' + keyword,{headers:{"securityToken" : "123"}}).
				  success(function(data, status, headers, config) {
				  	if (onGetMany)
				  		onGetMany(data);				  	
				  }).
				  error(function(data, status, headers, config) {
				  	if (onError)
				  		onError()

				  	if (onGetMany)
				  		onGetMany();
				  });
			},
			getByKey: function(key){
				$http.get('http://localhost:3000/com.duosoftware.customer/account/' + key,{headers:{"securityToken" : "123"}}).
				  success(function(data, status, headers, config) {
				  	if (onGetOne)
				  		onGetOne(data);				  	
				  }).
				  error(function(data, status, headers, config) {
				  	if (onError)
				  		onError()

				  	if (onGetOne)
				  		onGetOne();
				  });
			},
			getAll: function(parameters){
				
			},
			getByFiltering: function(filter,parameters){
				//,"Content-Type":"application/json"
				$http.post('http://localhost:3000/com.duosoftware.customer/account',{"Query" : {"Type" : "", "Parameters": filter}}, {headers:{"securityToken" : "123"}}).
				  success(function(data, status, headers, config) {
				  	if (onGetMany)
				  		onGetMany(data);				  	
				  }).
				  error(function(data, status, headers, config) {
				  	if (onError)
				  		onError()

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
  		getRequestor:function(namespace,cls,token){
  			var req = new Requestor(namespace,cls,token);
  			return req;
  		}
  	}
});


mocroKernelModule.factory('$auth', function($http) {
 
	return {
  		login: function(username,password){
  			var req = new Requestor(namespace,cls,token);
  			return req;
  		},
  		logout: function(securityToken){
  			var req = new Requestor(namespace,cls,token);
  			return req;
  		},
  	}
});

mocroKernelModule.factory('$fws', function($rootScope) {
    var socket = io.connect('http://localhost:4000/');
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});