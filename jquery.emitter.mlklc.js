/*
    // Emitter sprites factory with jQuery & CSS3 V0.4
    // by molokoloco@gmail.com 17/10/2011
    // Infos : http://www.b2bweb.fr/emitter-sprites-particules-factory-with-jquery-css3
    // Live Demo V0.4 : http://jsfiddle.net/molokoloco/hDMKg/
    // Sources : https://github.com/molokoloco/jquery.emitter
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
    
    // $.cssPrefix('Transform') return 'MozTransform' or 'msTransform' or ...
    // See http://jsfiddle.net/molokoloco/f6Z3D/
    $.cssPrefixString = {};
    $.cssPrefix = function(propertie) {
        if ($.cssPrefixString[propertie] || $.cssPrefixString[propertie] === '') return $.cssPrefixString[propertie] + propertie;
        var e = document.createElement('div');
        var prefixes = ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml']; // Various browsers...
        for (var i in prefixes) {
            if (typeof e.style[prefixes[i] + propertie] !== 'undefined') {
                $.cssPrefixString[propertie] = prefixes[i];
                return prefixes[i] + propertie;
            }
        }
        return false;
    };
    
    // Fix and apply styles on element with correct browsers prefix
    // $(e).crossCss({borderRadius:'10px'}) >>> $(e).css({WebkitBorderRadius:'10px'})
    $.fn.crossCss = function(css) {
        return this.each(function() { // I've implemented only the one i need, do yours !
            var $this = $(this);
            if (typeof css != 'object') return $this;
            if (css.transition)
                css[$.cssPrefix('Transition')]      = css.transition; // ANIM
            if (css.borderRadius || css.borderRadius === 0)
                css[$.cssPrefix('borderRadius')]    = css.borderRadius;
            if (css.borderImage)
                css[$.cssPrefix('borderImage')]     = css.borderImage;
            if (css.maskImage)
                css[$.cssPrefix('maskImage')]       = css.maskImage;
            if (css.transform)
                css[$.cssPrefix('Transform')]       = css.transform;
            if (css.boxShadow)
                css[$.cssPrefix('boxShadow')]       = css.boxShadow;
            return $this.css(css);
         });
    };
    
    // Emitter jQuery plugin // EXTEND JQUERY functions on "element"
    $.fn.emitter = function(options) {
        // db('Init $sprite()', options);
        
        // Deep merge options with defaut (ex. options.cssFrom)
        for (var k in options)
            if (typeof options[k] == 'object' && $.fn.emitter.options[k])
                options[k] = $.extend({}, $.fn.emitter.options[k], options[k]);
        
        // Merge new with default
        options = $.extend({}, $.fn.emitter.options, options);
        
        return this.each(function() {
            
            var $canvas   = $(this),
                E         = {},   // Emitter properties
                P         = {};   // Sprites properties
            
            E.delay       = 1000; // Later..
            E.render      = true; // Continuous requestAnimation ?
            E.timer       = null; // setInterval ?
            
            window.numSprites = 0;// Global number of elements
            
            var fixDefaultSizes = function() {
                E.canvasW = parseInt($canvas.width());
                E.canvasH = parseInt($canvas.height());
                    
                // Extract delay from CSS transition:'all 3000ms linear';
                if (options.transition) 
                    E.delay                    = options.transition.split('ms')[0].split(' ')[1]; 
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
            };
            
            fixDefaultSizes();
            
            // Create new element
            var addSprite = function() {
                
                if (window.numSprites < options.maxSprite) { // DOM security, if rate is short and transition long
                    // Starting CSS for sprite, add element inside (default centered) emitter radius
                    // Random size ?
                    P.spriteWidth   = (options.cssFrom.maxSize || options.cssFrom.maxSize === 0 ?
                                       $.getRand(options.cssFrom.width, options.cssFrom.maxSize) : // Randomize
                                       options.cssFrom.width);
                    P.spriteHeight  = (options.cssFrom.maxSize || options.cssFrom.maxSize === 0 ?
                                       P.spriteWidth : 
                                       (options.cssFrom.height ? options.cssFrom.height : options.cssFrom.width));
                    P.halfWidth     = P.spriteWidth / 2;
                    P.halfHeight    = P.spriteHeight / 2;
                    // Randomize z-index ?
                    P.zIndex        = (options.newAtTop == 'random' ?
                                       $.getRand(options.zIndex, options.zIndex + options.maxSprite) :
                                      (options.newAtTop ? options.zIndex++ : options.zIndex--) ); // !!! if < 0 ^^
                    // Sprite are placed with left top on the emitter and centered / moved with margins
                    P.marginLeft    = -P.halfWidth + $.getRand(-options.emitterRadius, options.emitterRadius);
                    
                    P.marginTop     = -P.halfHeight + $.getRand(-options.emitterRadius, options.emitterRadius);
                    // Rounded sprite by default
                    P.borderRadius  = (options.cssFrom.borderRadius || options.cssFrom.borderRadius === 0 ?
                                       options.cssFrom.borderRadius : P.halfWidth+'px');
                    
                    // Sprite minimal CSS object
                    P.cssStart = $.extend({}, options.cssFrom, { // Processed params merge with config
                        // No anim
                        position    : options.position,
                        transition  : options.transition,
                        zIndex      : P.zIndex,
                        // Animable
                        left        : options.emitterCenterLeft+'px',
                        top         : options.emitterCenterTop+'px',
                        marginLeft  : P.marginLeft+'px',
                        marginTop   : P.marginTop+'px',
                        width       : P.spriteWidth+'px',
                        height      : P.spriteHeight+'px',
                        borderRadius: P.borderRadius
                    });
                    
                    // Animate sprites in the pseudo canvas, with the help of CSS transition
                    // Sprite are created arount emitter center, now they need dispatching
                    // Generate P.cssEnd CSS
                    switch(options.effect) {
                        case 'nebula': // RANDOMLY dispatch sprites 
                            
                            // Ending CSS for sprite
                            if (options.cssTo.width || options.cssTo.width === 0) { // Or let the start size
                                P.spriteWidth   = (options.cssTo.maxSize || options.cssTo.maxSize === 0 ?
                                                   $.getRand(options.cssTo.width, options.cssTo.maxSize) :
                                                   options.cssTo.width);
                                P.halfWidth     = P.spriteWidth / 2; // Update
                                P.borderRadius  = P.halfWidth+'px'; // Default round
                                P.spriteHeight  = P.spriteWidth; 
                            }
                            
                            if (options.cssTo.height || options.cssTo.height === 0) { // Or let the start size
                                P.spriteHeight  = (options.cssTo.maxSize || options.cssTo.maxSize === 0 ?
                                                   P.spriteWidth :
                                                   (options.cssTo.height ? options.cssTo.height : options.cssTo.width));
                                P.halfHeight     = P.spriteHeight / 2;
                            }
                              
                            // Rounded sprite by default
                            P.borderRadius      = (options.cssTo.borderRadius || options.cssTo.borderRadius === 0 ?
                                                   options.cssTo.borderRadius : P.borderRadius);
                                
                            // Sprites end Outside the border of the box container
                            P.marginLeftMin     = -options.emitterCenterLeft - P.spriteWidth;
                            P.marginTopMin      = -options.emitterCenterTop - P.spriteHeight;
                            P.marginLeftMax     = E.canvasW - options.emitterCenterLeft;
                            P.marginTopMax      = E.canvasH - options.emitterCenterTop;
                                
                            // Sprites end Inside the border of the box container
                            /* P.marginLeftMin  = -options.emitterCenterLeft;
                            P.marginTopMin      = -options.emitterCenterTop;
                            P.marginLeftMax     = E.canvasW - options.emitterCenterLeft - P.spriteWidth;
                            P.marginTopMax      = E.canvasH - options.emitterCenterTop - P.spriteHeight; */
                            
                            if (Math.random() > 0.5) {
                                P.marginLeftEnd = $.getRand(P.marginLeftMin, P.marginLeftMax);
                                P.marginTopEnd  = (Math.random() < 0.5 ? P.marginTopMin : P.marginTopMax);
                            }
                            else {
                                P.marginLeftEnd = (Math.random() < 0.5 ? P.marginLeftMin : P.marginLeftMax);
                                P.marginTopEnd  = $.getRand(P.marginTopMin, P.marginTopMax);
                            }
                            
                            P.cssEnd = $.extend({}, options.cssTo, { // Processed params merge with config
                                width        : P.spriteWidth+'px',
                                height       : P.spriteHeight+'px',
                                borderRadius : P.borderRadius, // not optional because we want this properties automated
                                marginLeft   : P.marginLeftEnd+'px',
                                marginTop    : P.marginTopEnd+'px'
                           });  
                           
                        break;
                        
                        default: // Do yours !!!
                            P.cssEnd = $.extend({}, options.cssTo);
                        break;
                    }
                    
                    // SPRITE CORE ///////////////////////////////////////////////////////////////////////
                    // Todo : use a cache object and recycling elements
                    P.$sprite = $(options.element)// Create a new styled sprite
                        .crossCss(P.cssStart) // Cross browser css
                        .appendTo($canvas);
                    window.numSprites++;
                    
                    // If someone outside want to catch our event particule...
                    $canvas.trigger('emit', [P.$sprite]); // $canvas.bind('emit', function(e, $sprite) {});
                    
                    // Wait DOM init with Timeout (even 0), move the element to final location
                    // and wait the magical GPU transition from CSS before removing element
                    setTimeout(function($sprite_, cssEnd_) {
                        $sprite_.crossCss(cssEnd_); // Apply
                        setTimeout(function($sprite__) {
                            $sprite__.remove(); // Todo : release this element and give back for a new one
                            window.numSprites--;
                        }, E.delay, $sprite_);
                    }, 0, P.$sprite, P.cssEnd); // Pass new css
                }

                // db(P.cssStart, P.cssEnd);  return;
                P = {}; // Reset

               if (options.rate)  E.timer = setTimeout(addSprite, options.rate); // And do it again
               else if (E.render) window.requestAnimFrame(addSprite); // As fast as possible // Waiting a "maxSpeed" param :-?
            };
            
            // Public events methods
            $canvas.bind({
                start:function() {
                    E.render = true;
                    addSprite(); // Call factory
                },
                stop:function() {
                    E.render = false; // if requestAnimFrame
                    if (E.timer) { // if setTimeout
                        clearTimeout(E.timer); // Kill factory
                        E.timer = null;
                    }         
                },
                // Call it to emit one sprite at a time
                create:function() {
                    $canvas.trigger('stop'); // only one
                    addSprite(); // Call factory
                },
                // Update one or more values while processing sprite
                update:function(event, newOptions) { //  $emitter1.trigger('update', [options]);
                    // Deep merge options with current (ex. options.cssFrom)
                    for (var k in newOptions)
                        if (typeof newOptions[k] == 'object' && $.fn.emitter.options[k])
                            newOptions[k] = $.extend({}, options[k], newOptions[k]);
                    // Update plugin options with new ones
                    options = $.extend(options, newOptions); 
                    fixDefaultSizes();
                }
            });
            
            $canvas.trigger('start'); // Init factory
            
            return $canvas; // $this
            
        }); // End each
    
    }; // End plugin
    
    $.fn.emitter.options = { // Public default minimal options values
        // Seeder ANIM
        effect            : 'nebula',  // Add your custom effect !
        transition        : 'all 1000ms linear', // CSS Animation, keep delay in "ms" 
        newAtTop          : 'random',  // Last element appear in top of others : 'random' OR bolean
        emitterRadius     : 0,         // '10px' or '50%' // Radius of emitter
        emitterCenterLeft : null,      // '10px' or '50%' // Default to the center of the box
        emitterCenterTop  : null,
        rate              : null,      // Emission rate in particles per milliseconds // default == Max speed
        maxSprite         : 30,        // Max sprites at one moment
        // Particules HTML / CSS
        element           : '<div></div>', // Default sprite is a div
        position          : 'absolute',
        zIndex            : 500,       // Starting index for sprites
        cssFrom           : {          // Properties managed with plugin Effect : marginTop, marginLeft, top, left, z-index
                                       // Other CSS properties allowed, plugin add the correct browser-prefix if needed
            width         : '10%',     // '10px' or '50%' // Radius of a sprite : Minimal setting
                                       // By default, height is the width, borderRadius is half size (rounded)
            maxSize       : null       // Custom plugin propertie, randomize size between width and maxSize ?
        },
        cssTo             : {}         // Depend on "effect" but nothing else move by default, all css properties allowed...
    };

})(jQuery, window);