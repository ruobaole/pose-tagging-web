import React, { useState, useRef, useEffect } from 'react';
import create from 'zustand';
import './App.css';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Stage, Sprite, Container, useApp } from '@inlet/react-pixi';
import { Viewport } from './Viewport';
import { Keypoint } from './Keypoint';
import { InsertKPGTool } from './InsertKPGTool';
import { ClickEventData } from 'pixi-viewport';
import exampleImage from './example_data/simple002.jpeg';
import labelingConfig from './labeling_config.json';

// store states
type SetupState = {
  imagePath: string;
  stageSize: [number, number]; // width, height
  setStageSize: (w: number, h: number) => void;
};

const useSetupStore = create<SetupState>((set) => ({
  imagePath: exampleImage,
  stageSize: [256, 256],
  setStageSize: (w, h) => set((state) => ({ stageSize: [w, h] })),
}));

const kpLen = labelingConfig.keypointGraph.length;

function App() {
  const setupSelector = (state: SetupState) => ({
    imagePath: state.imagePath,
    stageSize: state.stageSize,
    setStageSize: state.setStageSize,
  });
  const { imagePath, stageSize, setStageSize } = useSetupStore(setupSelector);
  const [panMode, setPanMode] = useState<boolean>(false);
  const [toolMode, setToolMode] = useState<string>('i');
  const [kx, setKx] = useState<number>(80);
  const [ky, setKy] = useState<number>(80);
  const [curKPIndex, setcurKPIndex] = useState<number>(0);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stageRef && stageRef.current) {
      setStageSize(stageRef.current.offsetWidth, stageRef.current.offsetHeight);
      console.log(
        `${stageRef.current.offsetWidth} * ${stageRef.current.offsetHeight}`
      );
    }
  }, [stageRef]);
  function handleKeyPress(e: React.KeyboardEvent<any>) {
    if (e.key === ' ' && !e.repeat) {
      setPanMode(true);
    }
  }
  function handleKeyUp(e: React.KeyboardEvent<any>) {
    if (e.key === ' ' && !e.repeat) {
      setPanMode(false);
    }
  }
  function handleToolModeChange(e: RadioChangeEvent) {
    setToolMode(e.target.value);
  }
  function handleClicked(e: ClickEventData) {
    if (panMode) {
      return;
    }
    if (toolMode === 'i') {
      if (e.event.data.button === 0) {
        // left click
        console.log(`[EVENT]leftmouse ${e.world.x}, ${e.world.y}`);
        setKx(e.world.x);
        setKy(e.world.y);
        setcurKPIndex((curKPIndex + 1) % kpLen);
      } else if (e.event.data.button === 2) {
        // right click
        setcurKPIndex((curKPIndex - 1 + kpLen) % kpLen);
        console.log(`[EVENT]rightmouse ${e.world.x}, ${e.world.y}`);
      }
    }
  }
  console.log(`PAN: ${panMode}`);
  return (
    <div className="App">
      <header className="App-header"></header>
      <main className="App-main">
        <div className="Tools">
          <div className="ToolMode">
            <Radio.Group
              options={[
                { label: 'Insert Mode (i)', value: 'i' },
                { label: 'Edit Mode (e)', value: 'e' },
              ]}
              onChange={handleToolModeChange}
              value={toolMode}
              optionType="button"
              buttonStyle="solid"
            />
          </div>
          <div className="ToolDetail">
            {toolMode === 'i' ? <InsertKPGTool kpIndex={curKPIndex} /> : null}
          </div>
        </div>
        <div className="Stage" ref={stageRef}>
          <Stage
            width={stageSize[0]}
            height={stageSize[1]}
            tabIndex={0}
            style={{ cursor: panMode ? 'move' : 'default' }}
            onKeyPress={handleKeyPress}
            onKeyUp={handleKeyUp}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
            options={{ backgroundColor: 0xfcf8ec }}
          >
            <Viewport
              width={stageSize[0]}
              height={stageSize[1]}
              enablePan={panMode}
              onClicked={handleClicked}
            >
              <Sprite image={imagePath} x={0} y={0} />
              <Keypoint x={kx} y={ky} radius={4} />
            </Viewport>
          </Stage>
        </div>
      </main>
      <footer className="App-footer"></footer>
    </div>
  );
}

export default App;
