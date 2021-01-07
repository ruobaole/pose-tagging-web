import React, { useCallback } from 'react';
import { Graphics } from '@inlet/react-pixi';

interface IEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: number;
  alpha?: number;
  lineWidth?: number;
}

export function Edge(props: IEdgeProps) {
  const color = props.color === undefined ? 0xff5e08 : props.color;
  const alpha = props.alpha === undefined ? 1 : props.alpha;
  const lineWidth = props.lineWidth === undefined ? 1 : props.lineWidth;
  const draw = useCallback(
    (g) => {
      g.clear();
      g.lineStyle(lineWidth, color, alpha);
      g.moveTo(props.x1, props.y1);
      g.lineTo(props.x2, props.y2);
    },
    [props]
  );
  return <Graphics draw={draw} />;
}
