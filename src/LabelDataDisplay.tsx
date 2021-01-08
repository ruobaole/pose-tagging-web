import { useState } from 'react';
import shallow from 'zustand/shallow';
import { useLabelStore, labelSelector } from './App';
import { List, Collapse, InputNumber } from 'antd';
import './LabelDataDisplay.css';

const { Panel } = Collapse;

function ItemList() {
  const kpgList = useLabelStore(
    (state) => Object.keys(state.keypointGraphList),
    shallow
  );
  const itemList: string[] = kpgList.map((kpgKey) => {
    return `Keypoint Graph #${kpgKey}`;
  });
  return (
    <>
      <div>Item List:</div>
      <List
        size="small"
        bordered
        dataSource={itemList}
        renderItem={(item) => (
          <List.Item
            style={{
              fontSize: 'small',
              color: '#2a3c40',
              fontFamily: 'monospace',
            }}
          >
            {item}
          </List.Item>
        )}
      />
    </>
  );
}

interface IPostionInputProps {
  x: number;
  y: number;
  onXChange: (val: number) => void;
  onYChange: (val: number) => void;
}

function PostionInput(props: IPostionInputProps) {
  function handleXChange(v: number | string | undefined) {
    if (v !== undefined) {
      props.onXChange(+v);
    }
  }
  function handleYChange(v: number | string | undefined) {
    if (v !== undefined) {
      props.onYChange(+v);
    }
  }
  return (
    <>
      <div>
        <span key={`inputx`}>x: </span>
        <InputNumber
          size="small"
          step={0.5}
          precision={4}
          value={props.x}
          onChange={handleXChange}
        />
      </div>
      <div>
        <span key={`inputy`}>y: </span>
        <InputNumber
          size="small"
          step={0.5}
          precision={4}
          value={props.y}
          onChange={handleYChange}
        />
      </div>
    </>
  );
}

function KeypointsDetail() {
  const { keypointGraphList, curKPG, setLabelState } = useLabelStore(
    labelSelector
  );
  const [activeKPIdx, setActiveKPIdx] = useState(NaN);
  const kpg = keypointGraphList[curKPG];
  function handleCollapseChange(pk: string | string[]) {
    if (typeof pk === typeof '') {
      setActiveKPIdx(+pk);
    }
  }
  function handleXChange(newX: number) {
    if (!isNaN(activeKPIdx)) {
      setLabelState((state) => {
        state.keypointGraphList[curKPG][activeKPIdx].x = newX;
      });
    }
  }
  function handleYChange(newY: number) {
    if (!isNaN(activeKPIdx)) {
      setLabelState((state) => {
        state.keypointGraphList[curKPG][activeKPIdx].y = newY;
      });
    }
  }
  return (
    <Collapse onChange={handleCollapseChange} accordion>
      {kpg.map((kp, idx) => {
        return (
          <Panel
            style={{ fontSize: 'small' }}
            header={`keypoint #${idx} - ${kp.name}`}
            key={idx}
          >
            <PostionInput
              x={kp.x}
              y={kp.y}
              onXChange={handleXChange}
              onYChange={handleYChange}
            />
            <p>{JSON.stringify(kp)}</p>
          </Panel>
        );
      })}
    </Collapse>
  );
}

export function ItemDetail() {
  return (
    <>
      <div>Detail:</div>
      <KeypointsDetail />
    </>
  );
}

export function LabelDataDisplay() {
  return (
    <>
      Label Data
      <div className="ItemList">
        <ItemList />
      </div>
      <div className="ItemDetail">
        <ItemDetail />
      </div>
    </>
  );
}
