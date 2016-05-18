// once the service worker is registered set the initial state  
function initialisePush() {
    // Are Notifications supported in the service worker?  
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications aren\'t supported.');
        return;
    }

    // check the current Notification permission.  
    // If its denied, it's a permanent block until the user changes the permission  
    if (Notification.permission === 'denied') {
        console.warn('The user has blocked notifications.');
        return;
    }

    // Check if push messaging is supported  
    if (!('PushManager' in window)) {
        console.warn('Push messaging isn\'t supported.');
        return;
    }

    // We need the service worker registration to check for a subscription  
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
        // Do we already have a push message subscription?  
        serviceWorkerRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                if (!subscription) {
                    return;
                }

                // chrome
                if (subscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0) {
                    var endpointParts = subscription.endpoint.split('/');
                    var registrationId = endpointParts[endpointParts.length - 1];
                    if (registrationId) {
                        // update the notification hub
                        $.ajax({
                            url: "http://progressivewebchat-signalr.localhost/notificationhub/add",
                            type: "GET",
                            data: { value: registrationId }
                        });
                    }
                } else {
                    // TODO: implentation for non-chrome devices
                }

                // Set your UI to show they have subscribed for  
                $.isPushEnabled = true;
            })
            .catch(function(err) {
                console.warn('Error during getSubscription()', err);
            });
    });
}

(function() {
    function subscribe() {
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true })
                .then(function(subscription) {
                    // the subscription was successful  
                    $.isPushEnabled = true;
                })
                .catch(function(e) {
                    if (Notification.permission === 'denied') {
                        // The user denied the notification permission which means we failed to subscribe and the user will need to manually change the notification permission to subscribe to push messages  
                        console.warn('Permission for Notifications was denied');
                        // pushButton.disabled = true;
                    } else {
                        // A problem occurred with the subscription; common reasons include network errors, and lacking gcm_sender_id and/or gcm_user_visible_only in the manifest.  
                        console.error('Unable to subscribe to push.', e);
                    }
                });
        });
    }

    function unsubscribe() {
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            // to unsubscribe from push messaging, you need get the subscription object, which you can call unsubscribe() on.  
            serviceWorkerRegistration.pushManager.getSubscription().then(
                function(pushSubscription) {
                    // check we have a subscription to unsubscribe  
                    if (!pushSubscription) {
                        // no subscription object, so set the state to allow the user to subscribe to push  
                        return;
                    }

                    // we have a subscription, so call unsubscribe on it  
                    pushSubscription.unsubscribe().then(function(successful) {}).catch(function(e) {
                        // we failed to unsubscribe, this can lead to an unusual state, so may be best to remove the users data from your data store and inform the user that you have done so
                        console.warn('Unsubscription error: ', e);
                    });
                }).catch(function(e) {
                console.error('Error thrown while unsubscribing from push messaging.', e);
            });
        });
    }

    $(function() {
        // if push is not enabled subscribe the user to push
        if ($.isPushEnabled) {
            unsubscribe();
        } else {
            subscribe();
        }

        // use a knockoutJS pub/sub to listen for requests for push notifications
        // N.B. this should be done on the server side to not expose keys and multiple requests
        $.postbox.subscribe(function() {
            navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                // retrieve the push manager subscription
                serviceWorkerRegistration.pushManager.getSubscription().then(function(subscription) {
                    // retrieve the registrationIds
                    $.ajax({
                        url: "http://progressivewebchat-signalr.localhost/notificationhub",
                        type: "GET",
                    }).then(function(response) {
                        var data = JSON.parse(response);
                        for (var i = data.length - 1; i >= 0; i--) {
                            // send the push notification to GCM
                            $.ajax({
                                type: "POST",
                                url: "https://android.googleapis.com/gcm/send",
                                contentType: 'application/json',
                                beforeSend: function(request) {
                                    request.setRequestHeader("Authorization", "key=AIzaSyAF5MPpOxHAeaFJDgzoFg6TdjNiQuiaNoY");
                                },
                                data: "{\"registration_ids\":[\"" + data[i] + "\"]}"
                            });
                        }
                    });
                });
            });

        }, $.vm, "pushNotification");
    });
})();
