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
	//配合右边窗口最后一行看不到（新起一行时），加一行(\n是因为最后一行是网址会有问题)
	text += "\n<br>";
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
			//console.log(t,tabs[0]);
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

	//实时滚动
	cycle();
}

window.addEventListener("load", onload);

//编辑框预览框实时滚动
var txtMain;      // 输入框
var spPreview;    // 预览框

function getInput() {
	var edotorFrame = window.frames['editorFrame'];
	return edotorFrame.contentWindow.$('.ace_scrollbar.ace_scrollbar-v');
}

function getPreview() {
	var showFrame = window.frames['showFrame'];
	return showFrame.contentWindow.document.documentElement;
}

function scrollEvent(){
	txtMain = getInput()[0];
	spPreview = getPreview();

	if(txtMain == undefined) {
	  return;
	}
	if(spPreview == undefined) {
	  return;
	}

	let mainFlag = false; // 抵消两个滚动事件之间互相触发
	let preFlag = false; // 如果两个 flag 都为 true，证明是反弹过来的事件引起的

	function scrolling(who){
	  if(who == 'pre'){
	    preFlag = true;
	    if (mainFlag === true){ // 抵消两个滚动事件之间互相触发
	      mainFlag = false;
	      preFlag = false;
	      return;
	    }
	    let tetLeft = txtMain.scrollHeight - txtMain.clientHeight;
	    let spLeft = spPreview.scrollHeight - spPreview.clientHeight;
	    if (spLeft >= 0) return;
	    txtMain.scrollTop = Math.round(tetLeft * spPreview.scrollTop  / spLeft);
	    return;
	  }
	  if(who == 'main'){
	    mainFlag = true;
	    if (preFlag === true){ // 抵消两个滚动事件之间互相触发
	      mainFlag = false;
	      preFlag = false;
	      return;
	    }
	    let tetLeft = txtMain.scrollHeight - txtMain.clientHeight;
	    let spLeft = spPreview.scrollHeight - spPreview.clientHeight;
	    if (tetLeft <= 0) return;
	    spPreview.scrollTop = Math.round(spLeft * txtMain.scrollTop / tetLeft);
	    return;
	  }
	}

	function mainOnscroll(){
	  scrolling('main');
	}

	function preOnscroll(){
	  scrolling('pre');
	}

	getInput().on('scroll', () => mainOnscroll());
	getPreview().addEventListener('scroll', preOnscroll());
}

function cycle() {
	scrollEvent();

	window.setTimeout(cycle, 1000);
}