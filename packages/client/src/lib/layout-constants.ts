export const DEFAULT_CELL_SIZE = 40;
export const DEFAULT_PADDING_TOP = 2;
export const DEFAULT_PADDING_LEFT = 20;
export const DEFAULT_PADDING_BOTTOM = 20;
export const DEFAULT_PADDING_RIGHT = 20;
export const DEFAULT_FRAME_THICKNESS = 4;

export interface BaseLayoutParams {
  cellSize: number;
  paddingTop: number;
  paddingLeft: number;
  paddingBottom: number;
  paddingRight: number;
  frameThickness: number;
}

export const DEFAULT_LAYOUT_PARAMS: BaseLayoutParams = {
  cellSize: DEFAULT_CELL_SIZE,
  paddingTop: DEFAULT_PADDING_TOP,
  paddingLeft: DEFAULT_PADDING_LEFT,
  paddingBottom: DEFAULT_PADDING_BOTTOM,
  paddingRight: DEFAULT_PADDING_RIGHT,
  frameThickness: DEFAULT_FRAME_THICKNESS,
}; 