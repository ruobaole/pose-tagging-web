import React, { useCallback } from 'react';
import { Graphics } from '@inlet/react-pixi';

interface IKeypointProps {
  x: number;
  y: number;
  radius?: number;
}

export function Keypoint(props: IKeypointProps) {
  const radius = props.radius && 4;
  const draw = useCallback(
    (g) => {
      g.clear();
      g.lineStyle(1, 0xff00ff, 1);
      g.drawCircle(props.x, props.y, radius);
      g.lineStyle(0);
      g.beginFill(0xffff0b, 0.7);
      g.drawCircle(props.x, props.y, 1);
      g.endFill();
    },
    [props]
  );
  return <Graphics draw={draw} />;
}
