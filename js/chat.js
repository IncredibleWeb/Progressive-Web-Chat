(function() {
    // constants
    var objectStoreName = "messages";
    var request = window.indexedDB.open("Chat", 2);

    // if the local db is older or not yet initialised
    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        // create an object store called "names" with the autoIncrement flag set as true.    
        var objStore = db.createObjectStore(objectStoreName, { autoIncrement: true });
    };

    // view models
    function MessageViewModel() {
        var self = this;
        self.name = "";
        self.message = "";

        self.sender = ko.pureComputed(function() {
            return self.name === $.uid.toString() ? "send" : "recieve";
        }, self);
    }

    // services
    function MessageService() {
        var self = this;

        // retrieve all messages from the DB
        self.get = function() {
            // create a deferred object
            var deferred = $.Deferred();
            // create a transaction for the indexedDB
            var transaction = request.result.transaction([objectStoreName]);

            // retrieve the object store
            var objectStore = transaction.objectStore(objectStoreName);

            // request all data from the store
            var response = objectStore.getAll();

            response.onerror = function(event) {
                console.warn("Error reading from IndexedDB");
                deferred.resolve(null);
            };

            response.onsuccess = function(event) {
                console.log(response.result);
                if (response.result && response.result.length) {
                    deferred.resolve(response.result);
                }
                deferred.resolve();
            };

            return deferred;
        };

        self.add = function(data) {
            // create a deferred object
            var deferred = $.Deferred();
            // create a transaction for the indexedDB
            var transaction = request.result.transaction([objectStoreName], "readwrite");

            transaction.oncomplete = function(event) {
                console.log("Added", data);
                deferred.resolve(true);
            };

            transaction.onerror = function(event) {
                console.warn("Error adding", data);
                deferred.resolve(false);
            };

            // execute the transaction
            var objectStore = transaction.objectStore(objectStoreName);
            var response = objectStore.add(data);
            response.onsuccess = function(event) {
                // do nothing
            };
            return deferred;
        };
    }

    function MessageAdapter() {
        var self = this;

        // map the server response to the client side view model
        self.toMessage = function(data) {
            var messageViewModel = new MessageViewModel();
            messageViewModel.name = data.name;
            messageViewModel.message = data.message;
            return messageViewModel;
        };

        // map the server response to the client side view model
        self.toMessages = function(data) {
            if (data && data.length > 0) {
                return _.map(data, function(item) {
                    return self.toMessage(item);
                });
            }
            return [];
        };
    }

    function MessageController(messageService, messageAdapter) {
        var self = this;

        // return all messages from the DB
        self.get = function(data) {
            return messageService.get(data).then(function(response) {
                return messageAdapter.toMessages(response);
            });
        };

        // add a message to the data store
        self.add = function(data) {
            return messageService.add(data).then(function(response) {
                return response;
            });
        };
    }

    (function($) {
        // initialize the services and adapters
        var messageService = new MessageService();
        var messageAdapter = new MessageAdapter();

        // initialize the controller
        var messageController = new MessageController(messageService, messageAdapter);

        // hub is remote
        $.connection.hub.url = "//progressivewebchat-signalr.localhost/signalr";

        // if connected to the signalR hub
        if ($.connection.chatHub) {
            // create a function that the hub can call to broadcast messages
            $.connection.chatHub.client.broadcastMessage = function(name, message) {
                // add the received message to the view model
                $.vm.messages.push(messageAdapter.toMessage({
                    name: name,
                    message: message
                }));
                // update the database
                messageController.add({
                    name: name,
                    message: message
                });
                // scroll down
                $("html, body").animate({ scrollTop: $(document).height() }, "fast");
            };

            // create a deferred object
            var deferred = $.Deferred();

            // initialize the connection with the hub
            $.connection.hub.start().done(function() {
                // notify that the hub connection has started
                deferred.resolve();
            });
        }


        $(function() {
            request.onsuccess = function() {
                // retrieve all the messages from the DB
                messageController.get().then(function(response) {
                    $.vm.messages(response);
                    // scroll down
                    $("html, body").scrollTop($(document).height());
                });
            };

            // enable the button only if successfully connected to the hub
            deferred.then(function() {
                var $button = $(".sendMessage");
                var $message = $("#message");
                // enable the button
                $button.prop('disabled', false);
                // send the message
                $button.on("click", function(event) {
                    event.preventDefault();
                    if ($message.val().length > 0) {
                        // send the message to the server
                        $.connection.chatHub.server.send($.uid, $message.val());
                        // send push notification
                        $.postbox.notifySubscribers($message.val(), "pushNotification");
                        // clear the field
                        $message.val("");
                    }
                });

                // user presses enter
                $message.on("keydown", function(event) {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                        $button.click();
                    }
                });
            });
        });
    })(jQuery);
})();
