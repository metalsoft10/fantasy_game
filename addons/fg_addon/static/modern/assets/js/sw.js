'use strict';
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('push', function(event) {
  // console.log('[Service Worker] Push Received.');
  // console.log(event);

  var msg_data = JSON.parse(event.data.text());
  // var msg_data = JSON.parse(JSON.stringify(event.data.text()))
  // console.log(msg_data);
  const title = msg_data.title;
  const options = {
    body: msg_data.msg,
    icon: '/web/image/res.company/1/logo',
    badge: '/web/image/res.company/1/logo',
    tag:'/web/image/res.company/1/logo',
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 400,400, 300, 100, 400,400, 100, 300],
    image:'https://icon-library.com/images/icon-travel/icon-travel-11.jpg',
    data: {
      time: new Date(Date.now()).toString(),
      message: msg_data.msg,
      url:msg_data.url
    },
	
  };
  self.registration.showNotification(title, options);
  event.waitUntil(self.skipWaiting());
 
});

self.addEventListener('notificationclick', function(event) {
  

  event.notification.close();
  
  clients.openWindow(event.notification.data.url)

  
});

self.addEventListener('pushsubscriptionchange', function(event) {
  const applicationServerPublicKey = localStorage.getItem('applicationServerPublicKey');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(newSubscription) {
      
    })
  );
});