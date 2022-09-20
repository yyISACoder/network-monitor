chrome.runtime.onMessage.addListener(
  (request,sender,sendResponse) => {
    if(/react-devtools/.test(JSON.stringify(request)) || !request || (request.type !== 'XHR' && request.type !== 'FETCH')) {
      return
    }
    sendResponse(JSON.stringify(request))
  }
)