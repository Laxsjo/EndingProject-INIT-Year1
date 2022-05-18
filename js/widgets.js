// // @ts-check
'use strict';

export class Menu {
	/**@type {HTMLElement} */
	container;
	/**@type {HTMLElement[]} */
	items;
	/** @type {number} */
	selectedIndex;

	/**
	 *
	 * @param {HTMLElement} containerElement
	 */
	constructor(containerElement) {
		/**
		 * @type {HTMLElement}
		 * @public
		 */
		this.container = containerElement;

		this.items = [
			...this.container.querySelectorAll(
				":scope > li > [role='menuitem']"
			),
		];

		for (const [index, item] of Object.entries(this.items)) {
			item.tabIndex = -1;
			item.dataset.index = index;
		}
		this.items[0].tabIndex = 0;
		this.selectedIndex = 0;

		for (const li of this.container.querySelectorAll('li')) {
			li.setAttribute('role', 'none');
		}

		this.container.addEventListener('keydown', (event) => {
			// console.log('keydown in Menu');
			this.handleKeyDown(event);
		});

		// console.log('Created Menu with items', this.items);
	}

	/**
	 * @param {number} index
	 */
	selectItem(index) {
		// if (index >= this.items.length) {
		// 	throw new Error(
		// 		`Failed to select item: An item with index ${index} does not exist.`
		// 	);
		// }

		if (index < 0) {
			index = this.items.length - 1;
		} else if (index >= this.items.length) {
			index = 0;
		}

		// console.trace(
		// 	'set selected index to',
		// 	index,
		// 	'from',
		// 	this.selectedIndex
		// );
		this.selectedIndex = index;

		for (const item of this.items) {
			item.tabIndex = -1;
		}

		let item = this.items[index];
		item.tabIndex = 0;
		item.focus();

		// console.log('selected item', item, 'with index', index);
	}

	/**
	 * @param {-1|1} direction
	 */
	selectNextItem(direction) {
		let index = this.selectedIndex + direction;
		// console.log(
		// 	'selected next index',
		// 	index,
		// 	'in direction',
		// 	direction,
		// 	'length',
		// 	this.items.length,
		// 	'inside Menu'
		// );
		this.selectItem(index);
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	handleKeyDown(event) {
		// console.log(
		// 	'handled key down',
		// 	event.key,
		// 	'in Menu',
		// 	event.currentTarget
		// );
		let foundKey = false;
		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				foundKey = true;
				this.selectNextItem(-1);
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				foundKey = true;
				this.selectNextItem(1);
				break;
			case 'Home':
				foundKey = true;
				this.selectItem(0);
				break;
			case 'End':
				foundKey = true;
				this.selectItem(this.items.length - 1);
				break;
			default:
				break;
		}

		if (foundKey) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
}

export class NestedMenu extends Menu {
	/** @type {Submenu[]} */
	submenus;

	/**
	 *
	 * @param {HTMLElement} containerElement
	 */
	constructor(containerElement) {
		super(containerElement);

		this.container.addEventListener('focusout', (event) => {
			// console.log(
			// 	'target',
			// 	event.relatedTarget,
			// 	'is contained',
			// 	this.container.contains(event.relatedTarget)
			// );
			if (!this.container.contains(event.relatedTarget)) {
				for (const submenu of this.submenus) {
					if (submenu !== undefined) {
						submenu.closeSubmenu();
					}
				}
				if (this.parent === undefined) {
					// console.log(
					// 	'set tabindex to',
					// 	0,
					// 	'for item',
					// 	this.items[this.selectedIndex]
					// );
					this.items[this.selectedIndex].tabIndex = 0;
				}
			}
		});

		this.submenus = [];

		for (const item of this.items) {
			let submenuElement =
				item.parentElement.querySelector('.submenuWidget');
			// console.log('found submenu', submenuElement, 'of item', item);

			let index = Number(item.dataset.index ?? -1);
			if (submenuElement !== null && index !== -1) {
				this.submenus[index] = new Submenu(
					submenuElement,
					this,
					index,
					item.parentElement.classList.contains('alwaysOpen')
				);
				item.setAttribute('aria-haspopup', 'tree');
				item.setAttribute('aria-expanded', 'false');

				// console.log('found item', item, 'with submenu');

				item.addEventListener('keydown', (event) => {
					// console.log('keydown in Submenu opener');
					switch (event.key) {
						case ' ':
							this.openSubmenu(index);
							event.preventDefault();
							event.stopPropagation();
							break;
						default:
							break;
					}
				});
				// item.addEventListener('blur', (event) => {
				// 	let focusDestination = event.relatedTarget;

				// 	let allItems = this.submenus[index].items;

				// 	// console.log(
				// 	// 	'related target',
				// 	// 	event.relatedTarget,
				// 	// 	'is included',
				// 	// 	allItems.includes(focusDestination)
				// 	// );

				// 	if (!allItems.includes(focusDestination)) {
				// 		item.setAttribute('aria-expanded', 'false');
				// 	}
				// });
			}
		}
	}

