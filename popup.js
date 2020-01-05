//是否博客园编辑页面
var blogEditPageFlag = false;
//是否onload
var loaded = false;

//显示内容--编辑器窗口触发
function toShow(text) {
	//console.log('parent');
	//即时展示到右边窗口
	toMardownStyle(text);

	//展示回博客园编辑器
	toBlog(text);
}

//即时展示到右边窗口
function toMardownStyle(text) {
	var show = window.frames['showFrame'];
	show.contentWindow.document.getElementById('content').innerHTML =
	      marked(text);
}

//展示到编辑器
function toEditor(text) {
	var edotor = window.frames['editorFrame'];
	var textDom = edotor.contentWindow.$('.ace_text-input');
	// if (textDom.eq(0).val() != "") {
	// 	console.log("清空");
	// 	edotor.contentWindow.$('#editor-container .ace_layer.ace_text-layer .ace_line_group').remove();
	// }
	//赋值
	textDom.eq(0).val(text);
	textDom[0].dispatchEvent(new Event('input'));

}

//展示回博客园编辑器
function toBlog(text) {
	//console.log("编辑页面: " + blogEditPageFlag);
	if (blogEditPageFlag) {
		console.log('发送内容到页面！');
		sendToContent('sendContenText', text);
	} else {
		//判断是否编辑页面
		//sendToContent("blogEditorPage", "");
	}

}

//给content发数据
//参数为类型和消息
function sendToContent(t, m) {
	try {
		chrome.tabs.query({active: true, currentWindow: true, url: "https://i.cnblogs.com/EditPosts.aspx*"}, function(tabs){  
			console.log(t,tabs[0]);
			//判断是否是博客园页面
			if (tabs[0] == undefined) {
				blogEditPageFlag = false;
				return;
			} else {
				blogEditPageFlag = true;
			}
			chrome.tabs.sendMessage(tabs[0].id, {type: t, message: m}, function(response) {
				if (t == 'blogEditorPage') {
					if(typeof response != 'undefined'){
						//console.log(response);
						blogEditPageFlag = true;
					}else{
						console.log("不是编辑页面！");
					}
				} else if (t == 'getContenText') {
					if(typeof response != 'undefined'){
						//console.log(response.res);
						showToPopup(response.res);
					}
				}else if (t == 'sendContenText') {
					//
				}
			});//end  sendMessage   
		}); //end query
	} catch (e) {
		console.log('connection error');
	}
	// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	// 	const port = chrome.tabs.connect(tabs[0].id);
	// 	port.postMessage({ function: 'blogEditorPage' });
	// 	port.onMessage.addListener((response) => {
	// 		if(typeof response !='undefined'){
	// 			console.log(response.res);
	// 			blogEditPageFlag = true;
	// 			alert("是编辑页面！")
	// 		}else{
	// 			console.log("不是编辑页面！");
	// 		}
	// 	});
	// });
}

//监听content消息
// chrome.runtime.onMessage.addListener(
// 	function(request, sender, sendResponse){
// 		console.log("blog");
// 		return true;
// 	}
// );
// 
//blog中的内容展示到popup页--博客园页面返回
function showToPopup(text) {
	//展示到编辑器
	toEditor(text);
	//展示到markdown样式
	//toMardownStyle(text);
	loaded = true;
}

//页面初始化
function onload() {
	//判断是否编辑页面
	sendToContent("blogEditorPage", "");
	setTimeout(function() {
		if (blogEditPageFlag) {
			console.log('获取blog内容');
			sendToContent('getContenText', '');
		} else {
			alert('警告: 非博客园编辑页面, 输入的所有内容，都不会被保存！！！');
			console.log('不是编辑页面，不用获取内容！');
		}
	}, 1000);
}

window.addEventListener("load", onload);