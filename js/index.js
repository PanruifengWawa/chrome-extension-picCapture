
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, "getPicSrc", function(response) {
		render(response);
	})
});

function render(imgSrcs) {
	var mainDiv = $("#main");
	for(let index = 0, len = imgSrcs.length; index < len; index++ ) {
		var imgDom = $("<img>")
			.attr("id", "img" + index)
			.attr("src", imgSrcs[index])
			.attr("class", "img-float-left selected")
			.on("click", function(e){
				select(this)
			});
		mainDiv.append(imgDom);
	}
	
	function select(that) {
		if(that.classList.contains("selected")) {
			that.classList.remove("selected");
		} else {
			that.classList.add("selected");
		}
	}
	function getBase64(src){
		function getBase64Image(image) {
			var canvas = document.createElement("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			var dataURL = canvas.toDataURL();
			return dataURL;
		}
		var image = new Image();
		image.crossOrigin = 'Anonymous';
		image.src = src;
		var deferred = $.Deferred();
		image.onload = function () {
			deferred.resolve(getBase64Image(image));
		}
		image.onerror = function() {
			deferred.resolve(null);
		}
		return deferred.promise();
	}
	function downloadPic(selectedImgSrcs) {
		var imgBase64Arr = [];
		var zip = new JSZip();
		for(let index = 0, len = selectedImgSrcs.length; index < len; index++ ) {
			var src = selectedImgSrcs[index];
			getBase64(src).then(function(base64){
				if (base64 != null) {
					imgBase64Arr.push(base64);
				} else {
					imgBase64Arr.push(null)
				}
				
			},function(err){
				console.log(err);
			}); 
		}
		
		function waitForBase64FinishAndDownload() {
			setTimeout(function(){
				if(imgBase64Arr.length == selectedImgSrcs.length) {
					for(let i = 0, len = selectedImgSrcs.length; i < len; i++ ) {
						if (imgBase64Arr[i] == null) {
							continue;
						}
						var suffix = imgBase64Arr[i].substring(imgBase64Arr[i].indexOf("image/") + 6, imgBase64Arr[i].indexOf(";base64"));
						zip.file(i + "." + suffix, imgBase64Arr[i].substring(22), {base64: true});
					}
					zip.generateAsync({type:"blob"}).then(function(content) {
						//from FileSaver.js
						saveAs(content, "images.zip");
					});
					$('#status').text("已完成打包，正在下载中，请检查下载内容");
				} else {// unfinished, use timeout to wait
					$('#status').text("打包中：" + imgBase64Arr.length + "/" + selectedImgSrcs.length);
					waitForBase64FinishAndDownload()
				}
			},1000);
		}
		waitForBase64FinishAndDownload();
	}
	$("#download").on("click", function() {
		var selectedImgDoms = $(".selected");
		var selectedImgSrcs = [];
		for(let i = 0, len = selectedImgDoms.length; i <len; i++) {
			selectedImgSrcs.push(selectedImgDoms[i].src)
		}
		if(selectedImgSrcs.length > 0) {
			downloadPic(selectedImgSrcs);
		} else {
			$('#status').text("未选择图片");
		}
		
	});
	
}







