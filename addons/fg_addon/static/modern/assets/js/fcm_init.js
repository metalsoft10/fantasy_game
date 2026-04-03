
// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCLOUiW3M9WFQsrgSYq5JTURrC3UtvWMxc",
  authDomain: "notify-ac6d4.firebaseapp.com",
  projectId: "notify-ac6d4",
  storageBucket: "notify-ac6d4.appspot.com",
  messagingSenderId: "716536852376",
  appId: "1:716536852376:web:a8243f1bc1e4f2fe4605ed"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request Permission + Get Token
async function requestPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    

    try {
        const registration = await navigator.serviceWorker.register('/fg_addon/static/modern/assets/js/firebase-messaging-sw.js?ver='+Date.now(),{ type: "module" } );
        

        const token = await getToken(messaging, {
            vapidKey: "BDq4-cpH2hQEG9Q8IXlRjEVXD56vOju83YHfIl8T9JEY-zhwJ5OB8jQMvYu3bYD1tfTyIj6CmGN32Vh5Yug_YzI",
            serviceWorkerRegistration: registration
        });
        var formData = new FormData()
        formData.append('sub_token',token);

        
      //   $.ajax({
      //           type: "POST",
      //           url: "/push_key_save",
      //           data: formData,
      //           dataType: 'json',
      //           processData: false,
      //           contentType: false,
      //           success: function( data ){

      //           },
      //           error: function( jqXhr, textStatus, errorThrown ){
      //               console.log("error",errorThrown);
      //           }
	    // });


    } catch (err) {
      console.error("FCM Error:", err);
    }

  } else {
    console.log("❌ Permission denied.");
  }
}

requestPermission();

// On Message when page is open
onMessage(messaging, (payload) => {
    var _icon = "/web/image/res.company/1/logo"
    if(payload.data.icon){
        _icon = payload.data.icon
    }
    
    new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: _icon,
    });
});
