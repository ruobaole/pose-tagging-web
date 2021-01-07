import React, { useCallback } from 'react';
import { Keypoint } from './Keypoint';
import { Edge } from './Edge';
import { useLabelStore, KPGMold } from './App';

interface IKeypointGraphProps {
  graphIdx: number;
}

export function KeypointGraph(props: IKeypointGraphProps) {
  const kpg = useLabelStore(
    useCallback((state) => state.keypointGraphList[props.graphIdx], [
      props.graphIdx,
    ])
  );
  const c = '0xff5e08';
  return (
    <>
      {kpg.map((kp, ikp) => {
        return (
          <>
            <Keypoint
              key={`kp-g${props.graphIdx}-${ikp}`}
              x={kp.x}
              y={kp.y}
              radius={4}
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
