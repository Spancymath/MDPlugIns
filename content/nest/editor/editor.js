require("kitchen-sink/demo");
//判断页面加载完成
var loaded = false;
//文本有变化才更新
var sessionTextLocal = "";

//页面初始化
function onload() {
	console.log('editor onload');
	//默认自动换行显示
	$('.ace_optionsMenuEntry').find("button[value='free']").trigger("click");
	//默认markdown模式不可修改
	$('.ace_optionsMenuEntry #-doc').val("Markdown");
	$('.ace_optionsMenuEntry #-doc')[0].dispatchEvent(new Event('change'));
	//todo 不生效，有高手可以搞搞
	// $('.ace_optionsMenuEntry #-doc').attr('disabled', "disabled");
	// $('.ace_optionsMenuEntry #-mode').attr('disabled', "disabled");
	/**编辑页面隐藏滚动条**/
	$(".ace_scrollbar.ace_scrollbar-v").css("visibility","hidden");
	
	loaded = true;

	//显示编辑器按钮
	var data = {"dealType": "showMD"};
	window.parent.postMessage(data, '*');
}

window.addEventListener("load", onload);

//输入后输出内容到父窗口
$(".ace_content").bind('DOMNodeInserted', function(e) {
	var linesText = "";
	if (loaded) {
		linesText = env.editor.session.getValue();
		if (linesText != sessionTextLocal) {
			// parent.toShow(linesText);
			// console.log(linesText);
			var data = {'message': linesText};
			window.parent.postMessage(data, '*');
			sessionTextLocal = linesText;
		}
	}
});

var txtMainWindow = $('.ace_scrollbar.ace_scrollbar-v');
//实时滚动
var txtMain = txtMainWindow[0];

//编辑器空行--43行,吃掉一行，显示42行
var eidtorBlankLines = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
//增加编辑器里的空行
function addEditorBlank(text) {
	return text + eidtorBlankLines;
}

//展示到编辑器
function toEditor(text) {
	text = addEditorBlank(text.trim());
	var textDom = $('.ace_text-input');
	//赋值
	textDom.eq(0).val(text);
	textDom[0].dispatchEvent(new Event('input'));
	//texare获取焦点，使得光标隐藏
	textDom.eq(0).focus();
}

//处理接收到的数据
function dealData(data) {
	if (data.message) {
		// console.log("edit message:" + data.message);
		//是vim编辑模式则先转成Ace再转回来
		var vimSelct = $('.ace_optionsMenuEntry button[value="ace/keyboard/vim"][ace_selected_button="true"]');
		// console.log("vimSelct", vimSelct);
		if (vimSelct.length) $('.ace_optionsMenuEntry button[value="null"]').trigger("click");
		toEditor(data.message);
		if (vimSelct.length) $('.ace_optionsMenuEntry button[value="ace/keyboard/vim"]').trigger("click");
	}

	if (data.scrollTop == 0 || data.scrollTop) {
		// console.log("edit scrollTop:" + data.scrollTop, "scrollHeight:" + txtMain.scrollHeight, 
		// 	"clientHeight: " + txtMain.clientHeight);
		$(txtMain).scrollTop(data.scrollTop + 20);
		$(txtMain).scrollTop(data.scrollTop);
	}

	if (data.dealType) {
		// console.log("edit dealType:" + data.dealType);
		if ("clear" === data.dealType) refreshPage();

		if ("setSidePanel") setSidePanel();
	}
}

//监听父页面传来的消息
window.addEventListener('message', function (e) {
	// console.log("编辑页面收到了父页面发送的数据");
	dealData(e.data);
}, false);

//监听页面滚动事件
$(txtMain).on('scroll', function() {
	var data = {
		scroll: {
			"message": sessionTextLocal,
			"scrollHeight": Math.round(txtMain.scrollHeight * 100) / 100,
			"clientHeight": Math.round(txtMain.clientHeight * 100) / 100,
			"scrollTop": Math.round(txtMain.scrollTop * 100) / 100,
			"from": "txtMain"
		}
	};
	// console.log("txtMain发送scroll数据：" + data.scroll.scrollHeight, data.scroll.clientHeight);
	window.parent.postMessage(data, '*');
});

function refreshPage() {
	//清空编辑器的值
	env.editor.setValue("", -1);
}

//设置侧边栏
function setSidePanel() {
	// console.log("setSidePanel");
	//关闭侧边栏
	setTimeout(function() {
		onresize(null, true);
	}, 10);
}