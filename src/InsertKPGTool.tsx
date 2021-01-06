import { Checkbox } from 'antd';
import labelingConfig from './labeling_config.json';

interface IConfigPropertyObject {
  type: string;
  title: string;
  default?: string;
}

interface IConfigProperty {
  [Prop: string]: IConfigPropertyObject;
}

interface IInsertKPGToolProps {
  kpIndex: number;
}

export const InsertKPGTool = (props: IInsertKPGToolProps) => {
  // TODO: validate labeling_config and throw error
  const kpgProp: IConfigProperty =
    labelingConfig.keypointGraph[props.kpIndex].properties;
  const kpPropInput: JSX.Element = (
    <>
      {Object.keys(kpgProp).map((propKey: string) => {
        let input: JSX.Element = (
          <span>{`${propKey}: cannot render this property`}</span>
        );
        switch (kpgProp[propKey]['type']) {
          case 'boolean':
            input = (
              <Checkbox
                onChange={(e) => {
                  console.log(
                    `KPG[${props.kpIndex}].properties.${propKey} = ${e.target.checked}`
                  );
                }}
              >
                {propKey}
              </Checkbox>
            );
            break;

          default:
            break;
        }
        return <>{input}</>;
      })}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 'small' }}>
        {labelingConfig.keypointGraph.map((kp: any, idx) => {
          const textStyle =
            props.kpIndex === idx
              ? { backgroundColor: 'Tomato', color: 'Darkblue' }
              : {};
          return idx === labelingConfig.keypointGraph.length - 1 ? (
            <span style={textStyle}>{kp.name}</span>
          ) : (
            <>
              <span style={textStyle}>{kp.name}</span>
              <span style={{ color: 'cornsilk' }}>{` -> `}</span>
            </>
          );
        })}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#456268' }}>
          Keypoint Properties
        </div>
        {kpPropInput}
      </div>
    </div>
  );
};
