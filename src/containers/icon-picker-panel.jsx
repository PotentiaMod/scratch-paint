import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import Modes from '../lib/modes';
import {setSelectedIcon} from '../reducers/selected-icon';
import {closeIconPicker} from '../reducers/modals';
import IconPickerPanelComponent from '../components/icon-picker-panel/icon-picker-panel.jsx';

class IconPickerPanel extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChooseIcon'
        ]);
    }
    handleChooseIcon (icon) {
        this.props.onChooseIcon(icon);
        this.props.onRequestClose();
    }
    render () {
        if (!this.props.isOpen) return null;
        return (
            <IconPickerPanelComponent
                selectedIcon={this.props.selectedIcon}
                onChooseIcon={this.handleChooseIcon}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

IconPickerPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onChooseIcon: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    selectedIcon: PropTypes.shape({
        prefix: PropTypes.string,
        name: PropTypes.string
    })
};

const mapStateToProps = state => ({
    isOpen: state.scratchPaint.mode === Modes.ICON && state.scratchPaint.modals.iconPicker,
    selectedIcon: state.scratchPaint.selectedIcon
});
const mapDispatchToProps = dispatch => ({
    onChooseIcon: icon => {
        dispatch(setSelectedIcon(icon));
    },
    onRequestClose: () => {
        dispatch(closeIconPicker());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IconPickerPanel);
