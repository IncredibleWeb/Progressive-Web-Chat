(function($) {

    function ViewModel() {
        var self = this;
        self.title = ko.observable();
        self.messages = ko.observableArray([]);
    }

    // generate unique identifier
    var uid = Math.ceil(Math.random() * 100000);

    var vm = new ViewModel();
    $.extend($, {
        vm: vm,
        uid: uid
    });

    $(function() {
        FastClick.attach(document.body);
        ko.applyBindings(vm);
    });

})(jQuery);
