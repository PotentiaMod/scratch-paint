import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import iconGroups from '../../lib/fontawesome-icons';
import {TRIGGER_CLASS_NAME} from '../icon-mode/icon-mode.jsx';
import styles from './icon-picker-panel.css';

const messages = defineMessages({
    searchPlaceholder: {
        defaultMessage: 'Search icons…',
        description: 'Placeholder text for the FontAwesome icon search field',
        id: 'paint.iconPickerPanel.searchPlaceholder'
    },
    groupSolid: {
        defaultMessage: 'Solid',
        description: 'Header for the group of solid-style FontAwesome icons',
        id: 'paint.iconPickerPanel.groupSolid'
    },
    groupRegular: {
        defaultMessage: 'Regular',
        description: 'Header for the group of regular-style FontAwesome icons',
        id: 'paint.iconPickerPanel.groupRegular'
    },
    groupBrands: {
        defaultMessage: 'Brands',
        description: 'Header for the group of brand FontAwesome icons',
        id: 'paint.iconPickerPanel.groupBrands'
    },
    more: {
        defaultMessage: '+ {count} more, keep typing to narrow it down',
        description: 'Message shown when an icon group has too many matches to display all of them',
        id: 'paint.iconPickerPanel.more'
    },
    noResults: {
        defaultMessage: 'No icons found for “{search}”',
        description: 'Message shown in the icon picker when a search has no matches',
        id: 'paint.iconPickerPanel.noResults'
    },
    hint: {
        defaultMessage: 'Click an icon, then drag on the canvas to draw it. Hold shift to keep its aspect ratio.',
        description: 'Instructions shown at the bottom of the FontAwesome icon picker',
        id: 'paint.iconPickerPanel.hint'
    }
});

const GROUP_LABELS = {
    fas: messages.groupSolid,
    far: messages.groupRegular,
    fab: messages.groupBrands
};

// Cap how many icons are rendered per group at once so the DOM stays light while browsing;
// searching narrows the underlying list down well below this long before it matters.
const MAX_ICONS_PER_GROUP = 240;

// Icons are looked up by key from a single delegated click handler (rather than giving every
// icon button its own bound onClick) since there can be thousands of them on screen at once.
const ICON_LOOKUP = {};
for (const group of iconGroups) {
    for (const icon of group.icons) {
        ICON_LOOKUP[`${icon.prefix}:${icon.name}`] = icon;
    }
}

class IconPickerPanel extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSearchChange',
            'handleDocumentMouseDown',
            'handleKeyDown',
            'handleGridClick',
            'setNode'
        ]);
        this.state = {
            searchTerm: ''
        };
    }
    componentDidMount () {
        document.addEventListener('mousedown', this.handleDocumentMouseDown);
        document.addEventListener('keydown', this.handleKeyDown);
    }
    componentWillUnmount () {
        document.removeEventListener('mousedown', this.handleDocumentMouseDown);
        document.removeEventListener('keydown', this.handleKeyDown);
    }
    setNode (node) {
        this.node = node;
    }
    handleSearchChange (e) {
        this.setState({searchTerm: e.target.value});
    }
    handleDocumentMouseDown (e) {
        if (this.node && this.node.contains(e.target)) return;
        // Let the toolbar button's own click handler manage toggling instead of racing with it.
        if (e.target.closest && e.target.closest(`.${TRIGGER_CLASS_NAME}`)) return;
        this.props.onRequestClose();
    }
    handleKeyDown (e) {
        if (e.key === 'Escape') {
            this.props.onRequestClose();
        }
    }
    handleGridClick (e) {
        const button = e.target.closest('button[data-icon-key]');
        if (!button) return;
        const icon = ICON_LOOKUP[button.getAttribute('data-icon-key')];
        if (icon) this.props.onChooseIcon(icon);
    }
    render () {
        const search = this.state.searchTerm.trim().toLowerCase();
        const filteredGroups = iconGroups
            .map(group => ({
                prefix: group.prefix,
                icons: search ? group.icons.filter(icon => icon.name.indexOf(search) !== -1) : group.icons
            }))
            .filter(group => group.icons.length > 0);
        const hasResults = filteredGroups.length > 0;

        return (
            <div
                className={styles.iconPickerPanel}
                ref={this.setNode}
            >
                <input
                    autoFocus
                    className={styles.searchInput}
                    placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)}
                    type="text"
                    value={this.state.searchTerm}
                    onChange={this.handleSearchChange}
                />
                <div
                    className={styles.iconScrollArea}
                    onClick={this.handleGridClick}
                >
                    {hasResults ? filteredGroups.map(group => {
                        const shown = group.icons.slice(0, MAX_ICONS_PER_GROUP);
                        const remaining = group.icons.length - shown.length;
                        return (
                            <div
                                className={styles.iconGroup}
                                key={group.prefix}
                            >
                                <div className={styles.iconGroupHeader}>
                                    {this.props.intl.formatMessage(GROUP_LABELS[group.prefix])}
                                </div>
                                <div className={styles.iconGrid}>
                                    {shown.map(icon => (
                                        <button
                                            className={classNames(styles.iconTile, {
                                                [styles.isSelected]: this.props.selectedIcon &&
                                                    this.props.selectedIcon.prefix === icon.prefix &&
                                                    this.props.selectedIcon.name === icon.name
                                            })}
                                            data-icon-key={`${icon.prefix}:${icon.name}`}
                                            key={`${icon.prefix}:${icon.name}`}
                                            title={icon.name}
                                            type="button"
                                        >
                                            <svg
                                                className={styles.iconGlyph}
                                                viewBox={`0 0 ${icon.width} ${icon.height}`}
                                            >
                                                <path d={icon.pathData} />
                                            </svg>
                                            <span className={styles.iconLabel}>
                                                {icon.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {remaining > 0 ? (
                                    <div className={styles.iconGroupMore}>
                                        {this.props.intl.formatMessage(messages.more, {count: remaining})}
                                    </div>
                                ) : null}
                            </div>
                        );
                    }) : (
                        <div className={styles.noResults}>
                            {this.props.intl.formatMessage(messages.noResults, {search: this.state.searchTerm})}
                        </div>
                    )}
                </div>
                <div className={styles.iconPickerHint}>
                    {this.props.intl.formatMessage(messages.hint)}
                </div>
            </div>
        );
    }
}

IconPickerPanel.propTypes = {
    intl: intlShape.isRequired,
    onChooseIcon: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    selectedIcon: PropTypes.shape({
        prefix: PropTypes.string,
        name: PropTypes.string
    })
};

export default injectIntl(IconPickerPanel);
