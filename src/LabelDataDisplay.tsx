import { useState } from 'react';
import shallow from 'zustand/shallow';
import {
  KPGMold,
  kpLen,
  useLabelStore,
  labelSelector,
  PropertyValueType,
} from './App';
import { KeypointPropertiesInput } from './InsertKPGTool';
import { Collapse, InputNumber } from 'antd';
import './LabelDataDisplay.css';
import { ClickEventType } from 'pixi-viewport';

const { Panel } = Collapse;

interface IRenderKPGRowProps {
  kgbIdx: number;
}

function RenderKPGRow(props: IRenderKPGRowProps) {
  const pointList = useLabelStore(
    (state) => Object.keys(state.keypointGraphList[props.kgbIdx]),
    shallow
  );
  return (
    <>
      <span>{`Keypoint Graph #${props.kgbIdx}`}</span>
      <span>{`${pointList.length} points`}</span>
    </>
  );
}

function ItemList() {
  const selectedRowStyle = {
    backgroundColor: '#ff7875',
    color: 'darkblue',
  };
  const kpgList = useLabelStore(
    (state) => Object.keys(state.keypointGraphList),
    shallow
  );
  const { curKPG, setLabelState } = useLabelStore(labelSelector);
  return (
    <>
      <div>Item List:</div>
      {kpgList.map((kpgKey) => {
        const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
          setLabelState((state) => {
            state.curKPG = +kpgKey;
            state.curKP = state.keypointGraphList[+kpgKey].length;
          });
        };
        return (
          <div
            className="ItemRow"
            style={+kpgKey === curKPG ? selectedRowStyle : {}}
            key={`${kpgKey}`}
            onClick={handleRowClick}
          >
            <RenderKPGRow kgbIdx={+kpgKey} />
          </div>
        );
      })}
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
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ marginRight: '1em' }}>
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
    </div>
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
  function handlePropsChange(propKey: string, newVal: PropertyValueType) {
    setLabelState((state) => {
      state.keypointGraphList[curKPG][activeKPIdx].properties[
        propKey
      ].value = newVal;
    });
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
            <KeypointPropertiesInput
              configProperties={KPGMold[idx].properties}
              valProperties={kp.properties}
              onChange={handlePropsChange}
            />
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
