import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';

/**
 * Turn a FontAwesome icon definitions object (as exported by the @fortawesome
 * free-*-svg-icons packages) into a flat, sorted array of simplified icon
 * descriptors that are cheap to search and render.
 *
 * The exported objects contain multiple keys per icon (aliases that share the same
 * iconName/glyph, e.g. several export keys all named "dollar-sign"), so entries are
 * de-duplicated by name here -- otherwise React sees duplicate list keys downstream,
 * which corrupts reconciliation once the list gets filtered by search.
 * @param {object} iconDefinitions Object mapping icon keys to FontAwesome icon definitions.
 * @return {Array<object>} Sorted array of {prefix, name, width, height, pathData}.
 */
const buildIconList = iconDefinitions => {
    const byName = new Map();
    for (const key of Object.keys(iconDefinitions)) {
        const definition = iconDefinitions[key];
        if (!definition || !definition.icon || byName.has(definition.iconName)) continue;
        byName.set(definition.iconName, {
            prefix: definition.prefix,
            name: definition.iconName,
            width: definition.icon[0],
            height: definition.icon[1],
            // The free packages never emit two-tone (array) path data, only pro/duotone styles do.
            pathData: definition.icon[4]
        });
    }
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Grouped by FontAwesome style, in the order they should be displayed in the picker.
const FONT_AWESOME_ICON_GROUPS = [
    {prefix: 'fas', defaultLabel: 'Solid', icons: buildIconList(fas)},
    {prefix: 'far', defaultLabel: 'Regular', icons: buildIconList(far)},
    {prefix: 'fab', defaultLabel: 'Brands', icons: buildIconList(fab)}
];

export default FONT_AWESOME_ICON_GROUPS;
