import { useState } from 'react';
import shallow from 'zustand/shallow';
import {
  KPGMold,
  useLabelStore,
  labelSelector,
  PropertyValueType,
  useControlStore,
  controlSelector,
} from './App';
import { KeypointPropertiesInput } from './InsertKPGTool';
import { Collapse, InputNumber } from 'antd';
import './LabelDataDisplay.css';

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

interface IKeypointGraphListProps {
  onKPGChange: (newIdx?: number) => void;
  kpgIdx?: number;
}

function KeypointGraphList(props: IKeypointGraphListProps) {
  const highlightRowStyle = {
    backgroundColor: '#ff7875',
    color: 'darkblue',
  };
  const kpgList = useLabelStore(
    (state) => Object.keys(state.keypointGraphList),
    shallow
  );
  return (
    <>
      {kpgList.map((kpgKey) => {
        const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
          props.onKPGChange(+kpgKey);
        };
        return (
          <div
            className="ItemRow"
            style={
              props.kpgIdx !== undefined && props.kpgIdx === +kpgKey
                ? highlightRowStyle
                : {}
            }
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

interface IKeypointGraphDetailProps {
  kpgIdx: number;
}

function KeypointGraphDetail(props: IKeypointGraphDetailProps) {
  const { keypointGraphList, selectedKP, setLabelState } = useLabelStore(
    labelSelector
  );
  const { toolMode } = useControlStore(controlSelector);
  const [activeKPIdx, setActiveKPIdx] = useState(NaN);
  const kpg = keypointGraphList[props.kpgIdx];
  function handleCollapseChange(panelKey: string | string[]) {
    let idx: number | undefined = undefined;
    console.log(panelKey);
    if (panelKey !== undefined && typeof panelKey === typeof '') {
      idx = +panelKey;
    }
    if (toolMode === 'e') {
      setLabelState((state) => {
        state.selectedKP = idx;
      });
    } else if (toolMode === 'i') {
      setActiveKPIdx(idx === undefined ? NaN : idx);
    }
  }
  function handleXChange(newX: number) {
    if (toolMode === 'e' && selectedKP !== undefined) {
      setLabelState((state) => {
        state.keypointGraphList[props.kpgIdx][selectedKP].x = newX;
      });
    } else if (toolMode === 'i' && !isNaN(activeKPIdx)) {
      setLabelState((state) => {
        state.keypointGraphList[props.kpgIdx][activeKPIdx].x = newX;
      });
    }
  }
  function handleYChange(newY: number) {
    if (toolMode === 'e' && selectedKP !== undefined) {
      setLabelState((state) => {
        state.keypointGraphList[props.kpgIdx][selectedKP].y = newY;
      });
    } else if (toolMode === 'i' && !isNaN(activeKPIdx)) {
      setLabelState((state) => {
        state.keypointGraphList[props.kpgIdx][activeKPIdx].y = newY;
      });
    }
  }
  function handlePropsChange(propKey: string, newVal: PropertyValueType) {
    if (toolMode === 'e' && selectedKP !== undefined) {
      setLabelState((state) => {
        state.keypointGraphList[props.kpgIdx][selectedKP].properties[
          propKey
        ].value = newVal;
      });
    } else if (toolMode === 'i' && !isNaN(activeKPIdx)) {
      setLabelState((state) => {
        state.keypointGraphList[props.kpgIdx][activeKPIdx].properties[
          propKey
        ].value = newVal;
      });
    }
  }
  return (
    <Collapse
      onChange={handleCollapseChange}
      activeKey={toolMode === 'e' ? '' + selectedKP : '' + activeKPIdx}
      accordion
    >
      {kpg.map((kp, idx) => {
        return (
          <Collapse.Panel
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
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
}

export function LabelDataDisplay() {
  const { curKPG, selectedKPG, setLabelState } = useLabelStore(labelSelector);
  const { toolMode } = useControlStore(controlSelector);
  const handleKPGChange = (newKPG?: number) => {
    if (toolMode === 'i') {
      if (newKPG !== undefined) {
        setLabelState((state) => {
          state.curKPG = newKPG;
          state.curKP = state.keypointGraphList[newKPG].length;
        });
      }
    } else if (toolMode === 'e') {
      setLabelState((state) => {
        state.selectedKPG = newKPG;
        state.selectedKP = undefined;
      });
    }
  };
  const kpgIdx: number | undefined = toolMode === 'e' ? selectedKPG : curKPG;
  return (
    <>
      Label Data
      <div className="ItemList">
        <div>Item List:</div>
        <KeypointGraphList kpgIdx={kpgIdx} onKPGChange={handleKPGChange} />
      </div>
      <div className="ItemDetail">
        <div>Detail:</div>
        {kpgIdx === undefined ? null : <KeypointGraphDetail kpgIdx={kpgIdx} />}
      </div>
    </>
  );
}
