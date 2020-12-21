//实时滚动
var spPreview = document.documentElement;
//预览页空行--2+43-6
var viewBlankLines = "\n\n<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"
					+"<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>";

//增加预览窗口里的空行
function addViewBlank(text) {
	return text + viewBlankLines;
}

//即时展示到右边窗口
function toMardownStyle(text) {
	//配合右边窗口最后一行看不到（新起一行时），加一行(\n是因为最后一行是网址会有问题)
	text = addViewBlank(text);
	// console.log(text);
	$('#content').html(marked(text));
}

//处理接收到的数据
function dealData(data) {
	if (data.message) {
		// console.log(data.message);
		toMardownStyle(data.message);
	}

	if (data.scrollTop == 0 || data.scrollTop) {
		// console.log("show scrollTop: " + data.scrollTop);
		spPreview.scrollTop = data.scrollTop;
	}
	//让父页面初始化展示页信息
	if (!data.clientHeight) sendScrollData();
}

//监听父页面传来的消息
window.addEventListener('message', function (e) {
	// console.log("展示页面收到了父页面发送的数据");
	dealData(e.data);
}, false);

//监听滚动事件
window.addEventListener('scroll', sendScrollData, false);

function sendScrollData() {
	var data = {
		"scrollHeight": Math.round(spPreview.scrollHeight * 100) / 100,
		"clientHeight": Math.round(spPreview.clientHeight * 100) / 100,
		"scrollTop": Math.round(spPreview.scrollTop * 100) / 100,
		"from": "preview"
	};
	window.parent.postMessage(data, '*');
}
