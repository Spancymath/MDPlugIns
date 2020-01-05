require("kitchen-sink/demo");
//判断页面加载完成
var loaded = false;

var sessionTextLocal = ""; 

//页面初始化
function onload() {
	//console.log('editor');
	//默认自动换行显示
	$('.ace_optionsMenuEntry').find("button[value='free']").click();
	//默认markdown模式不可修改
	$('.ace_optionsMenuEntry #-doc').val("Markdown");
	$('.ace_optionsMenuEntry #-doc')[0].dispatchEvent(new Event('change'));
	//todo 不生效，有高手可以搞搞
	$('.ace_optionsMenuEntry #-doc').attr('disabled', "disabled");
	$('.ace_optionsMenuEntry #-mode').attr('disabled', "disabled");
	//关闭侧边栏
	onresize(null, true);
	loaded = true;
}

window.addEventListener("load", onload);

//输入后输出内容到父窗口
$(".ace_content").bind('DOMNodeInserted', function(e) {
	var linesText = "";
	// var lineDiv = $('.ace_line')
	// for (var i = 0; i < lineDiv.length; i++) {
	// 	linesText += (lineDiv.eq(i).text() + "\n");
	// }
	//linesText = $('.ace_text-input').eq(0).val();
	if (loaded) {
		linesText = env.editor.session.getValue();
		if (linesText != sessionTextLocal) {
			parent.toShow(linesText);
			sessionTextLocal = linesText;
		}
	}
   	//console.log(linesText);
});