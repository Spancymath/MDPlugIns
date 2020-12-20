/**
 * 嵌入该js文件到页面
 */

//点击打开编辑器
function popEditClick() {
	console.log("popEditClick");
	//把博客里的文本复制到编辑器插件里
	var message = $("#" + EDIT_TEXTAREA_ID).val();
	// console.log("文本框的值" + message);
	editorWindow().postMessage({"message": message}, "*");
	$('#nestMDDiv').show();
	$('cnb-root').hide();
	setTimeout(function() {
		spScrollTop = 0;
		scrolling("pre"); 
	}, 200);
}

//点击关闭编辑器
function closeEditClick() {
	console.log("closeEditClick");
	$('cnb-root').show();
	$('#nestMDDiv').hide();
	editorWindow().postMessage({"dealType": "clear"}, "*");
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
 * 消息格式：{from: "", to: "", message: "", scrollHeight: , clientHeight: , dealType: ""}
 */

//处理接收到的数据
function dealData(data) {
	if (data.message) {
		//消息传给显示页和博客页面
		viewWindow().postMessage(data, "*");
		$("#" + EDIT_TEXTAREA_ID).val(data.message);
	}

	// console.log(data.scrollTop, data.scrollHeight, data.clientHeight, data.from);
	if (data.scrollTop == 0 || data.scrollTop) {
		if (data.from == "preview") {
			spScrollHeight = data.scrollHeight;
			spClientHeight = data.clientHeight;
			newSpScrollTop = data.scrollTop;
			scrolling('pre');
		}
		else if (data.from == "txtMain") {
			txtScrollHeight = data.scrollHeight;
			txtClientHeight = data.clientHeight;
			newTxtScrollTop = data.scrollTop;
			scrolling('main');
		}
	}

	if (data.dealType) {
		//显示编辑器按钮
		if ("showMD" == data.dealType) {
			$(".loadEffect").hide();
			$("#md_plugin_div").show();
		}
	}
}

//监听从编辑器发出的数据
window.addEventListener('message', function (e) {
	console.log("父页面收到了数据");
	dealData(e.data);
}, false);


//编辑框预览框实时滚动
//增加标志
var increaseFlag = false;
//上一次隐藏高度
var lastHideHeight = 0;
//高度变化触发阈值
var heightThred = 35;
//缓存预览框top高度
var spScrollTop = 0;
//缓存输入框top高度
var txtScrollTop = 0;
//预览框top高度
var newSpScrollTop = 0;
//输入框top高度
var newTxtScrollTop = 0;

var txtScrollHeight = 0;//输入框总高度
var spScrollHeight = 0;//预览框总高度

var txtClientHeight = 0;//输入框高度
var spClientHeight = 0;//预览框高度

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
    let tetLeft = txtScrollHeight - txtClientHeight;
    let spLeft = spScrollHeight - spClientHeight;
    console.log(spScrollTop, newSpScrollTop, spLeft);
    //编辑器窗口未达到滚动长度，还没有出现滚动条
    if (spLeft <= 0) return;
    // var newTop = Math.round(tetLeft * spPreview.scrollTop  / spLeft);
    // if (Math.abs(newTop - txtMain.scrollTop) > heightThred) {
    // 	txtMain.scrollTop = newTop;
    // }
    
    //顶部优化
    if (!newSpScrollTop) {
    	newTxtScrollTop = 0;
    	sendScroll2Txt();
    	txtScrollTop = newTxtScrollTop;
    }
    //编辑器窗口高度变化大于阈值，才触发编辑器窗口滚动--优化编辑器窗口上下弹跳
    if (Math.abs(spScrollTop - newSpScrollTop) > heightThred) {
    	newTxtScrollTop = Math.round(tetLeft * newSpScrollTop  / spLeft * 100) / 100;
    	sendScroll2Txt();
    	txtScrollTop = newTxtScrollTop;
    }
  }
  if(who == 'main'){
    mainFlag = true;
    if (preFlag === true){ // 抵消两个滚动事件之间互相触发
      mainFlag = false;
      preFlag = false;
      return;
    }
    let tetLeft = txtScrollHeight - txtClientHeight;
    let spLeft = spScrollHeight - spClientHeight;
    //预览窗口没达到滚动高度
    if (tetLeft <= 0) return;

    //顶部优化
    if (!newTxtScrollTop) {
    	newSpScrollTop = 0;
    	sendScroll2Preview();
    	spScrollTop = newSpScrollTop;
    }
    //输入框top没变化，返回
    if (Math.abs(txtScrollTop - newTxtScrollTop) <= heightThred) return;
    txtScrollTop = newTxtScrollTop;
    //如果在输入则不触发scroll
    // console.log('1', increaseFlag);
    if (increaseFlag) {
    	increaseFlag = false;
    	return;
    }
    // console.log('main --> pre', txtScrollTop, newTxtScrollTop);
    newSpScrollTop = Math.round(spLeft * newTxtScrollTop / tetLeft * 100) / 100;
    sendScroll2Preview(newSpScrollTop);
    spScrollTop = newSpScrollTop;
  }
}

// function cycle() {
// 	scrollEvent();

// 	window.setTimeout(cycle, 1000);
// }

function sendScroll2Preview() {
	var data = {"scrollTop": newSpScrollTop};
	viewWindow().postMessage(data, "*");
}

function sendScroll2Txt() {
	var data = {"scrollTop": newTxtScrollTop};
	editorWindow().postMessage(data, "*");
}
