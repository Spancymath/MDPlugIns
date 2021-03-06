/**
 * 和pop页进行通信，并同步内容
 */
//编辑页面文本框id
const EDIT_TEXTAREA_ID = "md-editor";

//嵌入页面的页面编辑器id
const NEST_PAGE_MD_ID = "nestMDDiv";

//给pop页面用
try {
	//监听popup消息
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse){
			if (request.type == "blogEditorPage") {
				//没有隐藏页面编辑器时，不允许打开popup版本
				if (!$("#" + NEST_PAGE_MD_ID).is(":hidden")) {
					console.log("make nest page MD hidden");
					$("#coloseDiv").trigger("click");
				}
				//告诉popup页是编辑页面
				sendResponse({res: true});
			} else if (request.type == "sendContenText") {
				//给页面编辑器赋值, 并触发change/blur事件
				$('#' + EDIT_TEXTAREA_ID).val(request.message);
				$('#' + EDIT_TEXTAREA_ID).text(request.message);
				$("#" + EDIT_TEXTAREA_ID)[0].dispatchEvent(new Event('change'));
				$("#" + EDIT_TEXTAREA_ID)[0].dispatchEvent(new Event('blur'));
				sendResponse({res: 'success'});
			} else if (request.type == "getContenText") {
				//返回页面内容
				var contentText = $('#' + EDIT_TEXTAREA_ID).val();
				sendResponse({res: contentText});
			}
			return true;
		}
	);	
} catch (e) {
	console.log('connection error');
}