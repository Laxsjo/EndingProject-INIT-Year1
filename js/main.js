// @ts-check
'use strict';

/** @type {HTMLElement} */
const scrollDetector = document.querySelector('#scrollAnchor');
const scrollObserver = new IntersectionObserver((entries) => {
	let entry = entries[0];
	document.documentElement.classList.toggle(
		'scrolling',
		!entry.isIntersecting
	);
});

scrollObserver.observe(scrollDetector);
