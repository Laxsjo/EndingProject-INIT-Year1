document.documentElement.classList.remove('jsDisabled');

document.documentElement.classList.add('noAnim');
setTimeout(() => {
	document.documentElement.classList.remove('noAnim');
}, 500);
