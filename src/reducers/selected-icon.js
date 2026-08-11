import {faStar} from '@fortawesome/free-solid-svg-icons';

const CHANGE_SELECTED_ICON = 'scratch-paint/selected-icon/CHANGE_SELECTED_ICON';

// Default to a reasonable icon so the icon tool has something to draw before the
// user ever opens the picker.
const initialState = {
    prefix: faStar.prefix,
    name: faStar.iconName,
    width: faStar.icon[0],
    height: faStar.icon[1],
    pathData: faStar.icon[4]
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case CHANGE_SELECTED_ICON:
        return action.icon;
    default:
        return state;
    }
};

// Action creators ==================================
/**
 * @param {{prefix: string, name: string, width: number, height: number, pathData: string}} icon
 *   The FontAwesome icon that was chosen in the icon picker.
 * @return {object} Redux action to change the selected icon.
 */
const setSelectedIcon = function (icon) {
    return {
        type: CHANGE_SELECTED_ICON,
        icon: icon
    };
};

export {
    reducer as default,
    setSelectedIcon
};
