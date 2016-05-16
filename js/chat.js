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

    // retrieve all messages from the API
    self.get = function(params) {
        return $.ajax({
            url: "./api/get.json",
            type: "GET"
        });
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

    // return all messages from the API
    self.get = function(data) {
        return messageService.get(data).then(function(response) {
            return messageAdapter.toMessages(response);
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
    $.connection.hub.url = "//progressivewebchat-signalr.azurewebsites.net/signalr";

    // creat a function that the hub can call to broadcast messages
    $.connection.chatHub.client.broadcastMessage = function(name, message) {
        // add the received message to the view model
        $.vm.messages.push(messageAdapter.toMessage({
            name: name,
            message: message
        }));
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

    $(function() {
        // retrieve all the messages from the API
        messageController.get().then(function(response) {
            $.vm.messages(response);
        });

        deferred.then(function() {
            var $button = $(".sendMessage");
            var $message = $("#message");
            // enable the button
            $button.prop('disabled', false);
            // send the message
            $button.on("click", function(event) {
                event.preventDefault();
                // send the message to the server
                $.connection.chatHub.server.send($.uid, $message.val());
                // clear the field
                $message.val("");
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
