[UPDATE : Work in progress in the NEW place https://github.com/molokoloco/jQuery.boxFx]

// V0.7 - Particules Emitter factory plugin with jQuery & CSS3 
// MIT License - @molokoloco 28/10/2011 - http://b2bweb.fr
// Infos      : http://goo.gl/P18db
// Plain demo : http://www.b2bweb.fr/framework/jquery.emitter/jquery.emitter.html
// Cloud9ide  : http://cloud9ide.com/molokoloco/jquery_emitter
// Live demo  : http://jsfiddle.net/molokoloco/aqfsC/
// Sources    : https://github.com/molokoloco/jquery.emitter
// Download   : http://www.b2bweb.fr/framework/jquery.emitter/jquery.emitter.zip (V0.6)

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