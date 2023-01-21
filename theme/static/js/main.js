$(document).ready(function() {
    'use strict';
    var typed = $('.typed');

    $(function() {
        typed.typed({
            strings: [
                'Floren Munteanu.',
                'a site reliability engineer.',
                'passionate about house music.',
                'a motorcycle warrior.'
            ],
            typeSpeed: 100,
            loop: true,
        });
    });
});
