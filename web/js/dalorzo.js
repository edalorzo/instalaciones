(function() {
    "use strict";

    var dalorzo = angular.module('dalorzo',['ui.bootstrap']);

    dalorzo.controller('MainCtrl', ['$scope','$http', function($scope, $http){
        $scope.sending = false;

        $scope.contact = {
            name:'',
            phone:'',
            email:'',
            message:''
        };

        $scope.sendEmail = function(valid){

            if(valid){
                var message = {
                    name: $scope.contact.name,
                    from: $scope.contact.email || 'ventas@dalorzo.com',
                    message: $scope.contact.message,
                    phone: $scope.contact.phone
                };
                $scope.sending = true;
                var promise = $http.post('/mail',message);
                promise.success(function(){
                    $scope.sending = false;
                    $scope['contactForm'].$setPristine();
                    alertify.alert(message.name.split(' ')[0] + ", hemos recibido su mensaje y muy pronto nos pondremos en contacto por teléfono o por correo electrónico. ¡Muchas gracias!");
                    $scope.contact = {
                        name:'',
                        phone:'',
                        email:'',
                        message:''
                    };
                });
                promise.error(function(error){
                    $scope.sending = false;
                    alertify.alert(message.name.split(' ')[0] + ", estamos experimentando problemas para enviar su correo en este momento. ¿Podría intentarlo de nuevo? O, si lo prefieres, puede escribirnos directamente a <a href='mailto:ventas@dalorzo.com'>ventas@dalorzo.com</a>.");
                    console.log(error);
                });
            } else {
                $scope['contactForm'].$setDirty();
            }
        };
    }]);

    dalorzo.controller('RoofGalleryCtrl',['$scope',function($scope){

        $scope.myInterval = 5000;
        $scope.slides = [];
        for(var i = 1; i <= 40; i++){
            var url = (i < 10 ? "img/gallery/roof/0" : "img/gallery/roof/") + i + ".jpg";
            $scope.slides.push({image: url});
        }

    }]);

})();
