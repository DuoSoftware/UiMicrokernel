function main(){
	scope.osNames = [];
	scope.osNewUser = {Id:"1987",Name:"supun"};

	var client = $objectstore.getClient("com.duosoftware.test","testobject");

	scope.objectStoreSave = function(){
		client.insert([scope.osNewUser], {KeyProperty:"Id"});
	};

	scope.objectStoreLoad = function(){
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
			scope.osNames = [data];
	});

	client.onGetMany(function(data){
		if (data)
			scope.osNames = data;
	});	
}