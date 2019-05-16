function getImgSrcs() {
	var imgDoms = document.getElementsByTagName("img");
	var imgSrcs = [];
	var basePath = window.location.origin;
	var currentPath = basePath + window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

	for(let i = 0, len = imgDoms.length; i < len; i++) {
		var src = imgDoms[i].src;
		if(src == undefined || src == null || src == "") { //filter empty src
			continue;
		}
		if(src.length > 1024) { //filter large src with length 1024 
			continue;
		}
		var tempSrc = "";
		console.log(src)
		if(src.startsWith("http")) { //full path
			tempSrc = imgDoms[i].src;
		} else if (src.startsWith("/")) { //absoulate path
			tempSrc = basePath + "/" +imgDoms[i].src;
		} else { //relative path
			tempSrc = currentPath + "/" +imgDoms[i].src;
		}
		if(imgSrcs.indexOf(tempSrc) == -1) { //tempSrc is not in the imgSrcs Array, and push it in
			imgSrcs.push(tempSrc);
		}
	
	}
	return imgSrcs;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log("message from extension Picture Capture :" + message);
	var imgSrcs = getImgSrcs();
  	sendResponse(imgSrcs);
});
