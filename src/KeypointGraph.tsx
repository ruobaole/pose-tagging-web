import React, { useCallback } from 'react';
import { Keypoint } from './Keypoint';
import { Edge } from './Edge';
import {
  useControlStore,
  KPGMold,
  controlSelector,
  useLabelStore,
  labelSelector,
} from './App';

interface IKeypointGraphProps {
  graphIdx: number;
}

export function KeypointGraph(props: IKeypointGraphProps) {
  const kpg = useLabelStore(
    useCallback((state) => state.keypointGraphList[props.graphIdx], [
      props.graphIdx,
    ])
  );
  const { selectedKPG, selectedKP, setLabelState } = useLabelStore(
    labelSelector
  );
  const { panMode, toolMode } = useControlStore(controlSelector);
  return (
    <>
      {kpg.map((kp, ikp) => {
        const handleKeypointClicked = (e: PIXI.InteractionEvent) => {
          if (toolMode === 'e' && !panMode) {
            setLabelState((state) => {
              state.selectedKPG = props.graphIdx;
              state.selectedKP = ikp;
            });
          }
        };
        const handleKeypointMoved = (newX: number, newY: number) => {
          setLabelState((state) => {
            state.keypointGraphList[props.graphIdx][ikp].x = newX;
            state.keypointGraphList[props.graphIdx][ikp].y = newY;
          });
        };
        return (
          <>
            <Keypoint
              interative={toolMode === 'e'}
              highlight={selectedKPG === props.graphIdx && selectedKP === ikp}
              key={`kp-g${props.graphIdx}-${ikp}`}
              x={kp.x}
              y={kp.y}
              color={kp.properties['is_visible'].value ? 0xff00ff : 0x84f542} // tmp: hard coded
              radius={4}
              onPointerDown={handleKeypointClicked}
              onDragEnd={handleKeypointMoved}
            />
            {KPGMold[ikp].neighbors.map((idxn: number, i: number) => {
              if (idxn < ikp) {
                return (
                  <Edge
                    key={`edge-g${props.graphIdx}-p${ikp}-to-p${idxn}`}
                    x1={kp.x}
                    y1={kp.y}
                    x2={kpg[idxn].x}
                    y2={kpg[idxn].y}
                    color={+KPGMold[ikp].edgeColors[i]}
                    alpha={1}
                  />
                );
              } else {
                return null;
              }
            })}
          </>
        );
      })}
    </>
  );
}