	/**
	 * @param {-1|1} direction
	 */
	selectNextItem(direction) {
		let index = this.selectedIndex + direction;

		if (
			this.submenus[this.selectedIndex] &&
			this.submenus[this.selectedIndex].alwaysOpen &&
			direction === 1
		) {
			this.openSubmenu(this.selectedIndex, 0);
		} else if (
			this.submenus[index] &&
			this.submenus[index].alwaysOpen &&
			direction === -1
		) {
			this.openSubmenu(index, this.submenus[index].items.length - 1);
		} else {
			this.selectItem(index);
		}
	}

	/**
	 * @param {number} index
	 * @param {number} submenuIndex
	 */
	openSubmenu(index, submenuIndex = -1) {
		if (this.submenus[index] !== undefined) {
			for (const item of this.items) {
				item.tabIndex = -1;
			}
			this.items[index].setAttribute('aria-expanded', 'true');
			// console.log('opened submenu', index);
			let submenu = this.submenus[index];
			submenu.selectItem(
				submenuIndex === -1 ? submenu.selectedIndex : submenuIndex
			);
		}
	}
}

export class Submenu extends NestedMenu {
	/** @type {NestedMenu} */
	parent;
	/** @type {number} */
	parentIndex;
	/** @type {boolean} */
	alwaysOpen;

	/**
	 *
	 * @param {HTMLElement} containerElement
	 * @param {NestedMenu} parent
	 * @param {number} index
	 * @param {boolean} alwaysOpen
	 */
	constructor(containerElement, parent, index, alwaysOpen) {
		super(containerElement);

		this.parent = parent;
		this.parentIndex = index;
		this.alwaysOpen = alwaysOpen;

		for (const item of this.items) {
			item.tabIndex = -1;
		}

		let getHeight = () => {
			let rect = this.container.getBoundingClientRect();
			// console.log(rect.height);
			this.container.style.setProperty(
				'--height',
				this.container.scrollHeight + 'px'
			);
		};

		window.addEventListener('load', (event) => {
			getHeight();
		});
		if (document.readyState === 'complete') {
			getHeight();
		}

		// this.container.addEventListener('focusin', (event) => {
		// 	this.#handleFocusIn(event);
		// });
	}

	/**
	 * @param {-1|1} direction The direction to exit in.
	 */
	exitSubmenu(direction) {
		// console.log(
		// 	'exited submenu in direction',
		// 	direction,
		// 	'parent index',
		// 	this.parentIndex,
		// 	'parent items',
		// 	this.parent.items,
		// 	'parent',
		// 	this.parent.items[this.parentIndex]
		// );
		let index = this.parentIndex + (direction === 1 ? 1 : 0);

		// this.container.classList.remove("expanded");

		this.parent.selectItem(index);

		this.closeSubmenu();
	}

	closeSubmenu() {
		for (const item of this.items) {
			item.tabIndex = -1;
		}

		this.parent.items[this.parentIndex].setAttribute(
			'aria-expanded',
			'false'
		);
	}

	/**
	 * @param {-1|1} direction
	 */
	selectNextItem(direction) {
		let index = this.selectedIndex + direction;
		// console.log(
		// 	'selected index',
		// 	index,
		// 	'in direction',
		// 	direction,
		// 	'previous index',
		// 	this.selectedIndex,
		// 	'length',
		// 	this.items.length,
		// 	'inside Submenu'
		// );

		if (index < 0) {
			this.exitSubmenu(-1);
		} else if (index >= this.items.length) {
			this.exitSubmenu(1);
		} else {
			super.selectNextItem(direction);
		}
	}

	// /**
	//  * @type {FocusEvent} event
	//  */
	// #handleFocusIn(event) {
	// 	this.selectItem(0);
	// }

	/**
	 * @param {KeyboardEvent} event
	 */
	handleKeyDown(event) {
		// console.trace('handled key down in Submenu', event.currentTarget);
		super.handleKeyDown(event);

		switch (event.key) {
			case 'Esc':
				this.exitSubmenu(-1);
				event.preventDefault();
				event.stopPropagation();
				break;
		}
	}
}
