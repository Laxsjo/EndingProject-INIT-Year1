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
			this.#handleKeyDown(event);
		});

		console.log('Created Menu with items', this.items);
	}

	/**
	 * @param {number} index
	 */
	selectItem(index) {
		if (index >= this.items.length) {
			throw new Error(
				`Failed to select item: An item with index ${index} does not exist.`
			);
		}

		this.selectedIndex = index;

		for (const item of this.items) {
			item.tabIndex = -1;
		}

		let item = this.items[index];
		item.tabIndex = 0;
		item.focus();
	}

	/**
	 * @param {-1|1} direction
	 */
	selectNextItem(direction) {
		let index = this.selectedIndex + direction;

		if (index < 0) {
			index = this.items.length - 1;
		} else if (index >= this.items.length) {
			index = 0;
		}

		this.selectItem(index);
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	#handleKeyDown(event) {
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
		}
	}
}

export class NestedMenu extends Menu {
	/** @type {{[index: number]: Submenu}} */
	submenus;

	/**
	 *
	 * @param {HTMLElement} containerElement
	 */
	constructor(containerElement) {
		super(containerElement);

		this.submenus = [];

		for (const item of this.items) {
			let submenuElement =
				item.parentElement.querySelector('.submenuWidget');
			// console.log('found submenu', submenuElement, 'of item', item);

			let index = Number(item.dataset.index ?? -1);
			if (submenuElement !== null && index !== -1) {
				this.submenus[index] = new Submenu(submenuElement, this, index);
				item.setAttribute('aria-haspopup', 'true');
				item.setAttribute('aria-expanded', 'false');

				console.log('found item', item, 'with submenu');

				item.addEventListener('keydown', (event) => {
					switch (event.key) {
						case ' ':
							this.openSubmenu(index);
							event.preventDefault();
							break;
						default:
							break;
					}
				});
				item.addEventListener('blur', (event) => {
					let focusDestination = event.relatedTarget;

					let allItems = this.submenus[index].items;

					// console.log(
					// 	'related target',
					// 	event.relatedTarget,
					// 	'is included',
					// 	allItems.includes(focusDestination)
					// );

					if (!allItems.includes(focusDestination)) {
						item.setAttribute('aria-expanded', 'false');
					}
					// for (const item of this.submenus[index].items) {
					// 	item.tabIndex = -1;
					// }
				});
			}
		}
	}

	/**
	 * @param {number} index
	 */
	openSubmenu(index) {
		if (this.submenus[index] !== undefined) {
			for (const item of this.items) {
				item.tabIndex = -1;
			}
			this.items[index].setAttribute('aria-expanded', 'true');
			// console.log('opened submenu', index);
			let submenu = this.submenus[index];
			submenu.selectItem(0);
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	handleKeyDown(event) {
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
		}
	}
}

export class Submenu extends NestedMenu {
	/** @type {NestedMenu} */
	parent;
	/** @type {number} */
	parentIndex;

	/**
	 *
	 * @param {HTMLElement} containerElement
	 * @param {NestedMenu} parent
	 * @param {number} index
	 */
	constructor(containerElement, parent, index) {
		super(containerElement);

		this.parent = parent;
		this.parentIndex = index;

		this.container.addEventListener('focusin', (event) => {
			this.#handleFocusIn(event);
		});
	}

	/**
	 * @param {-1|1} direction The direction to exit in.
	 */
	exitSubmenu(direction) {
		let index = (this.parentIndex += direction === 1 ? 1 : 0);

		// this.container.classList.remove("expanded");
		for (const item of this.items) {
			item.tabIndex = -1;
		}
		this.parent.items[this.parentIndex].setAttribute(
			'aria-expanded',
			'false'
		);
		this.parent.selectItem(index);
	}

	/**
	 * @param {-1|1} direction
	 */
	selectNextItem(direction) {
		let index = this.selectedIndex + direction;
		console.log('selected index', index, 'length', this.items.length);

		if (index < 0) {
			this.exitSubmenu(-1);
			return;
		} else if (index >= this.items.length) {
			this.exitSubmenu(1);
			return;
		}
		super.selectNextItem(direction);
	}

	/**
	 * @type {FocusEvent} event
	 */
	#handleFocusIn(event) {
		this.selectItem(0);
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	handleKeyDown(event) {
		super.handleKeyDown(event);

		switch (event.key) {
			case Esc:
				this.exitSubmenu(-1);
				event.preventDefault();
				break;
		}
	}
}
