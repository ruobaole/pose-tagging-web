import React from 'react';
import * as PIXI from 'pixi.js';
// import { PixiComponent, useApp } from '@inlet/react-pixi';
import { PixiComponent, useApp } from '@inlet/react-pixi/legacy';
import { ClickEventData, Viewport as PixiViewport } from 'pixi-viewport';

export interface IViewportProps {
  width: number;
  height: number;
  enablePan: boolean;
  onClicked?: (data: ClickEventData) => void;
  children?: React.ReactNode;
}

export interface IPixiComponentViewportProps extends IViewportProps {
  app: PIXI.Application;
}

const PixiComponentViewport = PixiComponent('Viewport', {
  create: (props: IPixiComponentViewportProps) => {
    const viewport = new PixiViewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction,
    });
    if (props.onClicked) {
      viewport.on('clicked', props.onClicked);
    }
    viewport.drag().pinch().wheel().clampZoom();

    return viewport;
  },
  applyProps: (instance, _, props) => {
    const { width, height, enablePan, onClicked } = props;
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
    instance.removeListener('clicked');
    if (onClicked) {
      instance.on('clicked', onClicked);
    }
  },
});

export const Viewport = (props: IViewportProps) => {
  const app = useApp();
  return <PixiComponentViewport app={app} {...props} />;
};
