// لازم يكون الـ SW مسجل كـ module
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-sw.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLOUiW3M9WFQsrgSYq5JTURrC3UtvWMxc",
  authDomain: "notify-ac6d4.firebaseapp.com",
  projectId: "notify-ac6d4",
  storageBucket: "notify-ac6d4.appspot.com",
  messagingSenderId: "716536852376",
  appId: "1:716536852376:web:a8243f1bc1e4f2fe4605ed"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("📩 Background message:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
