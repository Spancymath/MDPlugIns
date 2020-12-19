//编辑页面文本框id
const EDIT_TEXTAREA_ID = "md-editor";

try {
	//监听popup消息
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse){
			if (request.type == "blogEditorPage") {
				//告诉popup页是编辑页面
				sendResponse({res: true});
			} else if (request.type == "sendContenText") {
				//给页面编辑器赋值
				$('#' + EDIT_TEXTAREA_ID).val(request.message);
				$('#' + EDIT_TEXTAREA_ID).text(request.message);
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
// 
// chrome.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener((msg) => {
//     if (msg.function == 'blogEditorPage') {
//       port.postMessage({ res: true});
//     }
//   });
// });