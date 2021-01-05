import { useState } from 'react';
import labelingConfig from './labeling_config.json';

interface IInsertKPGToolProps {
  kpIndex: number;
}

export const InsertKPGTool = (props: IInsertKPGToolProps) => {
  return (
    <>{`${props.kpIndex} - ${
      labelingConfig.keypointGraph[props.kpIndex].name
    }`}</>
  );
};
