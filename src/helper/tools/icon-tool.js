import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import {clearSelection} from '../selection';
import BoundingBoxTool from '../selection-tools/bounding-box-tool';
import NudgeTool from '../selection-tools/nudge-tool';

/**
 * Tool for drawing a FontAwesome icon onto the canvas.
 */
class IconTool extends paper.Tool {
    static get TOLERANCE () {
        return 2;
    }
    /**
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {function} setCursor Callback to set the visible mouse cursor
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     */
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super();
        this.setSelectedItems = setSelectedItems;
        this.clearSelectedItems = clearSelectedItems;
        this.onUpdateImage = onUpdateImage;
        this.boundingBoxTool = new BoundingBoxTool(
            Modes.ICON,
            setSelectedItems,
            clearSelectedItems,
            setCursor,
            onUpdateImage
        );
        const nudgeTool = new NudgeTool(Modes.ICON, this.boundingBoxTool, onUpdateImage);

        // We have to set these functions instead of just declaring them because
        // paper.js tools hook up the listeners in the setter functions.
        this.onMouseDown = this.handleMouseDown;
        this.onMouseDrag = this.handleMouseDrag;
        this.onMouseMove = this.handleMouseMove;
        this.onMouseUp = this.handleMouseUp;
        this.onKeyUp = nudgeTool.onKeyUp;
        this.onKeyDown = nudgeTool.onKeyDown;

        this.icon = null;
        this.iconData = null;
        this.colorState = null;
        this.isBoundingBoxMode = null;
        this.active = false;
    }
    getHitOptions () {
        return {
            segments: true,
            stroke: true,
            curves: true,
            fill: true,
            guide: false,
            match: hitResult =>
                (hitResult.item.data && (hitResult.item.data.isScaleHandle || hitResult.item.data.isRotHandle)) ||
                hitResult.item.selected, // Allow hits on bounding box and selected only
            tolerance: IconTool.TOLERANCE / paper.view.zoom
        };
    }
    /**
     * Should be called if the selection changes to update the bounds of the bounding box.
     * @param {Array<paper.Item>} selectedItems Array of selected items.
     */
    onSelectionChanged (selectedItems) {
        this.boundingBoxTool.onSelectionChanged(selectedItems);
    }
    setColorState (colorState) {
        this.colorState = colorState;
    }
    /**
     * @param {{prefix: string, name: string, width: number, height: number, pathData: string}} iconData
     *   The currently selected FontAwesome icon, as stored in Redux.
     */
    setIconData (iconData) {
        this.iconData = iconData;
    }
    /**
     * Build a fresh paper.js item from the current icon's raw path data. FontAwesome path data is
     * authored against an SVG viewBox with y increasing downward, which already matches paper.js's
     * coordinate system, so it can be used directly with no flipping.
     * @return {?paper.CompoundPath} The new item, or null if no icon is selected.
     */
    createIconItem () {
        if (!this.iconData) return null;
        const item = new paper.CompoundPath(this.iconData.pathData);
        item.fillRule = 'nonzero';
        return item;
    }
    handleMouseDown (event) {
        if (event.event.button > 0) return; // only first mouse button
        this.active = true;

        if (this.boundingBoxTool.onMouseDown(
            event, false /* clone */, false /* multiselect */, false /* doubleClicked */, this.getHitOptions())) {
            this.isBoundingBoxMode = true;
        } else {
            this.isBoundingBoxMode = false;
            clearSelection(this.clearSelectedItems);
            this.icon = this.createIconItem();
            if (this.icon) {
                this.icon.fitBounds(new paper.Rectangle(event.downPoint, new paper.Size(1, 1)));
                styleShape(this.icon, this.colorState);
            }
        }
    }
    handleMouseDrag (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseDrag(event);
            return;
        }

        if (!this.icon) return;

        // Rebuilt from the original path data every frame (rather than scaling in place) so that
        // switching the shift key mid-drag always measures against the icon's true native ratio,
        // instead of compounding against whatever the previous frame happened to produce.
        this.icon.remove();
        this.icon = this.createIconItem();

        const rect = new paper.Rectangle(event.downPoint, event.point);
        if (event.modifiers.shift) {
            // Preserve the icon's native aspect ratio, fit (and centered) within the dragged rectangle.
            this.icon.fitBounds(rect, false);
        } else {
            // Stretch independently on each axis to exactly match the dragged rectangle.
            this.icon.bounds = rect;
        }
        styleShape(this.icon, this.colorState);
    }
    handleMouseMove (event) {
        this.boundingBoxTool.onMouseMove(event, this.getHitOptions());
    }
    handleMouseUp (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseUp(event);
            this.isBoundingBoxMode = null;
            return;
        }

        if (this.icon) {
            const bounds = this.icon.bounds;
            if (Math.abs(bounds.width * bounds.height) < IconTool.TOLERANCE / paper.view.zoom) {
                // Tiny icon created unintentionally?
                this.icon.remove();
                this.icon = null;
            } else {
                this.icon.selected = true;
                this.setSelectedItems();
                this.onUpdateImage();
                this.icon = null;
            }
        }
        this.active = false;
    }
    deactivateTool () {
        this.boundingBoxTool.deactivateTool();
    }
}

export default IconTool;
