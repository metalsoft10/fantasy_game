
'use strict';

$( "body" ).append( `<div id='push_message_box' style='float: right;position: fixed;right: 16px;border-radius: 12px;top: 70px;z-index: 999;'> <div class="box_alert_container">
<div class="alert alert-success alert-dismissible alert-additional fade show" role="alert">
    <div class="alert-body">
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        <div class="d-flex">
            <div class="flex-shrink-0 me-3">
                <i class="ri-notification-off-line fs-16 align-middle"></i>
            </div>
            <div class="flex-grow-1">
                <h5 class="alert-heading">Allow Notification  Is  Required</h5>
                <p class="mb-0">To enjoy the best features in the app, please enable notifications.</p>
            </div>
        </div>
    </div>
    <div class="alert-content">
       
       <p><code class='js-subscription-json'></code></p> <br/> 
       <div class='js-subscription-details'/> 
	   <div class="row g-3 mt-3">
		    <div class="hstack gap-2">
				<div class="col-12">
					<button class='js-push-btn  btn btn-light bg-gradient waves-effect waves-light' style="width: -webkit-fill-available;">button</button> 
				</div>
				
			</div>
	    </div>	   
	   
    </div>
</div>

</div> </div>`  );

//<div class="col-lg-6">
//<button type='submit' style="width: -webkit-fill-available;" class='btn btn-light bg-gradient waves-effect waves-light mdl-button mdl-js-button mdl-button--raised mdl-button--colored'  onClick='push_message()'>Test Push Notification</button>
//</div>
// <button type='submit' className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'  onClick='push_message()'>Test Push Notification</button>
const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
$('#push_message_box').hide()
let swRegistration = null;

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

function updateBtn() {
	if (Notification.permission === 'denied') {
		pushButton.textContent = 'Push Messaging Blocked.';
		pushButton.disabled = true;
		updateSubscriptionOnServer(null);
		return;
	}

	if (isSubscribed) {
		pushButton.textContent = 'Disable Push Messaging';
        $('#push_message_box').hide()
	} else {

		pushButton.textContent = 'Enable Push Messaging';
		$('#push_message_box').show()
	}

	pushButton.disabled = false;
}

function updateSubscriptionOnServer(subscription) {
	// TODO: Send subscription to application server

	const subscriptionJson = document.querySelector('.js-subscription-json');
	const subscriptionDetails = document.querySelector('.js-subscription-details');

	if (subscription) {
		subscriptionJson.textContent = JSON.stringify(subscription);
		$.ajax({
				type: "POST",
				url: "/push_key_save",
				contentType: 'application/json; charset=utf-8',
				dataType:'json',
				data: JSON.stringify({'sub_token':subscription}),
				success: function( data ){

			},
			error: function( jqXhr, textStatus, errorThrown ){
				console.log("error",errorThrown);
			}
			});
		subscriptionDetails.classList.remove('is-invisible');
	} else {
		subscriptionDetails.classList.add('is-invisible');
	}
}

function subscribeUser() {
	const applicationServerPublicKey = localStorage.getItem('applicationServerPublicKey');
	const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
	swRegistration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: applicationServerKey
		})
		.then(function(subscription) {

			updateSubscriptionOnServer(subscription);
			localStorage.setItem('sub_token',JSON.stringify(subscription));



			$.ajax({
				type: "POST",
				url: "/push_key_save",
				contentType: 'application/json; charset=utf-8',
				dataType:'json',
				data: JSON.stringify({'sub_token':subscription}),
				success: function( data ){

			},
			error: function( jqXhr, textStatus, errorThrown ){
				console.log("error",errorThrown);
			}
			});



			isSubscribed = true;

			updateBtn();
		})
		.catch(function(err) {
			console.log('Failed to subscribe the user: ', err);
			updateBtn();
		});
}

function unsubscribeUser() {
	swRegistration.pushManager.getSubscription()
		.then(function(subscription) {
			if (subscription) {
				return subscription.unsubscribe();
			}
		})
		.catch(function(error) {
			console.log('Error unsubscribing', error);
		})
		.then(function() {
			updateSubscriptionOnServer(null);


			isSubscribed = false;

			updateBtn();
		});
}

function initializeUI() {
	pushButton.addEventListener('click', function() {
		pushButton.disabled = true;
		if (isSubscribed) {
			unsubscribeUser();
		} else {
			subscribeUser();
		}
	});

	// Set the initial subscription value
	swRegistration.pushManager.getSubscription()
		.then(function(subscription) {
			isSubscribed = !(subscription === null);

			updateSubscriptionOnServer(subscription);

			if (isSubscribed) {

			} else {
				$('#push_message_box').show()
				console.log('User is NOT subscribed.');
			}

			updateBtn();
		});
}

if ('serviceWorker' in navigator && 'PushManager' in window) {


	navigator.serviceWorker.register("/medical_base/static/modern/assets/js/sw.js?"+Date.now())
		.then(function(swReg) {

			swRegistration = swReg;
			initializeUI();
		})
		.catch(function(error) {
			console.error('Service Worker Error', error);
		});
} else {
	console.warn('Push meapplicationServerPublicKeyssaging is not supported');
	pushButton.textContent = 'Push Not Supported';
}

function push_message() {

	$.ajax({
		type: "POST",
		url: "/push_v1/",
		contentType: 'application/json; charset=utf-8',
		dataType:'json',
		data: JSON.stringify({'sub_token':localStorage.getItem('sub_token')}),
		success: function( data ){

    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log("error",errorThrown);
    }
	});
}
function push_notification_message(data) {
	var formData = new FormData()
    formData.append('title', data.title)
    formData.append('message', data.message)
    formData.append('url', data.url)
    formData.append('private_user', JSON.stringify(data.private_user))
    
	$.ajax({
		type: "POST",
		url: "/ajax/push_notification_message",
		contentType: 'application/json; charset=utf-8',
		dataType:'json',
		processData: false,
        contentType: false,
		data: formData,
			success: function( res ){
				console.log(res)

		},
		error: function( jqXhr, textStatus, errorThrown ){
			console.log("error",errorThrown);
		}
	});
	
}

$(document).ready(function(){
	$.ajax({
		type:"GET",
		url:'/subscription/',
		success:function(response){

			localStorage.setItem('applicationServerPublicKey',response.public_key);
		}
	})
});