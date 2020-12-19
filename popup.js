//编辑页面网址
const EDIT_PAGE_URL = "https://i.cnblogs.com/posts/edit*";
//是否博客园编辑页面
var blogEditPageFlag = false;

//得到编辑器contentWindow
function getEditorWindow() {
	return window.frames['editorFrame'].contentWindow;
}
//得到预览窗contenWindow
function getViewWindow() {
	return window.frames['showFrame'].contentWindow;
}

//上一次展示内容
var oldText = "";

//显示内容--编辑器窗口触发
function toShow(text) {
	//console.log('parent');
	//即时展示到右边窗口
	toMardownStyle(text);

	//展示回博客园编辑器
	toBlog(text);

	//自动翻页
	autoUp(text);
}

//增加标志
var increaseFlag = false;
//上一次隐藏高度
var lastHideHeight = 0;

//自动翻页
function autoUp(text) {
	//预览界面
	let viewObj = getPreview();
	//如果编辑器内容增加
	if (oldText != ""
		&& text.length > oldText.length) {
		increaseFlag = true;
	    //console.log('0', increaseFlag);
		let hideHeight = viewObj.scrollHeight - viewObj.clientHeight - viewObj.scrollTop;
		//console.log(lastHideHeight, hideHeight);
		//高度没有变化则返回
		if (lastHideHeight === hideHeight) return;
		lastHideHeight = hideHeight;
		//console.log('hideHeight: ' + hideHeight);
		//如果在内容中间修改，则返回
		if (hideHeight > blankHeight + blankHeight / 10)
			return;
		//如果预览框隐藏了内容，就向上滚动
		if (hideHeight > blankHeight) {
			console.log('up');
			viewObj.scrollTop = viewObj.scrollHeight - viewObj.clientHeight - blankHeight / 5;
		}
	}
	oldText = text;
}

//编辑器空行--33行,吃掉一行，显示32行
var eidtorBlankLines = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
//预览页空行--2+33-6
var viewBlankLines = "\n\n<br><br><br><br><br><br><br><br><br><br><br><br><br>"
					+ "<br><br><br><br><br><br><br><br><br><br><br><br><br><br>";
//这么多空格的高度
var blankHeight = 458;
//增加编辑器里的空行
function addEditorBlank(text) {
	return text + eidtorBlankLines;
}

//增加预览窗口里的空行
function addViewBlank(text) {
	return text + viewBlankLines;
}

//即时展示到右边窗口
function toMardownStyle(text) {
	//配合右边窗口最后一行看不到（新起一行时），加一行(\n是因为最后一行是网址会有问题)
	text = addViewBlank(text);
	getViewWindow().document.getElementById('content').innerHTML =
	      marked(text);
}

//展示到编辑器
function toEditor(text) {
	var textDom = getEditorWindow().$('.ace_text-input');
	// if (textDom.eq(0).val() != "") {
	// 	console.log("清空");
	// 	edotor.contentWindow.$('#editor-container .ace_layer.ace_text-layer .ace_line_group').remove();
	// }
	//赋值
	textDom.eq(0).val(text);
	textDom[0].dispatchEvent(new Event('input'));
	//texare获取焦点，使得光标隐藏
	textDom.eq(0).focus();
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
		chrome.tabs.query({active: true, currentWindow: true, url: EDIT_PAGE_URL}, function(tabs){  
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
						console.log(response.res);
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
	//展示到编辑器、去掉前后空格（防止多次加载问题）
	toEditor(addEditorBlank(text.trim()));
	//展示到markdown样式
	//toMardownStyle(text);
	//loaded = true;
}

//页面初始化
function onload() {
	//判断是否编辑页面
	sendToContent("blogEditorPage", "");
	window.setTimeout(function() {
		if (blogEditPageFlag) {
			console.log('获取blog内容');
			sendToContent('getContenText', '');
			//初始化为翻页到页面底部
			window.setTimeout(function() {
				txtMain.scrollTop = txtMain.scrollHeight - txtMain.clientHeight - 100;
				spPreview.scrollTop = spPreview.scrollHeight - spPreview.clientHeight - 100;
			}, 200);
		} else {
			toEditor(addEditorBlank(""));
			alert('警告: 非博客园编辑页面, 输入的所有内容，都不会被保存！！！');
			console.log('不是编辑页面，不用获取内容！');
		}
	}, 100);

	//实时滚动
	cycle();
}

window.addEventListener("load", onload);

//编辑框预览框实时滚动
var txtMain;      // 输入框
var spPreview;    // 预览框
//高度变化触发阈值
var heightThred = 15;
//缓存预览框top高度
var spscrollTop = 0;
//缓存输入框top高度
var mainScrollTop = 0;

//var txtScrollHeight = 0;//输入框总高度
var spScrollHeight = 0;//预览框总高度

function getInput() {
	return getEditorWindow().$('.ace_scrollbar.ace_scrollbar-v');
}

function getPreview() {
	return getViewWindow().document.documentElement;
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
	    //console.log(spPreview.scrollHeight, spPreview.clientHeight, spPreview.scrollTop);
	    //编辑器窗口未达到滚动长度，还没有出现滚动条
	    if (spLeft <= 0) return;
	    // var newTop = Math.round(tetLeft * spPreview.scrollTop  / spLeft);
	    // if (Math.abs(newTop - txtMain.scrollTop) > heightThred) {
	    // 	txtMain.scrollTop = newTop;
	    // }
	    //编辑器窗口高度变化大于阈值，才触发编辑器窗口滚动--优化编辑器窗口上下弹跳
	    if (Math.abs(spscrollTop - spPreview.scrollTop) > heightThred) {
	    	txtMain.scrollTop = Math.round(tetLeft * spPreview.scrollTop  / spLeft);
	    	spscrollTop = spPreview.scrollTop;
	    }
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
	    //预览窗口没达到滚动高度
	    if (tetLeft <= 0) return;
	    //输入框top没变化，返回
	    if (mainScrollTop === txtMain.scrollTop) return;
	    mainScrollTop = txtMain.scrollTop;
	    //如果在输入则不触发scroll
	    //console.log('1', increaseFlag);
	    if (increaseFlag) {
	    	increaseFlag = false;
	    	return;
	    }
	    //console.log('main --> pre', txtMain.scrollTop);
	    spPreview.scrollTop = Math.round(spLeft * txtMain.scrollTop / tetLeft);
	    spscrollTop = spPreview.scrollTop;
	    return;
	  }
	}

	function mainOnscroll(){
	  scrolling('main');
	}

	function preOnscroll(){
	  scrolling('pre');
	}

	//输入框没达到滚动高度时，预览框也要实时滚动
	if (txtMain.scrollHeight == 0
			&& spScrollHeight < spPreview.scrollHeight) {
		console.log('only view scroll');
		spPreview.scrollTop += (spPreview.scrollHeight - spScrollHeight);
		spScrollHeight = spPreview.scrollHeight;
	}

	getInput().on('scroll', () => mainOnscroll());
	getPreview().addEventListener('scroll', preOnscroll());
}

function cycle() {
	scrollEvent();

	window.setTimeout(cycle, 1000);
}