import React, { useState, useRef, useEffect } from 'react';
import create from 'zustand';
import produce from 'immer';
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
const setupSelector = (state: SetupState) => ({
  imagePath: state.imagePath,
  stageSize: state.stageSize,
  setStageSize: state.setStageSize,
});

type LabelState = {
  keypointGraphList: {
    name: string;
    x: number;
    y: number;
    properties: {
      [prop: string]: {
        type: string;
        value: string | number | boolean;
      };
    };
  }[][];
  curKPG: number;
  curKP: number;
  set: (fn: (state: LabelState) => void) => void;
};
const useLabelStore = create<LabelState>((set) => ({
  keypointGraphList: [[]],
  curKPG: 0,
  curKP: 0,
  set: (fn) => set(produce(fn)),
}));
const labelSelector = (state: LabelState) => ({
  keypointGraphList: state.keypointGraphList,
  curKPG: state.curKPG,
  curKP: state.curKP,
  setLabelState: state.set,
});

const KPGMold = labelingConfig.keypointGraph;
const kpLen = labelingConfig.keypointGraph.length;

function App() {
  const { imagePath, stageSize, setStageSize } = useSetupStore(setupSelector);
  const { curKPG, curKP, keypointGraphList, setLabelState } = useLabelStore(
    labelSelector
  );
  const [panMode, setPanMode] = useState<boolean>(false);
  const [toolMode, setToolMode] = useState<string>('i');
  const [kx, setKx] = useState<number>(80);
  const [ky, setKy] = useState<number>(80);
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
        // add keypoint
        const newKP = {
          name: KPGMold[curKP].name,
          x: e.world.x,
          y: e.world.y,
          properties: {
            is_visible: {
              type: 'boolean',
              value: true,
            },
          },
        };
        if (
          curKP === kpLen - 1 &&
          keypointGraphList[curKPG].length === curKP + 1
        ) {
          // tmp: do nothing when current KPG is already full --> push/pop KPG should be controled with button
          console.log(`curKPG is already FULL!`);
        } else {
          setLabelState((state) => {
            state.keypointGraphList[curKPG].push(newKP);
          });
        }
        setLabelState((state) => {
          state.curKP = curKP + 1 < kpLen ? curKP + 1 : kpLen - 1;
        });
      } else if (e.event.data.button === 2) {
        // right click
        console.log(`[EVENT]rightmouse ${e.world.x}, ${e.world.y}`);
        // pop keypoint
        if (curKP === 0) {
          // tmp: do nothing when current KPG is already empty
          console.log(`curKPG is already EMPTY!`);
        } else {
          setLabelState((state) => {
            state.keypointGraphList[curKPG].pop();
          });
        }
        setLabelState((state) => {
          state.curKP = curKP - 1 >= 0 ? curKP - 1 : 0;
        });
      }
    }
  }
  // console.log(`PAN: ${panMode}`);
  console.log(keypointGraphList);
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
            {toolMode === 'i' ? <InsertKPGTool kpIndex={curKP} /> : null}
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
