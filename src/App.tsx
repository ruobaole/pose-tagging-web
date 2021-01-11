import React, { useRef, useEffect } from 'react';
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
export type PropertyValueType = string | number | boolean | undefined;
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

export function getKPDefaultProps(idx0: number) {
  let idx = idx0 >= 0 ? idx0 % kpLen : kpLen - ((-1 * idx0) % kpLen);
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

export type ToolModeType = 'i' | 'e';
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

export type LabelState = {
  keypointGraphList: {
    name: string;
    x: number;
    y: number;
    properties: IProperties;
  }[][];
  nextProps: IProperties;
  selectedKPG: number;
  selectedKP?: number;
  set: (fn: (state: LabelState) => void) => void;
};
export const useLabelStore = create<LabelState>((set) => ({
  keypointGraphList: [[]],
  selectedKPG: 0,
  nextProps: getKPDefaultProps(0),
  set: (fn) => set(produce(fn)),
}));
export const labelSelector = (state: LabelState) => ({
  keypointGraphList: state.keypointGraphList,
  nextProps: state.nextProps,
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
    selectedKPG,
    nextProps,
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
  }
  function handleLabelAreaWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.stopPropagation();
  }
  function handleViewportClicked(e: ClickEventData) {
    if (panMode) {
      return;
    }
    if (toolMode === 'i') {
      if (e.event.data.button === 0) {
        // left click
        console.log(`[EVENT]leftmouse ${e.world.x}, ${e.world.y}`);
        // add keypoint
        if (keypointGraphList[selectedKPG].length === kpLen) {
          console.log(`this keypoint graph is already FULL!`);
        } else {
          const nextPointIdx = keypointGraphList[selectedKPG].length;
          const newKP = {
            name: KPGMold[nextPointIdx].name,
            x: e.world.x,
            y: e.world.y,
            properties: nextProps,
          };
          setLabelState((state) => {
            state.keypointGraphList[selectedKPG].push(newKP);
            if (nextPointIdx + 1 < kpLen) {
              state.nextProps = getKPDefaultProps(nextPointIdx + 1);
            }
          });
        }
      } else if (e.event.data.button === 2) {
        // right click
        console.log(`[EVENT]rightmouse ${e.world.x}, ${e.world.y}`);
        // pop keypoint
        if (keypointGraphList[selectedKPG].length === 0) {
          console.log(`this keypoint graph is already EMPTY!`);
        } else {
          setLabelState((state) => {
            const popped = state.keypointGraphList[selectedKPG].pop();
            if (popped) {
              state.nextProps = copyProps(popped.properties);
            }
          });
        }
      }
    }
  }
  // console.log(`PAN: ${panMode}`);
  // console.log(JSON.stringify(keypointGraphList));
  // console.log(
  //   `graphLen: ${keypointGraphList.length}; lastGraph.points.length: ${
  //     keypointGraphList[keypointGraphList.length - 1].length
  //   }`
  // );
  // console.log(
  //   `lastGraph.lastPoint: ${JSON.stringify(
  //     keypointGraphList[keypointGraphList.length - 1][
  //       keypointGraphList[keypointGraphList.length - 1].length - 1
  //     ]
  //   )}`
  // );
  console.log(`keypointGraphList.length: ${keypointGraphList.length}`);
  console.log(`selectedKPG: ${selectedKPG}`);
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
            {toolMode === 'i' ? (
              <InsertKPGTool
                nextPointIdx={keypointGraphList[selectedKPG].length}
              />
            ) : null}
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
                onClicked={handleViewportClicked}
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
