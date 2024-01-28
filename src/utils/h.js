export const h = (tag, props, ...children) => {
	const element = document.createElement(tag);

	Object.entries(props || {}).forEach(([name, value]) => {
		if (name.startsWith('on') && name.toLowerCase() in window) {
			element.addEventListener(name.toLowerCase().substring(2), value);
		} else {
			element.setAttribute(
				name,
				typeof value === 'boolean'
					? value
					: typeof value === 'string'
					? new String(value).toString()
					: value
			);
		}
	});

	children.forEach((child) => {
		appendChild(element, child);
	});

	return element;
};

export const Fragment = (props, ...children) => {
	return children;
};
