/**
 * 嵌入该js文件到页面
 */

//点击打开编辑器
function popEditClick() {
	console.log("popEditClick");
	//把博客里的文本复制到编辑器插件里
	var message = $("#" + EDIT_TEXTAREA_ID).val();
	// console.log("文本框的值" + message);
	editorWindow().postMessage({"message": message, "dealType": "setSidePanel"}, "*");
	$('#nestMDDiv').show();
	$('cnb-root').hide();

	initSychroHeight();
}

//点击关闭编辑器
function closeEditClick() {
	console.log("closeEditClick");
	$('cnb-root').show();
	$('#nestMDDiv').hide();
	editorWindow().postMessage({"dealType": "clear"}, "*");
	initSychroHeight();
}

function initSychroHeight() {
	//初始化展示框和编辑框在同一高度
	setTimeout(function() {
		// console.log("timeout", spScrollTop);
		// 预览框的高度值初始化过，直接返回
		if (spScrollTop != 0) return;

		oldTxtScrollTop = 0;
		sendScroll2Txt();
	}, 100);
}

//得到编辑器contentWindow
function editorWindow() {
	return window.frames['editorFrame'].contentWindow;
}
//得到预览窗contenWindow
function viewWindow() {
	return window.frames['showFrame'].contentWindow;
}
//编辑页面文本框id
const EDIT_TEXTAREA_ID = "md-editor";

/**
 * 消息格式：
 * {
		from: "",
		to: "",
		message: "",
		scroll: {
			from: "",
			message: "",
			scrollHeight: ,
			clientHeight: ,
			crollTop:
		},
		dealType: ""
	}
 */

//处理接收到的数据
function dealData(data) {
	if (data.message) {
		//消息传给显示页和博客页面, 并触发change事件
		viewWindow().postMessage(data, "*");
		$("#" + EDIT_TEXTAREA_ID).val(data.message);
		$("#" + EDIT_TEXTAREA_ID)[0].dispatchEvent(new Event('change'));
		$("#" + EDIT_TEXTAREA_ID)[0].dispatchEvent(new Event('blur'));
	}

	// console.log(data.scrollTop, data.scrollHeight, data.clientHeight, data.from);
	if (data.scroll) {
		var scrollData = data.scroll;
		if (scrollData.from == "preview") {
			spScrollHeight = scrollData.scrollHeight;
			spClientHeight = scrollData.clientHeight;
			spScrollTop = scrollData.scrollTop;
			spScrolling();
		}
		else if (scrollData.from == "txtMain") {
			txtScrollHeight = scrollData.scrollHeight;
			txtClientHeight = scrollData.clientHeight;
			txtScrollTop = scrollData.scrollTop;
			txtScrolling(scrollData.message);
		}
	}

	if (data.dealType) {
		//显示编辑器按钮
		if ("showMD" == data.dealType) {
			$(".loadEffect").hide();
			if ($("#md_plugin_div")) $("#md_plugin_div").show();
			
		}
	}
}

//监听从编辑器发出的数据
window.addEventListener('message', function (e) {
	// console.log("父页面收到了数据");
	dealData(e.data);
}, false);


/*编辑框预览框实时滚动*/
//缓存输入文本
var oldMessage = "";
//高度变化触发窗口滑动阈值
var heightThred = 35;
//隐藏而不滚动的阈值
var hideNotScrollThread = 50;
//空白的高度
var blankHeight = 14.3906 * 42;

//输入框总高度
var txtScrollHeight = 0, spScrollHeight = 0;
//输入框高度
var txtClientHeight = 0, spClientHeight = 0;

//缓存预览框top高度, 缓存输入框top高度
var oldSpScrollTop = 0, oldTxtScrollTop = 0;
//预览框top高度, 输入框top高度
var spScrollTop = 0, txtScrollTop = 0;

//处理编辑器滚动
function txtScrolling(message) {
	//净可滚动高度
	let scrollEditor = txtScrollHeight - txtClientHeight;
    let scrollShow = spScrollHeight - spClientHeight;
    // console.log(scrollEditor, scrollShow, "txtScrolling");
	if (oldMessage.length != message.length) {
		//判断编辑框、展示框隐藏是否超过阈值（防止在文件中间修改）
		let hideEditor = scrollEditor - txtScrollTop;
		let hideShow = scrollShow - spScrollTop;
		console.log(hideEditor, hideShow, blankHeight);
		//未超过阈值，上划编辑器到顶
		if ((hideEditor > blankHeight - hideNotScrollThread || hideShow > blankHeight - hideNotScrollThread)
			&& (hideEditor <=  blankHeight || hideShow <= blankHeight)) {
			txtScrollTop = txtScrollHeight - txtClientHeight;
			oldMessage = message;
		}
	}

	//没达到阈值，不触发联动滚动
	if (!overThred(oldTxtScrollTop, txtScrollTop)) return;
	oldTxtScrollTop = txtScrollTop;
	//调整展示器
	oldSpScrollTop = scrollShow * (txtScrollTop / scrollEditor);
	sendScroll2Preview();
}

//处理展示器滚动
function spScrolling() {
	//没达到阈值，不触发联动滚动
	if (!overThred(oldSpScrollTop, spScrollTop)) return;
	oldSpScrollTop = spScrollTop;

	//净可滚动高度
	let scrollEditor = txtScrollHeight - txtClientHeight;
    let scrollShow = spScrollHeight - spClientHeight;
	//调整编辑器
	oldTxtScrollTop = scrollEditor * (spScrollTop / scrollShow);
	sendScroll2Txt();
}


//是否超过滚动阈值
function overThred(oldHeight, newHeight) {
	return Math.abs(oldHeight - newHeight) > heightThred;
}

//通知展示框滚动
function sendScroll2Preview() {
	var data = {"scrollTop": oldSpScrollTop};
	viewWindow().postMessage(data, "*");
}

//通知文本框滚动
function sendScroll2Txt() {
	var data = {"scrollTop": oldTxtScrollTop};
	editorWindow().postMessage(data, "*");
}
