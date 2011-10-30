/*
    // V0.6 - Particules Emitter factory plugin with jQuery & CSS3 
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
    
    // Utilities...
    $.getRand = function(miin, maax) {
        return parseInt(miin + (Math.random() * (maax - miin)), 10);
    };
    
    // Convert % to (int)px
    $.getSize = function(size, ratioWidth) {
        if (size && /\%/.test(size))
            size = (parseInt(size, 10) / 100) * ratioWidth;
        return parseInt(size, 10);
    };
    
    // Inspired by my old work here http://goo.gl/hL3om
    $.getBrowser = (function() { // Closure for putting result in cache
        var userAgentStr = navigator.userAgent.toLowerCase();
        var browsers = { // Various CSS prefix for browsers...
            firefox     :'Moz',
            applewebkit :'Webkit',
            webkit      :'Webkit',
            opera       :'O',
            msie        :'ms', // lower
            Konqueror   :'Khtml'
        };
        for (var prefix in browsers)
            if (userAgentStr.indexOf(prefix) !== -1)
                return browsers[prefix];
        return false;
    })();
    
    // Fix and apply styles on element with correct browsers prefix
    // $(e).crossCss({borderRadius:'10px'}) >>> $(e).css({WebkitBorderRadius:'10px'})
    // Use Modernizer : https://github.com/Modernizr/Modernizr/blob/master/modernizr.js
    // Modernizr.prefixed("borderRadius"); // e.g FF3.6 'MozBorderRadius', FF4 'borderRadius'
    $.fn.crossCss = function(css) {
        return this.each(function() {
            var $this = $(this);
            if (typeof css != 'object') return $this;
            for (var p in css) css[Modernizr.prefixed(p)] = css[p];
            return $this.css(css);
         });
    };
    
    // Emitter jQuery plugin // EXTEND JQUERY functions on "element"
    $.fn.emitter = function(options) {
        
        var _db_ = false; // Activate debug log ?
        
        if (typeof(Modernizr) != 'object') alert('$.fn.emitter require "modernizr(.min).js"');
        
        // Deep merge options with defaut (ex. options.cssFrom.width)
        // jQuery.extend([deep], target, object1 [, objectN])
        options = $.extend(true, {}, $.fn.emitter.options, options);
        if (_db_) db('Init $.fn.emitter()', options); // Debug with console.log
        
        return this.each(function() {
            
            var $canvas    = $(this),    // This is the element for witch the plugin apply
                E          = {},         // Emitter properties
                S          = {};         // Sprites properties
            
            E.name         = 'emitter'+Date.now(); // Plugin element unique ID in window namespace
            E.render       = true;       // Continuous requestAnimation ?
            E.timer        = null;       // setInterval ?
            E.eventEnd = {               // Whom is the end event for transition ?
                'WebkitTransition' :'webkitTransitionEnd',
                'MozTransition'    :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'msTransition'     :'msTransitionEnd',
                'transition'       :'transitionEnd'
            };
            E.eventEnd = E.eventEnd[Modernizr.prefixed('transition')];
        
            window[E.name] = [];         // Stock all sprites $element
            
            var publicMethods = {
                start:function() {
                     if (_db_) db('start()');
                     privateMethods.fixDefaultSizes();
                     E.render = true;
                     addSprite(); // Call factory
                },
                pause:function() {
                    if (_db_) db('pause()');
                    E.render = false; // if requestAnimFrame
                    if (E.timer) clearTimeout(E.timer); // if setTimeout Kill factory
                    E.timer = null;
                },
                // Call it to emit one sprite at a time
                newSprite:function() {
                    if (_db_) db('newSprite()');
                    publicMethods.stop(); // only one
                    addSprite(); // Call factory
                },
                // Stop & clear elements stack
                stop:function() {
                    if (_db_) db('stop()');
                    publicMethods.pause();
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
                  /*  for (var k in newOptions) {
                        if (!newOptions[k] && newOptions[k] !== 0 && $.fn.emitter.options[k]) // null ?
                            newOptions[k] = $.fn.emitter.options[k]; // Default ?
                        else  if (options[k] && typeof newOptions[k] == 'object' && newOptions[k] != null)
                            newOptions[k] = $.extend({}, options[k], newOptions[k]);
                    }
                    // Update plugin options with new ones
                    $.extend(options, newOptions);*/
                    
                    options = $.extend(true, {}, options, newOptions);
                    privateMethods.fixDefaultSizes();
                },
                // Regenedelay emitter : update ALL values
                setOptions:function(event, newOptions) { // $emitter1.trigger('update', [{prop:val,...}]);
                    if (_db_) db('setOptions()', newOptions);
                    publicMethods.stop(); // If sprite HTML is modified, must clear old ones
                    options = $.extend(true, {}, $.fn.emitter.options, newOptions);
                    publicMethods.start();
                }
            };
            
            var privateMethods = {
                fixDefaultSizes: function() {
                    if (_db_) db('fixDefaultSizes()');
                    
                    E.canvasW = parseInt($canvas.width(), 10);
                    E.canvasH = parseInt($canvas.height(), 10);
                    
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
                    if (!css.width) alert('Config. error, need at least "width" to be setted');
                    css.height        = (options.cssFrom.height || options.cssFrom.height === 0 ?
                                        (options.cssFrom.maxSize || options.cssFrom.maxSize === 0 ?
                                         $.getRand(options.cssFrom.height , options.cssFrom.maxSize) : // Randomize
                                         options.cssFrom.height) : css.width);
                    css.halfWidth     = css.width / 2;
                    css.halfHeight    = css.height / 2;
                    // Randomize z-index ?
                    css.zIndex        = (options.newAtTop == 'random' ?
                                         $.getRand(options.zIndex, options.zIndex + options.maxSprite) :
                                        (options.newAtTop ? /* options.zIndex++ */null : options.zIndex--) ); // null : let by default, !!! if < 0 ^^
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
                        display     : options.display,
                        zIndex      : css.zIndex,
                        // Animable
                        left        : options.emitterCenterLeft+'px',
                        top         : options.emitterCenterTop+'px',
                        marginLeft  : css.marginLeft+'px',
                        marginTop   : css.marginTop+'px',
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
                // Apply ending CSS (Apply transition at this moment)
                applyCssEnd: function(name_, index_, cssEnd_) {
                    // if (_db_) db('applyCssEnd()');
                    if (!window[name_][index_]) return; // When killing app, some events can end after
                    window[name_][index_].crossCss(cssEnd_); 
                    // Wait the end event of CSS transition : transitionend || webkitTransitionEnd ...
                    window[name_][index_].bind(E.eventEnd, function() { 
                        if (!window[name_][index_]) return;
                        window[name_][index_].unbind(E.eventEnd);
                        window[name_][index_].attr('style', 'display:none;');  // Reset all styles (& transition)
                        $.data(window[name_][index_], 'used', 0); // Release element 
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
                    if (!window[E.name][i] || !$.data(window[E.name][i], 'used')) { 
                        S.index = i; // Find an empty place
                        break;
                    }
                }
                                  
                if (S.index >= 0) { // Manage a sprite
                
                    // Genedelay S.cssStart & S.cssEnd CSS obj with default properties
                    // Animate sprites in the pseudo canvas, with the help of CSS transition
                    // Sprite are created within emitter center radius, now they need dispatching
                    
                    S.cssStart = privateMethods.getCssStart();
                    S.cssEnd   = privateMethods.getCssEnd(S.cssStart);
                    
                    // Effect Dispatch sprites - override default CSS
                    switch(options.effect) {         
                        case 'artifice': // Sprites end Inside the border of the box container
                            S.marginLeftMin  = -options.emitterCenterLeft;
                            S.marginTopMin   = -options.emitterCenterTop;
                            S.marginLeftMax  = E.canvasW - options.emitterCenterLeft - parseInt(S.cssEnd.width, 10);
                            S.marginTopMax   = E.canvasH - options.emitterCenterTop - parseInt(S.cssEnd.height, 10);
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
                            S.marginLeftMin  = -options.emitterCenterLeft - parseInt(S.cssEnd.width, 10);
                            S.marginTopMin   = -options.emitterCenterTop - parseInt(S.cssEnd.height, 10);
                            
                            S.marginLeftMax  = E.canvasW - options.emitterCenterLeft;
                            S.marginTopMax   = E.canvasH - options.emitterCenterTop;
                            if (Math.random() > 0.5) {
                                S.cssEnd.marginLeft = $.getRand(S.marginLeftMin, S.marginLeftMax);
                                S.cssEnd.marginTop  = (Math.random() < 0.5 ? S.marginTopMin : S.marginTopMax);
                            }
                            else {
                                S.cssEnd.marginLeft = (Math.random() < 0.5 ? S.marginLeftMin : S.marginLeftMax);
                                S.cssEnd.marginTop  = $.getRand(S.marginTopMin, S.marginTopMax);
                            }
                        break; 
                        // Do yours !!! plenty of  properties...
                        default:
                        break;
                    }
                    
                    // return db(S);
                    
                    // SPRITE CORE ///////////////////////////////////////////////////////////////////////
                    // Need to CREATE a new sprite element ?   
                    if (!window[E.name][S.index] || window[E.name][S.index].length < 1)
                         window[E.name][S.index] = $(options.element).appendTo($canvas);
                    
                    // In use now !
                    $.data(window[E.name][S.index], 'used', 1); 
                    
                    // Apply cross-browsers starting CSS+
                    window[E.name][S.index].crossCss(S.cssStart);
                    
                    // If someone outside want to catch our event particule before it move...
                    $canvas.trigger('emit', [window[E.name][S.index]]); //> $canvas.bind('emit', function(e, $sprite) {});
                    
                    // Wait DOM init with Timeout (even 0), move the element to final location
                    // and wait the magical GPU transition from CSS before removing element
                    setTimeout(privateMethods.applyCssEnd, 0, E.name, S.index, S.cssEnd); // Pass new css + apply trans
                }
                
                S = {}; // Reset
                
                if (options.delay) E.timer = setTimeout(addSprite, options.delay); // And do it again
                else              window.requestAnimFrame(addSprite); // As fast as possible - Waiting a "maxSpeed" param :-?
            };
            
            $canvas.bind(publicMethods); // Map our methods to the element
            $canvas.trigger('start'); // Init factory
            
            return $canvas; // $this
            
        }); // End each closure
    
    }; // End plugin
    
    $.fn.emitter.options = { // Public default minimal options values
        // Seeder ANIM
        effect            : 'nebula',  // 'nebula' or 'artifice' // Add your custom effect !
        transition        : 'all 1000ms linear', // CSS Animation
        newAtTop          : 'random',  // Last element appear in top of others : 'random' OR bolean
        emitterRadius     : 0,         // '10px' or '50%' // Radius of emitter
        emitterCenterLeft : null,      // '10px' or '50%' // Default to the center of the box
        emitterCenterTop  : null,
        delay             : null,      // Emission delay in particles per milliseconds // default == Max speed
        maxSprite         : 30,        // Max sprites at one moment
        // Particules HTML / CSS
        element           : '<div></div>', // Default sprite is a div
        position          : 'absolute',
        display           : 'block',
        zIndex            : 500,       // Starting index for sprites
        cssFrom           : {          // Properties managed with plugin Effect : marginTop, marginLeft, top, left, z-index
                                       // Other CSS properties allowed, plugin add the correct browser-prefix if needed
            width         : '10%',     // 10, '10px' or '50%' // Radius of a sprite : Minimal setting
                                       // By default, height is the width, borderRadius is half size (rounded)
            maxSize       : null       // Custom plugin propertie (with "effect"), randomize size between width and maxSize ?
        },
        cssTo             : {}         // Depend on "effect" but nothing else move by default, all css properties allowed...
    };

})(jQuery, window);
