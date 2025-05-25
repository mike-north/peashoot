import type { Unbranded } from "./util";

export interface Point {
  x: number;
  y: number;
  readonly _POINT: unique symbol;
}

export function makePoint(pt: Unbranded<Point>): Point {
  const { x, y } = pt;
  return { x, y } satisfies Unbranded<Point> as unknown as Point;
}

export interface Line {
  points: [Point, Point];
}
