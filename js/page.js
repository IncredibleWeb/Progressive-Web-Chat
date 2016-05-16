(function($) {

    function ViewModel() {
        var self = this;
        self.title = ko.observable();
        self.messages = ko.observable([]);
    }

    var vm = new ViewModel();
    $.extend($, {
        vm: vm,
    });

    $(function() {
        FastClick.attach(document.body);
    });

})(jQuery);
