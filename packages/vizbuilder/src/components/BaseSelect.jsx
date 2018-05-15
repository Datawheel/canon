import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import { Icon } from "@blueprintjs/core";
import { Select } from "@blueprintjs/labs";

import "@blueprintjs/labs/dist/blueprint-labs.css";

/**
 * @typedef IProps
 * @extends BaseSelectProps
 * @prop {string} caret
 */

/** @type {IProps} */
BaseSelect.defaultProps = {
	caret: "double-caret-vertical",
	itemListPredicate(query, items) {
		query = query.trim();
		const tester = RegExp(escapeRegExp(query) || ".", "i");
		return items.filter(item => tester.test(item.name));
	},
	itemRenderer({ handleClick, item, isActive }) {
		return (
			<span
				className={classnames("select-option", {
					active: isActive,
					disabled: item.disabled
				})}
				onClick={handleClick}
			>
				{item.icon && <Icon iconName={item.icon} />}
				<span className="select-option-label">{item.name}</span>
			</span>
		);
	},
	popoverProps: {
		popoverClassName: "select-popover pt-minimal"
	}
};

/**
 * @class BaseSelect
 * @extends {React.Component<BaseSelectProps>}
 * @param {object} props
 * @param {Array<T>} props.items
 * @param {(item: Selectable, event?: Event) => void} props.onItemSelect
 * @param {Selectable} props.value
 * @static defaultProps
 */
function BaseSelect(props) {
	props = {
		...props,
		className: classnames("select-box", props.className)
	};

	const value = props.value;

	if (!props.value || !props.value.name)
		props.value = { value: null, name: "Select...", disabled: true };

	if (!props.children)
		props.children = (
			<div className="select-option current" title={value.name}>
				{value.icon && <Icon iconName={value.icon} />}
				<span className="value">{value.name}</span>
				<Icon iconName={props.caret} />
			</div>
		);

	return React.createElement(Select, props, props.children);
}

export default BaseSelect;
