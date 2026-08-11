import React from 'react';
import PropTypes from 'prop-types';
import ToolSelectComponent from '../tool-select-base/tool-select-base.jsx';
import messages from '../../lib/messages.js';
import iconToolIcon from './icon.svg';

// This class name (rather than a CSS-modules-scoped one) is used by the icon picker panel
// to recognize clicks on the toolbar button itself, so that toggling the button doesn't fight
// with the panel's click-outside-to-close handler.
const TRIGGER_CLASS_NAME = 'js-icon-mode-trigger';

const IconModeComponent = props => (
    <ToolSelectComponent
        className={TRIGGER_CLASS_NAME}
        imgDescriptor={messages.icon}
        imgSrc={iconToolIcon}
        isSelected={props.isSelected}
        onMouseDown={props.onMouseDown}
    />
);

IconModeComponent.propTypes = {
    isSelected: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired
};

export {
    TRIGGER_CLASS_NAME
};
export default IconModeComponent;
