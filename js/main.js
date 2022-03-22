// @ts-check
'use strict';

import * as Widgets from './widgets.js';

/** @type {NodeListOf<HTMLElement>} */
const menuElements = document.querySelectorAll('.menuWidget');
for (const element of menuElements) {
	const widget = new Widgets.NestedMenu(element);
}

/** @type {?HTMLElement} */
const scrollDetector = document.querySelector('#scrollAnchor');
if (scrollDetector) {
	const scrollObserver = new IntersectionObserver((entries) => {
		let entry = entries[0];
		document.documentElement.classList.toggle(
			'scrolling',
			!entry.isIntersecting
		);
	});

	scrollObserver.observe(scrollDetector);
}
