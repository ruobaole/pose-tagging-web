import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useLabelStore, labelSelector } from './App';
import labelingConfig from './labeling_config.json';

interface IConfigPropertyObject {
  type: string;
  title: string;
  default?: string | number | boolean;
}

interface IConfigProperty {
  [Prop: string]: IConfigPropertyObject;
}

interface IInsertKPGToolProps {}

export const InsertKPGTool = (props: IInsertKPGToolProps) => {
  // TODO: validate labeling_config and throw error
  const configKPGLen = labelingConfig.keypointGraph.length;
  const { curKP, curProps, setLabelState } = useLabelStore(labelSelector);
  const kpgProp: IConfigProperty =
    curKP < configKPGLen
      ? labelingConfig.keypointGraph[curKP].properties
      : curProps;
  const kpPropInput: JSX.Element[] = Object.keys(kpgProp).map(
    (propKey: string) => {
      let input: JSX.Element;
      function handleCheckboxChange(e: CheckboxChangeEvent) {
        console.log(
          `KPG[${curKP}].properties.${propKey} = ${e.target.checked}`
        );
        setLabelState((state) => {
          state.curProps[propKey].value = e.target.checked;
        });
      }
      switch (kpgProp[propKey]['type']) {
        case 'boolean':
          input = (
            <Checkbox
              key={`propKey-${propKey}`}
              checked={curProps[propKey].value === true}
              onChange={handleCheckboxChange}
            >
              {curProps[propKey].title}
            </Checkbox>
          );
          break;

        default:
          input = (
            <span
              key={`propKey-invalid-${propKey}`}
            >{`${propKey}: cannot render this property`}</span>
          );
          break;
      }
      return input;
    }
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 'small' }}>
        {labelingConfig.keypointGraph.map((kp: any, idx) => {
          // const textStyle =
          //   curKP === idx
          //     ? { backgroundColor: 'Tomato', color: 'Darkblue' }
          //     : {};
          return (
            <>
              <span
                key={`keypoint-hint-${idx}`}
                style={
                  curKP === idx
                    ? { backgroundColor: 'Tomato', color: 'Darkblue' }
                    : {}
                }
              >
                {kp.name}
              </span>
              <span
                key={`keypoint-hint-arrow-${idx}`}
                style={{ color: 'cornsilk' }}
              >{` -> `}</span>
            </>
          );
        })}
        <span
          style={
            curKP === configKPGLen
              ? { backgroundColor: 'Tomato', color: 'Darkblue' }
              : {}
          }
        >
          ADD NEXT
        </span>
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
