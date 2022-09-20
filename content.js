// inject injected script
const s = document.createElement('script')
s.src = chrome.runtime.getURL('inject.js')
s.onload = () => {
  this.remove()
}
document.documentElement.appendChild(s)
 
// receive message from injected script
window.addEventListener('message', e => {
  chrome.runtime.sendMessage(e.data, response => {
    if(response) {
      console.log('gui-network-monitor:',JSON.parse(response))
    }
  })
})