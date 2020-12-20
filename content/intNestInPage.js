/**
 * 嵌入页面的编辑器
 */

//页面上的编辑器选择标签
const EDIT_TOOL_CHOOSE_LABEL = "cnb-post-body-editor-switcher";
//编辑器按钮图片地址
const MD_PLUGIN_PIC = "https://images.cnblogs.com/cnblogs_com/so-easy/1609140/t_201219081322md.png";
//页面markdown模式显示元素
const MARKDOWN_SWITCH = "editor-switcher";
//页面编辑器选择菜单
const EDITOR_MENU = "dropdown-menu";

console.log("nestInPage in");

//待页面加载，再初始化编辑器
setTimeout(function() {
	//是否用markdown编辑器模式
	let isMarkdownMode = $("#" + MARKDOWN_SWITCH).text().indexOf("markdown") != -1;
	if (!isMarkdownMode) {console.log("不是markdown模式"); return;}

	//博客园自带编辑器更换触发事件
	$("#" + EDITOR_MENU).click(function() {
		console.log("editor change");
		$("#md_plugin_div").remove();
	});

	init();
}, 500);

//在页面添加编辑器触发按钮
function init() {	
	//注入js
	injectJs(["jquery-3.3.1.min.js", "content/nest/nest.js"]);
	//注入css
	var cssHref = chrome.runtime.getURL("content/nest/nest.css");
	// console.log(cssHref);
	var css = "<link rel='stylesheet'  type='text/css' href='" + cssHref + "'></link>"
	$('head').append(css);
	//注入编辑器页面
	var htmlFile = chrome.runtime.getURL("content/nest/nest.html");
	// console.log(htmlFile);
	var html = "<div id='nestMDDiv'></div>";
	$('body').append(html);
	$.get(htmlFile,function(data){
	     $("#nestMDDiv").html(data);
	});

	//编辑器加载完成前显示加载中
	var loadingDiv = "<div class='loadEffect'>" +
		"<span></span><span></span><span></span><span></span><span></span><span></span><span></span>" +
		"<span></span></div>";

	//编辑器按钮
	var editPicHtml = "<span id='md_plugin_div' onclick='popEditClick()' style='width:20px;display:none;'>" +
		// "onmouseover='this.style.cursor=&quot;hand&quot;' onmouseout='this.style.cursor=&quot;normal&quot;'>" +
		"<a href='javascript:;'><img style='width:100%;' src='" + MD_PLUGIN_PIC + "'></a></span>";
	//插入编辑器触发按钮
	$(EDIT_TOOL_CHOOSE_LABEL).before(loadingDiv + editPicHtml);
}

//注入js
function injectJs(jsFiles) {
	$.each(jsFiles, function(index, value){
		var jsSrc = chrome.runtime.getURL(value);
		// console.log(jsSrc);
		var script = "<script src='" + jsSrc + "'></script>"
		$('head').append(script);
	});
}