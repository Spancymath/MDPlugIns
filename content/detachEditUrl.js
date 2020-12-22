/**
 * 侦测是否进入编辑页面
 */
console.log("detachEditUrl in");

//编辑页面网址
const EDIT_PAGE_URL = "https://i.cnblogs.com/posts/edit;";

//上次是否是编辑页面
var lastIsEditPage = true;
//定时查看是否是编辑页，是的话就刷新
setInterval(function() {
	// console.log("interval in");
	var url = window.location.href;
	var isEditPage = url.indexOf(EDIT_PAGE_URL) != -1;
	// console.log(url, isEditPage);
	if (isEditPage && !lastIsEditPage) {
		console.log("刷新编辑页");
		//刷新
		lastIsEditPage = true;
		window.location.reload();
	} else {
		if (!isEditPage) {
			lastIsEditPage = false;
		}
		// console.log("无需刷新");
	}
}, 1000);