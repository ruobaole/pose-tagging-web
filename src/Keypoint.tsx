import React, { useCallback, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Graphics } from '@inlet/react-pixi';

interface IKeypointProps {
  x: number;
  y: number;
  color?: number;
  alpha?: number;
  radius?: number;
}

export function Keypoint(props: IKeypointProps) {
  const [showText, setShowText] = useState(false);
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      const radius = props.radius === undefined ? 4 : props.radius;
      const color = props.color === undefined ? 0xff00ff : props.color;
      const alpha = props.alpha === undefined ? 1 : props.alpha;
      g.clear();
      // outer circle
      g.lineStyle(1, color, alpha);
      g.drawCircle(props.x, props.y, radius);
      g.lineStyle(0);
      // center
      g.beginFill(0xffff0b, 0.7);
      g.drawCircle(props.x, props.y, 1);
      // text -- tmp
      if (showText) {
        const label = new PIXI.Text(`2-left_eye-visible`, {
          fontFamily: 'Arial',
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#ffb700',
          dropShadow: true,
          dropShadowColor: '#888888',
          dropShadowBlur: 4,
          dropShadowAngle: Math.PI / 6,
          dropShadowDistance: 6,
        });
        label.x = props.x - 4;
        label.y = props.y - 2;
        g.addChild(label);
      } else {
        g.removeChildren();
      }
      g.endFill();
    },
    [props, showText]
  );
  const handleMouseOver = (e: PIXI.InteractionEvent) => {
    setShowText(true);
  };
  const handleMouseOut = (e: PIXI.InteractionEvent) => {
    setShowText(false);
  };
  return (
    <Graphics
      draw={draw}
      interactive={true}
      mouseover={handleMouseOver}
      mouseout={handleMouseOut}
    />
  );
}
