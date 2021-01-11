import { useEffect } from 'react';
import { Sprite } from '@inlet/react-pixi';
import { useSetupStore, setupSelector } from './App';

export function ImageSprite() {
  const {
    imagePath,
    imageLoading,
    imageLoadError,
    setSetupState,
  } = useSetupStore(setupSelector);
  const imageElement: HTMLImageElement = new Image();
  const handleLoadError = (e: Event | string, src?: string) => {
    console.log('eeeeee');
    // console.error(e);
    setSetupState((state) => {
      state.imageLoadError = e.toString();
    });
  };
  const handleLoadStart = (e: Event) => {
    console.log('lllllll');
    setSetupState((state) => {
      state.imageLoading = true;
    });
  };
  const handleLoad = (e: Event) => {
    console.log('done!');
    setSetupState((state) => {
      state.imageLoading = false;
      state.imageLoadError = undefined;
    });
  };
  imageElement.src = imagePath;
  imageElement.crossOrigin = 'Anonymous';
  imageElement.onerror = handleLoadError;
  imageElement.onloadstart = handleLoadStart;
  imageElement.onload = handleLoad;
  useEffect(() => {
    imageElement.src = imagePath;
  }, [imagePath]);
  return <Sprite image={imageElement} x={0} y={0} />;
}
