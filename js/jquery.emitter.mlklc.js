/*
    // V0.7 - jQuery emitter factory of CSS3 sprites with transitions
    // MIT License - @molokoloco 28/10/2011 - http://b2bweb.fr
    // Infos      : http://goo.gl/P18db
    // Plain demo : http://www.b2bweb.fr/framework/jquery.emitter/jquery.emitter.html
    // Cloud9ide  : http://cloud9ide.com/molokoloco/jquery_emitter
    // Live demo  : http://jsfiddle.net/molokoloco/aqfsC/
    // Sources    : https://github.com/molokoloco/jquery.emitter
	// Download   : http://www.b2bweb.fr/framework/jquery.emitter/jquery.emitter.zip

    // Minimalist settings, see explanations in sources comments
    // Ex. :

    $emitter1 = $('div#emitterZone1').emitter({
        effect     : 'nebula',
        transition : 'all 3000ms cubic-bezier(.2, .1, .9, 0)',
        cssFrom    : {
            width            : 25,
            backgroundColor  : 'rgba(255, 255, 0, 1)',
            boxShadow        : '0 0 10px rgba(0,0,0,1)',
        },
        cssTo      : {
            opacity          : 0
        }
    });
    $('a#stop').click(function() { $emitter1.trigger('stop'); });


    // Further reading :
    // https://github.com/benbarnett/jQuery-Animate-Enhanced
    // https://gist.github.com/984039
*/


;var db = function() { 'console' in window && console.log.call(console, arguments); }; // Debuging tool

