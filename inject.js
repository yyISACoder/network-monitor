(() => {
  const XHR = XMLHttpRequest.prototype
  const open = XHR.open
  const send = XHR.send
  XHR.open = function(method, url){
      this._method = method
      this._url = url
      return open.apply(this, arguments)
  }
  XHR.send = function(){
      this.addEventListener('load', function(){
        const responseHeaders = this.getAllResponseHeaders()
        const responseHeadersArr = responseHeaders.trim().split(/[\r\n]+/)
        const responseHeadersMap = {}
        const responseType = this.getResponseHeader('Content-Type')
        responseHeadersArr.forEach(line => {
          const parts = line.split(': ')
          const header = parts.shift()
          const value = parts.join(': ')
          responseHeadersMap[header] = value
        })
        const message =  {
          type: 'XHR', 
          url: this._url,
          httpCode: this.status,
          method: this._method,
          responseHeaders:responseHeadersMap,
          responseType
        }
        if(/json/.test(responseType)) {
          message.response = JSON.parse(this.response)
        }else {
          message.response = this.response
        }
        window.postMessage(message,'*')
      })
      return send.apply(this, arguments)
  }


  let origFetch = window.fetch
  window.fetch = (...args) => {
      return new Promise((resolv,reject) => {
        origFetch(...args)
        .then(res => {
          resolv(res)
          const resClone = res.clone()
          const responseHeaders = {}
          const type = resClone.headers.get('Content-Type')
          for(let [key,value] of resClone.headers.entries()){
            responseHeaders[key] = value
          }
          const message = { 
            type: 'FETCH',
            url: resClone.url,
            httpCode: resClone.status,
            method: args[1].method,
            requestHeaders: args[1].headers,
            requestBody: JSON.parse(args[1].body ? args[1].body : '{}'),
            responseHeaders: responseHeaders,
            responseType: type
          }
          if(/json/.test(type)) {
            resClone.json().then(response => {
              message.response = response
              window.postMessage(message, '*')
            })
          }else {
            resClone.text().then(response => {
              message.response = response
              window.postMessage(message, '*')
            })
          }
        }).catch(err => {
          reject(err)
        })
      })
  }
})()