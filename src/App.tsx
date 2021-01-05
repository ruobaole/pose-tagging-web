import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Radio } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Stage, Sprite } from '@inlet/react-pixi';
import { Viewport } from './Viewport';
import exampleImage from './example_data/simple002.jpeg';
import { RadioChangeEvent } from 'antd/lib/radio';

function App() {
  const [imagePath, setImagePath] = useState<string>(exampleImage);
  const [stageWidth, setStageWidth] = useState<number>(256);
  const [stageHeight, setStageHeight] = useState<number>(256);
  const [panMode, setPanMode] = useState<boolean>(false);
  const [toolMode, setToolMode] = useState<string>('i');
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stageRef && stageRef.current) {
      setStageWidth(stageRef.current.offsetWidth);
      setStageHeight(stageRef.current.offsetHeight);
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
  console.log(`PAN: ${panMode}`);
  return (
    <div className="App">
      <header className="App-header"></header>
      <main className="App-main">
        <div className="Tools">
          <div className="ToolMode">
            <Radio.Group
              options={[
                { label: 'Add New (i)', value: 'i' },
                { label: 'Select & Edit (e)', value: 'e' },
              ]}
              onChange={handleToolModeChange}
              value={toolMode}
              optionType="button"
              buttonStyle="solid"
            />
          </div>
          <div className="ToolDetail">detailed area</div>
        </div>
        <div className="Stage" ref={stageRef}>
          <Stage
            width={stageWidth}
            height={stageHeight}
            tabIndex={0}
            style={{ cursor: panMode ? 'move' : 'default' }}
            onKeyPress={handleKeyPress}
            onKeyUp={handleKeyUp}
            options={{ backgroundColor: 0xfcf8ec }}
          >
            <Viewport
              width={stageWidth}
              height={stageHeight}
              enablePan={panMode}
            >
              <Sprite image={imagePath} x={0} y={0} />
            </Viewport>
          </Stage>
        </div>
      </main>
      <footer className="App-footer"></footer>
    </div>
  );
}

export default App;
