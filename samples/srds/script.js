function main(){
	scope.acquiredResource = "N/A";
	scope.srsState = $srs.getState().state;

	scope.getResource = function(){
		$srs.getResource();
	}

	

	scope.releaseResource = function(){
		$srs.releaseResource(scope.acquiredResource.name);
	}

	$srs.onResourceAcquired(function(e,data){
		scope.acquiredResource = data;
	});

	$srs.onResourceReleased(function(e,data){
		scope.acquiredResource = "N/A";
	});
	
	$srs.onStateChanged(function(e,data){
		scope.srsState = data.state;
	});
}