(function ($, window) {

    // Cross-browsers requestAnimationFrame
    window.requestAnimFrame = (function() {
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                  window.setTimeout(callback, 1000 / 60);
              };
      })();

    ///////////////////////////////////////////////////////////////////////////////
    // Somes utilities, setted as public through the jQuery obj

    // Generate random numbers...
    $.getRand = function(miin, maax) {
        return parseInt(miin + (Math.random() * (maax - miin)), 10);
    };

    // Convert % to px, in float value
    $.getSize = function(size, ratioWidth) {
        if (size && /\%/.test(size))
            size = (parseFloat(size) / 100) * ratioWidth;
        return parseFloat(size);
    };

    // Penner equation approximations from Matthew Lein's Ceaser: http://matthewlein.com/ceaser/
    // Remixed for this use : "transition:'all 3000ms '+$.cubicBeziers.easeInOutQuad;"
    // Some value outside range 0>=X=<1 are buged in  chrome for example
    var bezierOpen = 'cubic-bezier(', bezierClose = ')';
    $.cubicBeziers = {
        bounce:         bezierOpen+'0.000,0.350,0.500,1.300'+bezierClose, // !
        easeInQuad:     bezierOpen+'0.550,0.085,0.680,0.530'+bezierClose,
        easeInCubic:    bezierOpen+'0.550,0.055,0.675,0.190'+bezierClose,
        easeInQuart:    bezierOpen+'0.895,0.030,0.685,0.220'+bezierClose,
        easeInQuint:    bezierOpen+'0.755,0.050,0.855,0.060'+bezierClose,
        easeInSine:     bezierOpen+'0.470,0.000,0.745,0.715'+bezierClose,
        easeInExpo:     bezierOpen+'0.950,0.050,0.795,0.035'+bezierClose,
        easeInCirc:     bezierOpen+'0.600,0.040,0.980,0.335'+bezierClose,
        easeOutQuad:    bezierOpen+'0.250,0.460,0.450,0.940'+bezierClose,
        easeOutCubic:   bezierOpen+'0.215,0.610,0.355,1.000'+bezierClose,
        easeOutQuart:   bezierOpen+'0.165,0.840,0.440,1.000'+bezierClose,
        easeOutQuint:   bezierOpen+'0.230,1.000,0.320,1.000'+bezierClose,
        easeOutSine:    bezierOpen+'0.390,0.575,0.565,1.000'+bezierClose,
        easeOutExpo:    bezierOpen+'0.190,1.000,0.220,1.000'+bezierClose,
        easeOutCirc:    bezierOpen+'0.075,0.820,0.165,1.000'+bezierClose,
        easeInOutQuad:  bezierOpen+'0.455,0.030,0.515,0.955'+bezierClose,
        easeInOutCubic: bezierOpen+'0.645,0.045,0.355,1.000'+bezierClose,
        easeInOutQuart: bezierOpen+'0.770,0.000,0.175,1.000'+bezierClose,
        easeInOutQuint: bezierOpen+'0.860,0.000,0.070,1.000'+bezierClose,
        easeInOutSine:  bezierOpen+'0.445,0.050,0.550,0.950'+bezierClose,
        easeInOutExpo:  bezierOpen+'1.000,0.000,0.000,1.000'+bezierClose,
        easeInOutCirc:  bezierOpen+'0.785,0.135,0.150,0.860'+bezierClose
    };

    // Inspired by my old work here http://goo.gl/hL3om
    $.browserPrefix = (function() { // Closure for putting result in cache
        var userAgentStr = navigator.userAgent.toLowerCase();
        var browsers = { // Various CSS prefix for browsers...
            firefox     :'moz',
            applewebkit :'webkit',
            webkit      :'webkit',
            opera       :'o',
            msie        :'ms'
        };
        for (var prefix in browsers)
            if (userAgentStr.indexOf(prefix) !== -1)
                return browsers[prefix];
        return false;
    })();

    // Cf Modernizr doc // "Static" fct
    $.transitionEnd = (function(Modernizr) { // Todo : add support for animationstart, animationend, animationiteration
        var eventEnd = {
            'WebkitTransition' :'webkitTransitionEnd',
            'MozTransition'    :'transitionend',
            'OTransition'      :'oTransitionEnd',
            'msTransition'     :'msTransitionEnd',
            'transition'       :'transitionEnd'
        };
        return eventEnd[Modernizr.prefixed('transition')];

    })(Modernizr);


    ///////////////////////////////////////////////////////////////////////////////
    // Somes jQuery plugins, enhancing some DOM element manipulations

    // Fix and apply styles on element with correct browsers prefix
    // $(e).crossCss({borderRadius:'10px'}) >>> $(e).css({WebkitBorderRadius:'10px'})
    // Use Modernizer : https://github.com/Modernizr/Modernizr/blob/master/modernizr.js
    // Modernizr.prefixed("borderRadius"); // e.g FF3.6 'MozBorderRadius', FF4 'borderRadius'
    $.fn.crossCss = function(css) {
        return this.each(function() {
            var $this = $(this);
            if (typeof css != 'object') return $this;
            for (var p in css)
                if (Modernizr.prefixed(p))
                    css[Modernizr.prefixed(p)] = css[p]; // Add prefix
            return $this.css(css);
         });
    };


    ///////////////////////////////////////////////////////////////////////////////
    // Emitter jQuery plugin
    // EXTEND JQUERY functions on "element"
    $.fn.emitter = function(options) {

        var _db_ = false; // Activate debug log ?

        if (typeof(Modernizr) != 'object') alert('$.fn.emitter require "modernizr(.min).js"');

        // Deep merge options with defaut (ex. options.cssFrom.width)
        // jQuery.extend([deep], target, object1 [, objectN])
        options = $.extend(true, {}, $.fn.emitter.options, options);
        if (_db_) db('Init $.fn.emitter()', options); // Debug with console.log

        return this.each(function() {

            var $canvas    = $(this),       // This is the element for witch the plugin apply
                E          = {},            // Emitter properties
                S          = {};            // Sprites properties

            E.render       = true;          // Continuous requestAnimation ?
            E.timer        = null;          // setInterval ?
            E.name         = 'emitter'+Date.now(); // Emitter element unique ID in window namespace

            window[E.name] = [];            // Stock all sprites $element

            var publicMethods = {
                start:function() {
                     if (_db_) db('start()');
                     setTimeout(function() { // Be sure all dom manip is over...
                         privateMethods.fixDefaultSizes();
                         E.render = true;
                         publicMethods.newSprite();        // Call factory
                     }, 0);
                },
                // Call it to emit one sprite at a time (must stop it before)
                newSprite:function() {
                    if (_db_) db('newSprite()');
                    addSprite();             // Call factory
                },
                stop:function() {
                    if (_db_) db('stop()');
                    E.render = false;        // if requestAnimFrame
                    if (E.timer) clearTimeout(E.timer); // if setTimeout Kill factory
                    E.timer = null;
                },
                // Stop & clear elements stack
                reset:function() {
                    if (_db_) db('reset()');
                    publicMethods.stop();
                    for (var i in window[E.name]) {
                        if (window[E.name][i] && window[E.name][i].length > 0) {
                            window[E.name][i].empty().remove(); // Clean DOM
                        }
                        delete window[E.name][i]; // Clean Obj
                    }
                    window[E.name] = [];
                },
                // Update partiales values while processing sprite
                update:function(event, newOptions) { // $emitter1.trigger('update', [{prop:val,...}]);
                    if (_db_) db('update()', newOptions);
                    // Deep merge options with current (ex. options.cssFrom)
                    // if incomplete new sub-array : keep default
                    options = $.extend(true, {}, options, newOptions);
                    privateMethods.fixDefaultSizes();
                },
                // Regenedelay emitter : update ALL values
                setOptions:function(event, newOptions) { // $emitter1.trigger('update', [{prop:val,...}]);
                    if (_db_) db('setOptions()', newOptions);
                    publicMethods.reset(); // If sprite HTML is modified, must clear old ones
                    options = $.extend(true, {}, $.fn.emitter.options, newOptions);
                    publicMethods.start();
                }
            };

            var privateMethods = {
                fixDefaultSizes: function() { // Clean configurable values
                    if (_db_) db('fixDefaultSizes()');

                    E.canvasW = parseInt($canvas.width(), 10);
                    E.canvasH = parseInt($canvas.height(), 10);

                    if (!options.cssFrom.width && options.cssFrom.width !== 0) {
                        db('Config. error, need at least options.cssFrom.width to be setted');
                        options.cssFrom.width = options.cssFrom.height = 0;
                    }

                    // Emite from the center of the box by default
                    if (!options.emitterCenterLeft && options.emitterCenterLeft !== 0)
                         options.emitterCenterLeft = E.canvasW / 2;
                    else options.emitterCenterLeft = $.getSize(options.emitterCenterLeft, E.canvasW);
                    if (!options.emitterCenterTop && options.emitterCenterTop !== 0)
                         options.emitterCenterTop  = E.canvasH / 2;
                    else options.emitterCenterTop  = $.getSize(options.emitterCenterTop, E.canvasH);

                    // Convert % or px to (int)
                    if (options.emitterRadius)
                        options.emitterRadius      = $.getSize(options.emitterRadius, E.canvasW);
                    if (options.cssFrom.width)
                        options.cssFrom.width      = $.getSize(options.cssFrom.width, E.canvasW);
                    if (options.cssFrom.height)
                        options.cssFrom.height     = $.getSize(options.cssFrom.height, E.canvasH);
                    if (options.cssFrom.maxSize)
                        options.cssFrom.maxSize    = $.getSize(options.cssFrom.maxSize, E.canvasW);
                    if (options.cssTo.width)
                        options.cssTo.width        = $.getSize(options.cssTo.width, E.canvasW);
                    if (options.cssTo.height)
                        options.cssTo.height       = $.getSize(options.cssTo.height, E.canvasH);
                    if (options.cssTo.maxSize)
                        options.cssTo.maxSize      = $.getSize(options.cssTo.maxSize, E.canvasW);
                },
                // Genedelay starting CSS
                getCssStart: function() {
                    var css = {};
                    // Starting CSS for sprite, add element inside (default centered) emitter radius
                    css.width         = (options.cssFrom.maxSize || options.cssFrom.maxSize === 0 ? // Randomize ?
                                         $.getRand(options.cssFrom.width, options.cssFrom.maxSize) :
                                         options.cssFrom.width);
                    css.height        = (options.cssFrom.height || options.cssFrom.height === 0 ?
                                        (options.cssFrom.maxSize || options.cssFrom.maxSize === 0 ?
                                         $.getRand(options.cssFrom.height , options.cssFrom.maxSize) : // Randomize
                                         options.cssFrom.height) : css.width);
                    css.halfWidth     = css.width / 2;
                    css.halfHeight    = css.height / 2;
                    // Randomize z-index ?
                    css.zIndex        = (options.newAtTop == 'random' ?
                                         $.getRand(options.zIndex, options.zIndex + options.maxSprite) :
                                        (options.newAtTop ? options.zIndex++ : options.zIndex--) ); // null : let by default, !!! if < 0 ^^
                    // Sprite are placed with left top on the emitter and centered / moved with margins
                    css.marginLeft    = -css.halfWidth + $.getRand(-options.emitterRadius, options.emitterRadius);
                    css.marginTop     = -css.halfHeight + $.getRand(-options.emitterRadius, options.emitterRadius);
                    // Rounded sprite by default
                    css.borderRadius  = (options.cssFrom.borderRadius || options.cssFrom.borderRadius === 0 ?
                                         options.cssFrom.borderRadius : css.halfWidth+'px');
                    // Sprite minimal CSS object
                    return $.extend({}, options.cssFrom, { // Processed params merge with config
                        // No anim
                        position    : options.position,
                        display     : options.display || '',
                        float       : options.float,
                        zIndex      : css.zIndex,
                        // Animable
                        width       : css.width+'px',
                        height      : css.height+'px',
                        borderRadius: css.borderRadius // ...
                    });
                },
                getCssEnd: function(cssStart) {
                    var css = { // Keep same sizes by default
                        width        : parseInt(cssStart.width, 10),
                        height       : parseInt(cssStart.height, 10)
                    };

                    // Default endind CSS for sprite
                    if (options.cssTo.width || options.cssTo.width === 0) { // Or let the start size
                        css.width         = (options.cssTo.maxSize || options.cssTo.maxSize === 0 ?
                                             $.getRand(options.cssTo.width, options.cssTo.maxSize) :
                                             options.cssTo.width);
                        css.halfWidth     = css.width / 2; // Update
                        css.borderRadius  = css.halfWidth+'px'; // Default round
                        css.height        = css.width;
                        css.halfHeight    = css.height / 2;
                    }
                    if (options.cssTo.height || options.cssTo.height === 0) { // Or let the start size
                        css.height        = (options.cssTo.maxSize || options.cssTo.maxSize === 0 ?
                                             $.getRand(options.cssTo.height, options.cssTo.maxSize) :
                                             options.cssTo.height);
                        css.halfHeight    = css.height / 2;
                    }
                    // Rounded sprite by default
                    css.borderRadius      = (options.cssTo.borderRadius || options.cssTo.borderRadius === 0 ?
                                             options.cssTo.borderRadius : css.borderRadius); // Default keep cssFrom
                    // Sprite minimal CSS object
                    return $.extend({}, options.cssTo, {
                        transition   : options.transition, // ANIMATION :)
                        width        : css.width+'px',
                        height       : css.height+'px',
                        borderRadius : css.borderRadius     // Not optional, we want this properties automated
                   });
                },
                // Apply cross-browsers starting CSS+
                applyCssStart: function(name_, index_, cssStart_) {
                    // if (_db_) db('applyCssStart()');
                    window[name_][index_].crossCss(cssStart_);

                    if (options.classStart)
                        window[name_][index_].addClass(options.classStart);
                },
                // Apply ending CSS (Apply transition at this moment)
                applyCssEnd: function(name_, index_, cssEnd_) {
                    // if (_db_) db('applyCssEnd()');
                    if (!window[name_][index_]) return; // When killing app, some events can end after

                    if (options.classStart && options.classStop)
                        window[name_][index_].removeClass(options.classStart).addClass(options.classStop);

                    window[name_][index_].crossCss(cssEnd_);

                    if (!options.transition) return;

                    // Wait the end event of CSS transition : transitionend || webkitTransitionEnd ...
                    window[name_][index_].bind($.transitionEnd, function(e) { // // Whom is the end event for transition ?
                        // db(e.elapsedTime);
                        if (!window[name_][index_]) return;
                        window[name_][index_].unbind($.transitionEnd);
                        window[name_][index_].attr('style', 'display:none;');  // Reset all styles (& transition)
                        if (options.classStart) window[name_][index_].removeClass(options.classStart);
                        if (options.classStop)  window[name_][index_].removeClass(options.classStop);
                        $.data(window[name_][index_], 'animated', 0); // Release element
                    });
                }
            };

            // Create new element
            var addSprite = function() {
                // if (_db_) db('addSprite()'); // Flood ;)
                if (!E.render) return;

                // Did we got a element that is not in use in our Array ?
                S.index = -1;
                for (var i = 0; i < options.maxSprite; i++) { // Check elements stack
                    if (!window[E.name][i] || !$.data(window[E.name][i], 'animated')) {
                        S.index = i; // Find an empty place
                        break;
                    }
                }

                if (S.index >= 0) { // Create or manage a sprite

                    // Generate S.cssStart & S.cssEnd CSS obj with default properties
                    S.cssStart = privateMethods.getCssStart();
                    S.cssEnd   = privateMethods.getCssEnd(S.cssStart);

                    // SPRITE EFFECT ///////////////////////////////////////////////////////////////////////
                    // Sprites are created within emitter center radius
                    // Animate sprites in the pseudo canvas, with the help of CSS transition
                    // Effect Dispatch sprites - override default CSS
                    switch(options.effect) {
                        case 'artifice': // Sprites end Inside the border of the box container
                                         // Sprites are placed with left top on the emitter and centered / moved with margins
                            S.cssStart.left         = options.emitterCenterLeft+'px';
                            S.cssStart.top          = options.emitterCenterTop+'px';
                            S.cssStart.marginLeft   = -(parseInt(S.cssStart.width, 10) / 2) + $.getRand(-options.emitterRadius, options.emitterRadius);
                            S.cssStart.marginTop    = -(parseInt(S.cssStart.height, 10) / 2) + $.getRand(-options.emitterRadius, options.emitterRadius);

                            S.marginLeftMin         = -options.emitterCenterLeft;
                            S.marginTopMin          = -options.emitterCenterTop;
                            S.marginLeftMax         = E.canvasW - options.emitterCenterLeft - parseInt(S.cssEnd.width, 10);
                            S.marginTopMax          = E.canvasH - options.emitterCenterTop - parseInt(S.cssEnd.height, 10);

                            if (Math.random() > 0.5) {
                                S.cssEnd.marginLeft = $.getRand(S.marginLeftMin, S.marginLeftMax);
                                S.cssEnd.marginTop  = (Math.random() < 0.5 ? S.marginTopMin : S.marginTopMax);
                            }
                            else {
                                S.cssEnd.marginLeft = (Math.random() < 0.5 ? S.marginLeftMin : S.marginLeftMax);
                                S.cssEnd.marginTop  = $.getRand(S.marginTopMin, S.marginTopMax);
                            }
                        break;
                        case 'nebula': // Sprites end Outside the border of the box container
                                       // Sprites are placed with left top on the emitter and centered / moved with margins
                            S.cssStart.left         = options.emitterCenterLeft+'px';
                            S.cssStart.top          = options.emitterCenterTop+'px';
                            S.cssStart.marginLeft   = -(parseInt(S.cssStart.width, 10) / 2) + $.getRand(-options.emitterRadius, options.emitterRadius);
                            S.cssStart.marginTop    = -(parseInt(S.cssStart.height, 10) / 2) + $.getRand(-options.emitterRadius, options.emitterRadius);

                            S.marginLeftMin         = -options.emitterCenterLeft - parseInt(S.cssEnd.width, 10);
                            S.marginTopMin          = -options.emitterCenterTop - parseInt(S.cssEnd.height, 10);
                            S.marginLeftMax         = E.canvasW - options.emitterCenterLeft;
                            S.marginTopMax          = E.canvasH - options.emitterCenterTop;
                            if (Math.random() > 0.5) {
                                S.cssEnd.marginLeft = $.getRand(S.marginLeftMin, S.marginLeftMax);
                                S.cssEnd.marginTop  = (Math.random() < 0.5 ? S.marginTopMin : S.marginTopMax);
                            }
                            else {
                                S.cssEnd.marginLeft = (Math.random() < 0.5 ? S.marginLeftMin : S.marginLeftMax);
                                S.cssEnd.marginTop  = $.getRand(S.marginTopMin, S.marginTopMax);
                            }
                        break;
                        case 'center': // Keep centered, with random elements size, center is not the same for all
                            S.cssStart.left         = options.emitterCenterLeft+'px';
                            S.cssStart.top          = options.emitterCenterTop+'px';
                            S.cssStart.marginLeft   = -(parseInt(S.cssStart.width, 10) / 2) + $.getRand(-options.emitterRadius, options.emitterRadius);
                            S.cssStart.marginTop    = -(parseInt(S.cssStart.height, 10) / 2) + $.getRand(-options.emitterRadius, options.emitterRadius);
                            S.cssEnd.marginLeft     = - parseInt(S.cssEnd.width, 10) / 2;
                            S.cssEnd.marginTop      = - parseInt(S.cssEnd.height, 10) / 2;
                        break;
                        // Do yours !!! plenty of  properties...
                        default:
                            // If used with position:relative; we just let elements push others, without positions...
                        break;
                    }

                    // return db(E, S); // Debug ?

                    // SPRITE CORE ///////////////////////////////////////////////////////////////////////
                    // Need to CREATE a new sprite element ?  window['emitter78589996'][0] is a $() element
                    if (!window[E.name][S.index] || window[E.name][S.index].length < 1)
                         window[E.name][S.index] = $(options.element).appendTo($canvas); // .prependTo($canvas);

                    // In use now !
                    $.data(window[E.name][S.index], 'animated', 1);

                    privateMethods.applyCssStart(E.name, S.index, S.cssStart);

                    // Wait DOM init with Timeout (even 0), move the element to final location
                    // and wait the magical GPU transition from CSS before removing element
                    setTimeout(privateMethods.applyCssEnd, 0, E.name, S.index, S.cssEnd); // Pass new css + apply trans

                    // If someone outside want to catch our event particule before it move...
                    $canvas.trigger('emit', [window[E.name][S.index]]); //> $canvas.bind('emit', function(e, $sprite) {});
                }

                S = {}; // Reset

                if (options.delay) E.timer = setTimeout(addSprite, options.delay); // And do it again
                else               window.requestAnimFrame(addSprite); // As fast as possible -> Waiting a "maxSpeed" param :-?
            };

            $canvas.bind(publicMethods); // Map our methods to the element
            $canvas.trigger('start'); // Init factory

            return $canvas; // $this

        }); // End each closure

    }; // End plugin

    $.fn.emitter.options = { // Public default minimal options values
        // Seeder ANIM
        effect            : 'nebula',  // nebula, artifice, center or '' // Add your custom effect !
        transition        : 'all 1000ms linear', // CSS Animation
        newAtTop          : 'random',  // Last element appear in top of others : 'random' OR bolean
        emitterRadius     : 0,         // '10px' or '50%' // Radius of emitter
        emitterCenterLeft : null,      // '10px' or '50%' // Default to the center of the box
        emitterCenterTop  : null,
        delay             : null,      // Emission delay in particles per milliseconds // default == Max speed
        maxSprite         : 30,        // Max sprites at one moment
        // Particules HTML / CSS
        element           : '<div></div>', // Default sprite is a div
        position          : 'absolute', // Some properties not in "cssFrom" because not animable
        display           : null,
        float             : null,
        zIndex            : 500,       // Starting index for sprites
        classStart        : null,      // Custom CSS start class, default : null
        classStop         : null,

        convertCss2Class  : false,     // Inject static class of sprite css in current doc instead of dealing on the fly
        cssFrom           : {          // Properties managed with plugin Effect : marginTop, marginLeft, top, left, z-index
                                       // Other CSS properties allowed, plugin add the correct browser-prefix if needed
            width         : '10%',     // 10, '10px' or '50%' // Radius of a sprite : Minimal setting
                                       // By default, height is the width, borderRadius is half size (rounded)
            maxSize       : null       // Custom plugin propertie (with "effect"), randomize size between width and maxSize ?
        },
        cssTo             : {}         // Depend on "effect" but nothing else move by default, all css properties allowed...
                                       // Exeption to "backgroundImage", "fontFace" who are not animable // bg img url() ok with bg pos
    };

})(jQuery, window);