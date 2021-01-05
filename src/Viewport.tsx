import React from 'react';
import * as PIXI from 'pixi.js';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Viewport as PixiViewport } from 'pixi-viewport';

export interface ViewportProps {
  width: number;
  height: number;
  enablePan: boolean;
  children?: React.ReactNode;
}

export interface PixiComponentViewportProps extends ViewportProps {
  app: PIXI.Application;
}

const PixiComponentViewport = PixiComponent('Viewport', {
  create: (props: PixiComponentViewportProps) => {
    const viewport = new PixiViewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction,
    });
    viewport.drag().pinch().wheel().clampZoom();

    return viewport;
  },
  applyProps: (instance, _, props) => {
    const { width, height, enablePan } = props;
    instance.screenWidth = width;
    instance.screenHeight = height;
    instance.worldWidth = width * 2;
    instance.worldHeight = height * 2;
    if (enablePan) {
      instance.plugins.resume('drag');
      instance.plugins.resume('pinch');
    } else {
      instance.plugins.pause('drag');
      instance.plugins.pause('pinch');
    }
  },
});

export const Viewport = (props: ViewportProps) => {
  const app = useApp();
  return <PixiComponentViewport app={app} {...props} />;
};

// export default Viewport;
