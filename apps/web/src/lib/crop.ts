// The arithmetic of the image cropper, kept apart from the browser so it can be tested.
// The frame is the visible box; the image sits in it at `scale` with its top-left corner at `offset`.

export type Size = { width: number; height: number }
export type Point = { x: number; y: number }
export type Rect = Point & Size

/** The smallest scale at which the image covers the whole frame. */
export function coverScale(image: Size, frame: Size): number {
  return Math.max(frame.width / image.width, frame.height / image.height)
}

/** The image centred in the frame. */
export function centredOffset(image: Size, frame: Size, scale: number): Point {
  return { x: (frame.width - image.width * scale) / 2, y: (frame.height - image.height * scale) / 2 }
}

/** Keeps the frame covered: the image can never be dragged far enough to show an empty edge. */
export function clampOffset(offset: Point, image: Size, frame: Size, scale: number): Point {
  return {
    x: Math.min(0, Math.max(frame.width - image.width * scale, offset.x)),
    y: Math.min(0, Math.max(frame.height - image.height * scale, offset.y)),
  }
}

/** Zooming from one scale to another keeps the same point of the image in the frame's centre. */
export function zoomOffset(offset: Point, from: number, to: number, frame: Size): Point {
  const centre = { x: frame.width / 2, y: frame.height / 2 }
  return {
    x: centre.x - (centre.x - offset.x) * (to / from),
    y: centre.y - (centre.y - offset.y) * (to / from),
  }
}

/** The part of the original image inside the frame, in the image's own pixels. */
export function sourceRect(offset: Point, frame: Size, scale: number): Rect {
  return {
    x: -offset.x / scale,
    y: -offset.y / scale,
    width: frame.width / scale,
    height: frame.height / scale,
  }
}
