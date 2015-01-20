function main(){
	scope.myFile = null;
	scope.fileStatus = "no file selected for upload";

	scope.uploadFile = function(){
		$uploader.upload("com.duosoftware.com", "testupload", scope.myFile);
		$uploader.onSuccess(function(e,data){

		});

		$uploader.onError(function(e,data){

		});
	}
}