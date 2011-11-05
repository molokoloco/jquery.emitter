$(function() { // Wait jQuery to be ready

    // Some options presets...
    var optionsPresets = window.optionsPresets = {};

    /*
        optionsPresets.example = { // EXAMPLE #1
            // EMITTER TYPE
            effect            : 'nebula',    // nebula, artifice, center or '' // Add your custom effect !
            transition        : 'all 3000ms cubic-bezier(.2, .1, .9, 0)', // CSS Animation
            newAtTop          : 'random',    // Last element appear in top of others : 'random' OR bolean
            delay             : 0,           // New sprite every ms, Set to 0 for the plugin to use requestFrame (as fast as possible)
            maxSprite         : 100,         // Max sprites at one moment (Each sprite is a new DOM element)
            emitterRadius     : 16,          // 10, '10px' or '50%' // Radius of emitter
            emitterCenterLeft : '50%',       // 10, '10px' or '50%' // Default to the center of the box
            emitterCenterTop  : '50%',
            // SPRITES HTML & CSS
            element           : '<div class="sprite"></div>',             // Default sprite is a div
            cssFrom           : {            // Properties managed with plugin Effect : marginTop, marginLeft, top, left, z-index
                                             // Other CSS properties allowed, plugin add the correct browser-prefix if needed
                width             : 8,       // '10', '10px' or '50%'     // Radius of a sprite
                height            : null,
                maxSize           : 16,      // Custom plugin propertie, randomize size between width and maxSize ?
                transform         : null,    // 'rotate(180deg) scale(5) translateX(10px, 0px) skew(-10deg,10deg)',
                backgroundColor   : null,    // 'rgba(255, 255, 0, 1)',
                backgroundImage   : '-'+$.browserPrefix+'-radial-gradient(33% 33%, circle cover,rgba(230,230,250,1) 25%,rgba(50,50,70,1) 80%)', // 'url()' or '-moz-radial-gradient()'
                maskImage         : null,    // gradient, color, ...
                boxShadow         : '0 0 10px rgba(0,0,0,1)',
                border            : null,    // '1px dashed rgb(0,0,0)', // buggus with alpha
                borderRadius      : '50%',   // '10px' or '50%' // Default round with half size radius
                opacity           : 1
            },
            cssTo             : {            // All the "cssFrom" properties are usable
                width             : 20,
                height            : null,
                maxSize           : '60%',   // Ex. 60% >> random width between 20px and 60% of the box size
                borderRadius      : '50%',   // Round
                opacity           : 1
            }
        };
    */

    // optionsPresets are used like a JSON "Editable" object... (Textarea)

    optionsPresets.html5Ize = {
        "effect": "nebula",
        "transition": "all 2000ms linear",
        "newAtTop": true,
        "delay": 0,
        "maxSprite": 280,
        "emitterRadius": 150,
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "element": "<img src=\"http://www.w3.org/html/logo/downloads/HTML5_Badge_32.png\" width=\"32\" heigh=\"32\"/>",
        "position": "absolute",
        "cssFrom": {
            "width": 32,
            "height": 32,
            "borderRadius": 0
        },
        "cssTo": {
            "opacity": 0,
            "transform": "rotateY(-360deg)"
        }
    };

    optionsPresets.hyperSpace = {
        "effect": "nebula",
        "transition": "all 900ms cubic-bezier(.6,.2,.8,.4)",
        "newAtTop": true,
        "delay": 0,
        "maxSprite": 900,
        "emitterRadius": 5,
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "75%",
        "cssFrom": {
            "width": 1,
            "backgroundColor": "rgba(255,255,10,0)",
            "borderRadius": 0
        },
        "cssTo": {
            "backgroundColor": "rgba(255,255,100,1)",
            "boxShadow": "0 0 10px rgba(219,240,67,1)",
            "width": 1,
            "maxSize": 5
        }
    };

    optionsPresets.deepSun = {
        "effect": "artifice",
        "transition": "all 4000ms linear",
        "newAtTop": 0,
        "delay": 420,
        "maxSprite": 16,
        "emitterRadius": "100%",
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "cssFrom": {
            "width": "80%",
            "maxSize": null,
            "borderRadius": "50%",
            "backgroundImage": "-"+$.browserPrefix+"-radial-gradient(50% 50%, circle cover,rgba(0,0,0,0) 0%, rgba(250,250,36,0) 100%)",
            "boxShadow": "0 0 30px rgba(250,250,36,0)"
        },
        "cssTo": {
            "width": 0,
            "borderRadius": "50%",
            "backgroundImage": "-"+$.browserPrefix+"-radial-gradient(50% 50%, circle cover,rgba(0,0,0,0) 0%, rgba(250,250,36,1) 100%)",
            "boxShadow": "0 0 30px rgba(250,250,36,1)",
            "opacity": 0
        }
    };

    optionsPresets.whiteHole = {
        "effect": "center",
        "transition": "all 1800ms cubic-bezier(1,0.3,.5,0)",
        "newAtTop": false,
        "delay": 150,
        "maxSprite": 33,
        "emitterRadius": 20,
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "cssFrom": {
            "width": 150,
            "height": 150,
            "maxSize": 200,
            "backgroundColor": "rgba(255,255,255,0.8)",
            "boxShadow": "0 0 40px #FFFFFF,0 0 6px #FFFFFF",
            "borderRadius": "50%",
            "opacity": 1
        },
        "cssTo": {
            "width": 150,
            "height": 150,
            "maxSize": 200,
            "borderRadius": "50%",
            "opacity": 1
        }
    };

    optionsPresets.rainbowArrow = {
        "effect": "artifice",
        "transition": "all 7000ms cubic-bezier(1, 1, 0, 0)",
        "newAtTop": "random",
        "delay": 500,
        "maxSprite": 16,
        "emitterRadius": 60,
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "120%",
        "cssFrom": {
            "width": 50,
            "height": 100,
            "backgroundColor": "rgba(219,20,80,1)",
            "boxShadow": "0 0 50px rgba(219,20,80,1)",
            "borderRadius": 1000
        },
        "cssTo": {
            "width": 1,
            "height": 500,
            "borderRadius": 1000,
            "backgroundColor": "rgba(255,255,5,1)",
            "boxShadow": "0 0 50px rgba(255,255,5,1)",
            "opacity": 0
        }
    }/* {
        "effect": "artifice",
        "transition": "all 7000ms cubic-bezier(1, 1, 0, 0)",
        "newAtTop": "random",
        "delay": 500,
        "maxSprite": 16,
        "emitterRadius": 60,
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "120%",
        "cssFrom": {
            "width": 36,
            "height": 200,
            "backgroundColor": "rgba(219,20,80,1)",
            "boxShadow": "0 0 50px rgba(219,20,80,1)",
            "borderRadius": "18px / 100px"
        },
        "cssTo": {
            "width": 1,
            "height": 500,
            "borderRadius": "1px / 250px",
            "backgroundColor": "rgba(255,255,5,1)",
            "boxShadow": "0 0 50px rgba(255,255,5,1)",
            "opacity": 0
        }
    } */;


    optionsPresets.sunnyCloud = {
        "effect": "artifice",
        "transition": "all 6000ms linear",
        "newAtTop": 1,
        "delay": 1000,
        "maxSprite": 6,
        "emitterRadius": "0%",
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "cssFrom": {
            "width": "150%",
            "height": "150%",
            "backgroundImage": "url(http://www.b2bweb.fr/bonus/gradientBigMap.png)",
            "backgroundRepeat": "no-repeat",
            "backgroundPosition": "center center",
            "backgroundSize": "200% 200%",
            "borderRadius": 0,

            "opacity": "0"
        },
        "cssTo": {
            "opacity": "1",
            "backgroundSize": "100% 100%"
        }
    };

    optionsPresets.acidSquares = {
        "effect": "artifice",
        "transition": "all 2600ms linear",
        "newAtTop": true,
        "delay": 0,
        "maxSprite": 200,
        "emitterRadius": "100%",
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "cssFrom": {
            "width": 200,
            "height": 200,
            "transform": "rotate(45deg)",
            "backgroundColor": "rgba(195,216,37,0.1)",
            "border": "1px solid yellow",
            "boxSizing": "border-box", // CHECK !
            "borderRadius": 0
        },
        "cssTo": {
            "opacity": 0
        }
    };

    optionsPresets.lolCat = {
        "effect": "nebula",
        "transition": "all 4000ms linear",
        "newAtTop": true,
        "delay": 900,
        "maxSprite": 14,
        "emitterRadius": 50,
        "emitterCenterLeft": "0",
        "emitterCenterTop": "10%",
        "element": "<img src=\"http://www.b2bweb.fr/bonus/nian-cat.png\" width=\"772\" heigh=\"93\"/>",
        "position": "absolute",
        "cssFrom": {
            "width": 772,
            "height": 93,
            "transform": "scale(0.1) skew(-10deg,10deg)",
            "borderRadius": 0
        },
        "cssTo": {
            "transform": "scaleY(2) scaleX(2.5) skew(10deg,-10deg)",
            "opacity": 0
        }
    };

    optionsPresets.typoGraphe = {
        "effect": "artifice",
        "transition": "all 2500ms ease",
        "newAtTop": 0,
        "delay": 190,
        "maxSprite": 33,
        "emitterRadius": "33%",
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "130%",
        "element": "<span>I'am alive</span>",
        "cssFrom": {
            "width": 120,
            "height": 100,
            "transform": "scale(0.1)",
            "font": "bold 40px Trebuchet,Verdana",
            "color": "transparent",
            "textShadow": "0 0 30px rgba(255,255,255,1)",
            "borderRadius": 0
        },
        "cssTo": {
            "color": "transparent",
            "textShadow": "0 0 1px rgba(255,255,255,1)",
            "textStroke": "1px rgba(0,0,0,.33)",
            "transform": "scale(1)",
            "alpha": 1
        }
    };

    optionsPresets.starParty = {
        "effect": "nebula",
        "transition": "all 2000ms linear",
        "newAtTop": 1,
        "delay": 125,
        "maxSprite": 30,
        "emitterRadius": "40",
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "element": "<span>★</span>",
        "cssFrom": {
            "width": 160,
            "height": 160,
            "font": "150px verdana",
            "transform": "scale(1)",
            "color": "rgb(230,230,10)",
            "borderRadius": 0
        },
        "cssTo": {
            "color": "rgb(230,230,10)",
            "transform": "scale(0.01) rotate(250deg)",
            "alpha": 1
        }
    };

    optionsPresets.hypnoWork = {
        "effect": "artifice",
        "transition": "all 2000ms linear",
        "newAtTop": "random",
        "delay": 100,
        "maxSprite": 40,
        "emitterRadius": "10%",
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "50%",
        "cssFrom": {
            "width": "20%",
            "maxSize": "50%",
            "backgroundImage": "-"+$.browserPrefix+"-linear-gradient(-45deg, #FFFD69 25%,transparent 26%,transparent 50%,#FFFD69 51%,#FFFD69 75%,transparent 76%,transparent 100%)",
            "backgroundSize": "10px 10px",
            "border": "8px solid #FFFD69",
            "opacity": 0,
            "borderRadius": 0
        },
        "cssTo": {
            "width": 1,
            "border": "1px solid #FFFD69",
            "borderRadius": 0,
            "opacity": 1
        }
    };

    optionsPresets.tunneLize = {
        "effect": "center",
        "transition": "all 9000ms ease-in",
        "newAtTop": 1,
        "delay": 750,
        "maxSprite": 23,
        "emitterRadius": 5,
        "emitterCenterLeft": "50%",
        "emitterCenterTop": "75%",
        "cssFrom": {
            "width": 5,
            "height": 5,
            "maxSize": 12,
            "backgroundImage": "-"+$.browserPrefix+"-radial-gradient(33% 33%, circle cover,rgba(50,50,70,1) 30%,rgba(230,230,250,1) 70%,rgba(255,255,255,1) 100%)",
            "borderRadius": "50%",
            "opacity": 0
        },
        "cssTo": {
            "width": "150%",
            "maxSize": "160%",
            "borderRadius": "50%",
            "transform": "rotate(-500deg)",
            "opacity": 1
        }
    };

    optionsPresets.masterMind = {
        "effect": "",
        "transition": "all 7000ms linear",
        "newAtTop": 1,
        "delay": 0,
        "maxSprite": 300,
        "position": "relative",
        "emitterRadius": 0,
        "emitterCenterLeft": 0,
        "emitterCenterTop": 0,
        "display": "block",
        "element": "<div class=\"sprite\">✖</div>",
        "cssFrom": {
	        "float": "left",
            "width": 25,
            "textAlign": "center",
            "color": "orange",
            "font": "bold 10px/25px Arial",
            "backgroundColor": "orange",
            "opacity": 0
        },
        "cssTo": {
            "opacity": 1,
            "fontSize": "20px",
            "textShadow": "2px 2px 4px black",
            "backgroundColor": "yellow"
        }
    };

    optionsPresets.subWoofer = {
        "effect": "center",
        "transition": "all 9000ms cubic-bezier(.2,.8,.8,.2)",
        "newAtTop": 1,
        "delay": 580,
        "maxSprite": 25,
        "emitterRadius": 0,
        "cssFrom": {
            "width": "25%",
            "backgroundImage": "-"+$.browserPrefix+"-radial-gradient(10% 30%, circle cover,rgba(230,230,230,1) 0%,rgba(230,230,230,1) 35%,rgba(50,50,50,1) 90%,rgba(50,50,50,1) 100%)",
            "boxShadow": "inset 0 0 30px rgba(50,50,50,1)"
        },
        "cssTo": {
            "width": "75%",
            "boxShadow": "inset 0 0 5px rgba(250,250,250,1)",
            "opacity": 0
        }
    };

});