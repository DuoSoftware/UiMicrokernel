var mainModule = angular.module("mainApp", ["uiMicrokernel"]);

mainModule.controller("mainController", function ($scope, $presence, $chat, $webrtc, $auth, $backdoor, $objectstore, $agent, $srs, $uploader, $apps) {

	$scope.currentUser;
	$scope.password;

	$scope.login = function(){
		$auth.forceLogin($scope.currentUser, $scope.password, "");
	}


	$auth.onLoginResult(function(data){
		$("#dialog").dialog('close');

		$presence.setOnline();
	
	});


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////   BACKDOOR  //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


	$scope.logs = [];
	$backdoor.onUpdate(function(newline, alllines){
		$scope.logs = alllines;
	})

	$(".chatUserStyle").selectable();


///////////////	///////////////////////////////////////////////////////////////////////
////////////////////////////////////   App Manager  //////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

	$scope.openHardcodedApp = function(){
        var appCode = "APP_TEST";
        var renderElement = "idRenderDiv";

		var heditor = ace.edit("htmleditor");
		var jeditor = ace.edit("jseditor");

		$("#" + renderElement).empty();

		var model = jeditor.getSession().getValue();
        var view =  heditor.getSession().getValue() ;
        //eval("model = " + jeditor.getSession().getValue() + "()");

        $apps.executeMVC($scope, renderElement, appCode, view, model);

        $("#" + renderElement).dialog({width: "400"});
	};

});
