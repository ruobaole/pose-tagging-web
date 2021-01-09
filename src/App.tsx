import React, { useState, useRef, useEffect } from 'react';
import create from 'zustand';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import produce from 'immer';
import './App.css';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Stage, Sprite } from '@inlet/react-pixi';
import { Viewport } from './Viewport';
import { KeypointGraph } from './KeypointGraph';
import { InsertKPGTool } from './InsertKPGTool';
import { LabelDataDisplay } from './LabelDataDisplay';
import { ClickEventData } from 'pixi-viewport';
import exampleImage from './example_data/simple002.jpeg';
import labelingConfig from './labeling_config.json';

export { labelingConfig };
export const KPGMold = labelingConfig.keypointGraph;
export const kpLen = labelingConfig.keypointGraph.length;
export type PropertyValueType = string | number | boolean;
export interface IConfigPropertyObject {
  type: string;
  title: string;
  default?: PropertyValueType;
}

export interface IConfigProperty {
  [Prop: string]: IConfigPropertyObject;
}

export interface IProperties {
  [prop: string]: {
    type: string;
    title: string;
    value: PropertyValueType;
  };
}

export function getKPDefaultProps(idx: number) {
  const defaultProps: IProperties = {};
  Object.keys(KPGMold[idx].properties).forEach((propName) => {
    defaultProps[propName] = {
      type: (KPGMold[idx].properties as any)[propName].type,
      title: (KPGMold[idx].properties as any)[propName].title,
      value: (KPGMold[idx].properties as any)[propName].default,
    };
  });
  return defaultProps;
}

function copyProps(props0: IProperties) {
  const newProps: IProperties = {};
  Object.keys(props0).forEach((propName) => {
    newProps[propName] = {
      type: (props0 as any)[propName].type,
      title: (props0 as any)[propName].title,
      value: (props0 as any)[propName].value,
    };
  });
  return newProps;
}

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

type ToolModeType = 'i' | 'e';
type ControlState = {
  panMode: boolean;
  toolMode: ToolModeType;
  set: (fn: (state: ControlState) => void) => void;
};
export const useControlStore = create<ControlState>((set) => ({
  panMode: false,
  toolMode: 'i',
  set: (fn) => set(produce(fn)),
}));
export const controlSelector = (state: ControlState) => ({
  panMode: state.panMode,
  toolMode: state.toolMode,
  setControlState: state.set,
});

type LabelState = {
  keypointGraphList: {
    name: string;
    x: number;
    y: number;
    properties: IProperties;
  }[][];
  curKPG: number;
  curKP: number; // can be keypoints.length -- state: add next
  curProps: IProperties;
  selectedKPG?: number;
  selectedKP?: number;
  set: (fn: (state: LabelState) => void) => void;
};
export const useLabelStore = create<LabelState>((set) => ({
  keypointGraphList: [[]],
  curKPG: 0,
  curKP: 0,
  curProps: getKPDefaultProps(0),
  set: (fn) => set(produce(fn)),
}));
export const labelSelector = (state: LabelState) => ({
  keypointGraphList: state.keypointGraphList,
  curKPG: state.curKPG,
  curKP: state.curKP,
  curProps: state.curProps,
  selectedKPG: state.selectedKPG,
  selectedKP: state.selectedKP,
  setLabelState: state.set,
});

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('LabelStore', useLabelStore);
}

function App() {
  const { imagePath, stageSize, setStageSize } = useSetupStore(setupSelector);
  const {
    curKPG,
    curKP,
    curProps,
    keypointGraphList,
    setLabelState,
  } = useLabelStore(labelSelector);
  const { panMode, toolMode, setControlState } = useControlStore(
    controlSelector
  );
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stageRef && stageRef.current) {
      setStageSize(stageRef.current.offsetWidth, stageRef.current.offsetHeight);
      console.log(
        `${stageRef.current.offsetWidth} * ${stageRef.current.offsetHeight}`
      );
    }
  }, [stageRef, setStageSize]);
  function handleKeyPress(e: React.KeyboardEvent<any>) {
    if (e.key === ' ' && !e.repeat) {
      setControlState((state) => {
        state.panMode = true;
      });
    }
  }
  function handleKeyUp(e: React.KeyboardEvent<any>) {
    if (e.key === ' ' && !e.repeat) {
      setControlState((state) => {
        state.panMode = false;
      });
    }
  }
  function handleToolModeChange(e: RadioChangeEvent) {
    setControlState((state) => {
      state.toolMode = e.target.value;
    });
    setLabelState((state) => {
      state.selectedKPG = undefined;
      state.selectedKP = undefined;
    });
  }
  function handleLabelAreaWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.stopPropagation();
  }
  function handleClicked(e: ClickEventData) {
    if (panMode) {
      return;
    }
    if (toolMode === 'i') {
      let newCurKP: number = curKP;
      if (e.event.data.button === 0) {
        // left click
        console.log(`[EVENT]leftmouse ${e.world.x}, ${e.world.y}`);
        // add keypoint
        if (curKP === kpLen) {
          // tmp: do nothing when current KPG is already full --> push/pop KPG should be controled with button
          console.log(`curKPG is already FULL!`);
        } else {
          setLabelState((state) => {
            const newKP = {
              name: KPGMold[curKP].name,
              x: e.world.x,
              y: e.world.y,
              properties: curProps,
            };
            state.keypointGraphList[curKPG].push(newKP);
          });
        }
        newCurKP = curKP < kpLen ? curKP + 1 : kpLen;
        if (newCurKP !== curKP) {
          setLabelState((state) => {
            state.curKP = newCurKP;
            if (newCurKP < kpLen) {
              state.curProps = getKPDefaultProps(newCurKP);
            }
          });
        }
      } else if (e.event.data.button === 2) {
        // right click
        console.log(`[EVENT]rightmouse ${e.world.x}, ${e.world.y}`);
        // pop keypoint
        let poppedProps = curProps;
        if (curKP === 0) {
          // tmp: do nothing when current KPG is already empty
          console.log(`curKPG is already EMPTY!`);
        } else {
          poppedProps = copyProps(
            keypointGraphList[curKPG][curKP - 1].properties
          );
          setLabelState((state) => {
            state.keypointGraphList[curKPG].pop();
          });
        }
        newCurKP = curKP - 1 >= 0 ? curKP - 1 : 0;
        if (newCurKP !== curKP) {
          setLabelState((state) => {
            state.curKP = newCurKP;
            state.curProps = poppedProps;
          });
        }
      }
    }
  }
  // console.log(`PAN: ${panMode}`);
  // console.log(JSON.stringify(keypointGraphList));
  console.log(
    `graphLen: ${keypointGraphList.length}; lastGraph.points.length: ${
      keypointGraphList[keypointGraphList.length - 1].length
    }`
  );
  console.log(
    `lastGraph.lastPoint: ${JSON.stringify(
      keypointGraphList[keypointGraphList.length - 1][
        keypointGraphList[keypointGraphList.length - 1].length - 1
      ]
    )}`
  );
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
            {toolMode === 'i' ? <InsertKPGTool /> : null}
          </div>
        </div>
        <div className="StageArea" ref={stageRef}>
          <div className="Stage">
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
                {keypointGraphList.map((_, gidx) => {
                  return <KeypointGraph key={`kpg-${gidx}`} graphIdx={gidx} />;
                })}
              </Viewport>
            </Stage>
          </div>
          <div className="LabelData" onWheel={handleLabelAreaWheel}>
            <LabelDataDisplay />
          </div>
        </div>
      </main>
      <footer className="App-footer"></footer>
    </div>
  );
}

export default App;
