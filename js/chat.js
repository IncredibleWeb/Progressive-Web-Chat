// view models
function MessageViewModel() {
    var self = this;
    self.sender = "";
    self.message = "";

    self.senderClass = ko.pureComputed(function() {
    	return this.sender === "me" ? "send" : "recieve";
    }, self);
}

// services
function MessageService() {
    var self = this;

    // send a message to the API
    self.send = function(params) {
        return $.ajax({
            url: "/api/send.json",
            type: "POST",
            data: {
                message: params.message
            }
        });
    };

    // retrieve all messages from the API
    self.get = function(params) {
        return $.ajax({
            url: "/api/get.json",
            type: "GET"
        });
    };
}

function MessageAdapter() {
    var self = this;

    // map the server response to the client side view model
    self.toMessages = function(data) {
        if (data && data.length > 0) {
            return _.map(data, function(item) {
                var messageViewModel = new MessageViewModel();
                messageViewModel.sender = item.sender;
                messageViewModel.message = item.message;
                return messageViewModel;
            });
        }
        return [];
    };
}

function MessageController(messageService, messageAdapter) {
    var self = this;

    // return true if message is sent successfully
    self.send = function(data) {
        return messageService.send(data).then(function(response) {
            return response.isSuccess;
        });
    };

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

    $(function() {
        // retrieve all the messages from the API
        messageController.get().then(function(response) {
            $.vm.messages(response);
        });
    });
})(jQuery);
