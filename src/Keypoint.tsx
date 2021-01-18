import React, { useCallback, useState } from 'react';
import * as PIXI from 'pixi.js';
// import { GlowFilter } from 'pixi-filters';
import { Graphics } from '@inlet/react-pixi';

interface IKeypointProps {
  x: number;
  y: number;
  interative: boolean;
  highlight: boolean;
  onPointerDown?: (e: PIXI.InteractionEvent) => void;
  onDragEnd?: (newX: number, newY: number) => void;
  color?: number;
  alpha?: number;
  radius?: number;
}

export function Keypoint(props: IKeypointProps) {
  const [isDragging, setIsDragging] = useState(false);
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  const [draggingData, setDraggingData] = useState<null | PIXI.InteractionData>(
    null
  );
  // const glowFilter = new GlowFilter({
  //   distance: 15,
  //   // innerStrength: 2,
  //   outerStrength: 4,
  //   color: 0xebebb8,
  // });
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      const radius = props.radius === undefined ? 4 : props.radius;
      const color = props.color === undefined ? 0xff00ff : props.color;
      const alpha = props.alpha === undefined ? 1 : props.alpha;
      g.clear();
      // outer circle
      g.lineStyle(1, color, alpha);
      g.drawCircle(0, 0, radius);
      // // select area
      // g.lineStyle(0);
      // g.beginFill(0xffff0b, 0);
      // g.drawCircle(0, 0, radius - 1.5);
      // g.endFill();
      // // center
      // g.lineStyle(0);
      // g.beginFill(0xffff0b, 0.7);
      // g.drawCircle(0, 0, 1);
      // g.endFill();

      // center
      g.lineStyle(0);
      g.beginFill(0xffff0b, 0.7);
      g.drawCircle(0, 0, radius - 2);
      g.endFill();
      if (props.highlight) {
        // g.filters = [glowFilter];
        g.scale.set(2, 2);
      } else {
        // g.filters = [];
        g.scale.set(1, 1);
      }
      g.position.set(props.x, props.y);
    },
    [props]
  );
  const onPointerDown = (e: PIXI.InteractionEvent) => {
    if (props.onPointerDown) {
      props.onPointerDown(e);
    }
    onDragStart(e);
  };
  const onDragStart = (e: PIXI.InteractionEvent) => {
    setDraggingData(e.data);
    setIsDragging(true);
  };
  const onDragEnd = (e: PIXI.InteractionEvent) => {
    setDraggingData(null);
    setIsDragging(false);
    if (props.onDragEnd) {
      props.onDragEnd(e.currentTarget.x, e.currentTarget.y);
    }
  };
  const onDragMove = (e: PIXI.InteractionEvent) => {
    if (isDragging) {
      const newPosition = draggingData?.getLocalPosition(
        e.currentTarget.parent
      );
      if (newPosition !== undefined) {
        e.currentTarget.x = newPosition.x;
        e.currentTarget.y = newPosition.y;
      }
    }
  };
  return (
    <Graphics
      draw={draw}
      interactive={props.interative}
      buttonMode={props.interative}
      pointerdown={onPointerDown}
      pointerup={onDragEnd}
      pointerupoutside={onDragEnd}
      pointermove={onDragMove}
    />
  );
}
