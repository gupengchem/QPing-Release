/* -------------------- Check Browser --------------------- */
"use strict";
function browser() {
    let isOpera = (window.opera && window.opera.version);  // Opera 8.0+
    let isFirefox = testCSS('MozBoxSizing');                 // FF 0.8+
    let isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    let isChrome = !isSafari && testCSS('WebkitTransform');  // Chrome 1+
    //let isIE = /*@cc_on!@*/false || testCSS('msTransform');  // At least IE6
    function testCSS(prop) {
        return prop in document.documentElement.style;
    }
    if (isOpera) {
        return false;
    } else return !!(isSafari || isChrome);
}

jQuery(document).ready(function ($) {
    /* ---------- Remove elements in IE8 ---------- */
    if (jQuery.browser.version.substring(0, 2) === "8.") {
        $('.hideInIE8').remove();
    }
});
/* ---------- Check Retina ---------- */
function retina() {
    return (window.devicePixelRatio > 1);
}

jQuery(document).ready(function ($) {
    /* ---------- Add class .active to current link  ---------- */
    $('ul.main-menu li a').each(function () {
        let c = String(window.location);
        if(c.indexOf('create')> 0){
            $("#_newTaskMenu_").addClass('active');
        } else if ($($(this))[0].href === c) {
            $(this).parent().addClass('active');
        }
    });

    $('ul.main-menu li ul li a').each(function () {
        if ($($(this))[0].href === String(window.location)) {
            $(this).parent().addClass('active');
            $(this).parent().parent().show();
        }
    });
    /* ---------- Submenu  ---------- */
    $('.dropmenu').click(function (e) {
        e.preventDefault();
        $(this).parent().find('ul').slideToggle();
    });
});


/* ---------- Main Menu Open/Close ---------- */
jQuery(document).ready(function ($) {
    $('#main-menu-toggle').click(function () {
        if ($(this).hasClass('open')) {
            $(this).removeClass('open').addClass('close');
            let span = $('#content').attr('class');
            let spanNum = parseInt(span.replace(/^\D+/g, ''));
            let newSpanNum = spanNum + 2;
            let newSpan = 'span' + newSpanNum;
            $('#content').addClass('full');
            $('.navbar-brand').addClass('noBg');
            $('#sidebar-left').hide();
        } else {
            $(this).removeClass('close').addClass('open');
            let span = $('#content').attr('class');
            let spanNum = parseInt(span.replace(/^\D+/g, ''));
            let newSpanNum = spanNum - 2;
            let newSpan = 'span' + newSpanNum;
            $('#content').removeClass('full');
            $('.navbar-brand').removeClass('noBg');
            $('#sidebar-left').show();
        }
    });
});

$(document).ready(function () {
    widthFunctions();
});

/* ---------- Page width functions ---------- */
$(window).bind("resize", widthFunctions);
function widthFunctions(e) {
    let sidebarLeftHeight = $('#sidebar-left').outerHeight();
    let contentHeight = $('#content').height();
    let contentHeightOuter = $('#content').outerHeight();

    let headerHeight = $('header').height();
    let footerHeight = $('footer').height();
    let winHeight = $(window).height();
    let winWidth = $(window).width();
    if (winWidth > 767) {
        if (winHeight - 80 > sidebarLeftHeight) {
            $('#sidebar-left').css('min-height', winHeight - headerHeight - footerHeight);
        }
        if (winHeight - 80 > contentHeight) {
            $('#content').css('min-height', winHeight - headerHeight - footerHeight);
        }
        $('#white-area').css('height', contentHeightOuter);
    } else {
        $('#sidebar-left').css('min-height', '0px');
        $('#white-area').css('height', 'auto');
    }
}