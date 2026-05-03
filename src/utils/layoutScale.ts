export const LOGICAL_WIDTH = 1600;
export const LOGICAL_HEIGHT = 900;

export interface LogicalRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const snap8 = (value: number): number => Math.round(value / 8) * 8;

export const scaleX = (value: number, width: number): number => snap8((value / LOGICAL_WIDTH) * width);

export const scaleY = (value: number, height: number): number => snap8((value / LOGICAL_HEIGHT) * height);

export const scaleRect = (rect: LogicalRect, width: number, height: number): LogicalRect => ({
  x: scaleX(rect.x, width),
  y: scaleY(rect.y, height),
  width: scaleX(rect.width, width),
  height: scaleY(rect.height, height),
});

