import React, { useCallback } from 'react';
import { Keypoint } from './Keypoint';
import { useLabelStore } from './App';

interface IKeypointGraphProps {
  graphIdx: number;
}

export function KeypointGraph(props: IKeypointGraphProps) {
  const kpg = useLabelStore(
    useCallback((state) => state.keypointGraphList[props.graphIdx], [
      props.graphIdx,
    ])
  );
  return (
    <>
      {kpg.map((kp, ikp) => {
        return (
          <Keypoint
            key={`kp-g${props.graphIdx}-${ikp}`}
            x={kp.x}
            y={kp.y}
            radius={4}
          />
        );
      })}
    </>
  );
}
