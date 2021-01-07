import React, { useCallback } from 'react';
import { Graphics } from '@inlet/react-pixi';

interface IKeypointProps {
  x: number;
  y: number;
  color?: number;
  alpha?: number;
  radius?: number;
}

export function Keypoint(props: IKeypointProps) {
  const radius = props.radius && 4;
  const color = props.color === undefined ? 0xff00ff : props.color;
  const alpha = props.alpha === undefined ? 1 : props.alpha;
  const draw = useCallback(
    (g) => {
      g.clear();
      // outer circle
      g.lineStyle(1, color, alpha);
      g.drawCircle(props.x, props.y, radius);
      g.lineStyle(0);
      // center
      g.beginFill(0xffff0b, 0.7);
      g.drawCircle(props.x, props.y, 1);
      g.endFill();
    },
    [props]
  );
  return <Graphics draw={draw} />;
}
