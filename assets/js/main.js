/*
	Forty by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	// Force passive scroll/touch listeners globally for smoother mobile scrolling
	(function() {
		var supportsPassive = false;
		try { var opts = Object.defineProperty({}, 'passive', { get: function() { supportsPassive = true; } }); window.addEventListener('test', null, opts); } catch(e) {}
		if (supportsPassive) {
			var orig = EventTarget.prototype.addEventListener;
			EventTarget.prototype.addEventListener = function(type, fn, opts) {
				if ((type === 'scroll' || type === 'touchmove' || type === 'touchstart' || type === 'wheel')
					&& opts !== false && (typeof opts !== 'object' || opts.passive === undefined)) {
					opts = typeof opts === 'object' ? Object.assign({}, opts, { passive: true }) : { passive: true };
				}
				return orig.call(this, type, fn, opts);
			};
		}
	})();

			var	$window = $(window),
				$body = $('body'),
				$wrapper = $('#wrapper'),
				$header = $('#header'),
				$banner = $('#banner');

			var pageTransitionDuration = 220;

			$body.addClass('is-page-transitioning');
			$wrapper.addClass('is-transitioning');

			var navigateWithTransition = function(href, delay) {

				if (!href)
					return;

				$body.addClass('is-page-transitioning');
				$wrapper.addClass('is-transitioning');

				window.setTimeout(function() {
					window.location.href = href;
				}, delay || pageTransitionDuration);

		};

		var shouldTransitionLink = function($link) {

			var href = $link.attr('href'),
				target = $link.attr('target');

			if (!href || href == '' || href == '#' || href.charAt(0) == '#')
				return false;

			if (target == '_blank' || $link.is('[download]'))
				return false;

			if (/^(mailto:|tel:|javascript:)/i.test(href))
				return false;

			try {

				var url = new URL(href, window.location.href);

				if (url.origin != window.location.origin)
					return false;

				if (url.pathname == window.location.pathname
				&&	url.search == window.location.search
				&&	url.hash)
					return false;

			}
			catch (error) {
				return false;
			}

			return true;

		};

	// Breakpoints.
		breakpoints({
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (browser.name == 'ie' || browser.name == 'edge' || browser.mobile) ? function() { return $(this) } : function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				on, off;

			on = function() {

				$t.css('background-position', 'center 100%, center 100%, center 0px');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

					});

			};

			off = function() {

				$t
					.css('background-position', '');

				$window
					.off('scroll._parallax');

			};

			breakpoints.on('<=medium', off);
			breakpoints.on('>medium', on);

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

		// Play initial animations on page load.
			// Use both DOMContentLoaded (fast, unblocks interaction) and load (fallback).
			var initialRevealDone = false;
			function revealPage() {
				if (initialRevealDone) return;
				initialRevealDone = true;
				$body.removeClass('is-preload');
				window.setTimeout(function() {
					$body.removeClass('is-page-transitioning');
					$wrapper.removeClass('is-transitioning');
				}, 60);
			}

			if (document.readyState === 'complete' || document.readyState === 'interactive') {
				window.setTimeout(revealPage, 50);
			} else {
				document.addEventListener('DOMContentLoaded', function() {
					window.setTimeout(revealPage, 50);
				});
			}
			$window.on('load', revealPage);

	// Clear transitioning state on unload/hide.
		$window.on('unload pagehide', function() {
			window.setTimeout(function() {
				$('.is-transitioning').removeClass('is-transitioning');
			}, 250);
		});

	// Fix: Enable IE-only tweaks.
		if (browser.name == 'ie' || browser.name == 'edge')
			$body.addClass('is-ie');

		// Scrolly.
			$('.scrolly').scrolly({
				offset: function() {
					return $header.height() - 2;
				}
			});

		// Smooth page transitions for internal links opened in the current tab.
			$body.on('click', 'a', function(event) {

				var $link = $(this);

				if (event.isDefaultPrevented())
					return;

				if ($link.closest('#menu').length > 0
				||	$link.closest('.tiles').length > 0
				||	$link.hasClass('scrolly'))
					return;

				if (!shouldTransitionLink($link))
					return;

				event.preventDefault();
				event.stopPropagation();

				navigateWithTransition($link.attr('href'), pageTransitionDuration);

			});

	// Tiles.
		var $tiles = $('.tiles > article');

		$tiles.each(function() {

			var $this = $(this),
				$image = $this.find('.image'), $img = $image.find('img'),
				$link = $this.find('.link'),
				x;

			// Image.

				// Set image.
					$this.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide original.
					$image.hide();

			// Link.
				if ($link.length > 0) {

					$x = $link.clone()
						.text('')
						.addClass('primary')
						.appendTo($this);

					$link = $link.add($x);

					$link.on('click', function(event) {

						var href = $link.attr('href');

						// Prevent default.
							event.stopPropagation();
							event.preventDefault();

						// Target blank?
							if ($link.attr('target') == '_blank') {

								// Open in new tab.
									window.open(href);

							}

						// Otherwise ...
							else {

								// Start transitioning.
									$this.addClass('is-transitioning');
									$wrapper.addClass('is-transitioning');

									// Redirect.
										window.setTimeout(function() {
											location.href = href;
										}, pageTransitionDuration);

							}

					});

				}

		});

	// Spotlights.
		var $spotlights = $('.spotlights > section');

		$spotlights.each(function() {

			var $this = $(this),
				$image = $this.find('.image'),
				$img = $image.find('img'),
				x;

			if ($image.length === 0 || $img.length === 0)
				return;

			// Set image.
				$image.css('background-image', 'url(' + $img.attr('src') + ')');

			// Set position.
				if (x = $img.data('position'))
					$image.css('background-position', x);

			// Hide original.
				$img.hide();

		});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() {
				$window.trigger('scroll');
			});

			$window.on('load', function() {

				$banner.scrollex({
					bottom:		$header.height() + 10,
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() {
						$window.on('scroll.headerEnter', function() {
							if (window.scrollY <= 0) {
								$window.off('scroll.headerEnter');
								$header.removeClass('reveal').addClass('alt');
							}
						});
					},
					leave:		function() {
						$window.off('scroll.headerEnter');
						$header.removeClass('alt');
						$header.addClass('reveal');
					}
				});

				window.setTimeout(function() {
					$window.triggerHandler('scroll');
				}, 100);

			});

		}

	// Banner.
		$banner.each(function() {

			var $this = $(this),
				$image = $this.find('.image'), $img = $image.find('img');

			// Parallax.
				$this._parallax(0.275);

			// Image.
				if ($image.length > 0) {

					// Set image.
						$this.css('background-image', 'url(' + $img.attr('src') + ')');

					// Hide original.
						$image.hide();

				}

		});

	// Menu.
		var $menu = $('#menu'),
			$menuInner;

		$menu.wrapInner('<div class="inner"></div>');
		$menuInner = $menu.children('.inner');
		$menu._locked = false;

		$menu._lock = function() {

			if ($menu._locked)
				return false;

			$menu._locked = true;

			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);

			return true;

		};

		$menu._show = function() {

			if ($menu._lock())
				$body.addClass('is-menu-visible');

		};

		$menu._hide = function() {

			if ($menu._lock())
				$body.removeClass('is-menu-visible');

		};

		$menu._toggle = function() {

			if ($menu._lock())
				$body.toggleClass('is-menu-visible');

		};

		$menuInner
			.on('click', function(event) {
				event.stopPropagation();
			})
				.on('click', 'a', function(event) {

					var $link = $(this),
						href = $link.attr('href'),
						target = $link.attr('target');

				event.preventDefault();
				event.stopPropagation();

				// Open in a new tab.
					if (target == '_blank') {

						$menu._hide();

						window.setTimeout(function() {
							window.open(href, '_blank', 'noopener,noreferrer');
						}, 250);

					}

				// Internal current-tab navigation: keep the menu state until the page transition starts,
				// so the blurred background doesn't briefly snap back into focus.
					else if (shouldTransitionLink($link)) {
						navigateWithTransition(href, pageTransitionDuration);
					}

				// Fallback for other link types.
					else {

						$menu._hide();

						window.setTimeout(function() {
							window.location.href = href;
						}, 250);

					}

				});

		$menu
			.appendTo($body)
			.on('click', function(event) {

				event.stopPropagation();
				event.preventDefault();

				$body.removeClass('is-menu-visible');

			})
			.append('<a class="close" href="#menu">Close</a>');

		$body
			.on('click', 'a[href="#menu"]', function(event) {

				event.stopPropagation();
				event.preventDefault();

				// Toggle.
					$menu._toggle();

			})
			.on('click', function(event) {

				// Hide.
					$menu._hide();

			})
			.on('keydown', function(event) {

				// Hide on escape.
					if (event.keyCode == 27)
						$menu._hide();

			});

})(jQuery);

/* Chat Widget Loader */
(function(){var s=document.createElement("script");s.src=(document.querySelector('script[src*="main.js"]').src.replace("main.js","chat-widget.js"));s.defer=true;document.body.appendChild(s);})();

/* Cloudflare Web Analytics */
(function(){var s=document.createElement("script");s.defer=true;s.src="https://static.cloudflareinsights.com/beacon.min.js";s.setAttribute("data-cf-beacon",'{"token": "cbcd40d8fdf349d98568e9c8e65e3beb"}');document.body.appendChild(s);})();
