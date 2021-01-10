import { Checkbox, Button } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import {
  KPGMold,
  useLabelStore,
  labelSelector,
  kpLen,
  getKPDefaultProps,
  IConfigProperty,
  IProperties,
  PropertyValueType,
} from './App';

export const AddNextGraphButton = () => {
  const { curKP, setLabelState } = useLabelStore(labelSelector);
  const newCurProps = getKPDefaultProps(0);
  function handleAddNextGraph() {
    setLabelState((state) => {
      state.curKPG = state.keypointGraphList.length;
      state.curKP = 0;
      state.keypointGraphList.push([]);
      state.curProps = newCurProps;
    });
  }
  return (
    <Button
      size="small"
      type="primary"
      disabled={curKP !== kpLen}
      onClick={handleAddNextGraph}
    >
      ADD NEXT GRAPH
    </Button>
  );
};

interface IKeypointPropertiesInputProps {
  configProperties: IConfigProperty;
  valProperties: IProperties;
  onChange: (propKey: string, newVal: PropertyValueType) => void;
}

export function KeypointPropertiesInput(props: IKeypointPropertiesInputProps) {
  const { configProperties, valProperties, onChange } = props;
  return (
    <>
      {Object.keys(configProperties).map((propKey: string) => {
        let input: JSX.Element;
        function handleCheckboxChange(e: CheckboxChangeEvent) {
          onChange(propKey, e.target.checked);
        }
        switch (configProperties[propKey]['type']) {
          case 'boolean':
            input = (
              <Checkbox
                key={`propKey-${propKey}`}
                checked={valProperties[propKey].value === true}
                onChange={handleCheckboxChange}
              >
                {configProperties[propKey].title}
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
      })}
    </>
  );
}

export const InsertKPGTool = () => {
  // TODO: validate labeling_config and throw error
  const { curKP, curProps, setLabelState } = useLabelStore(labelSelector);
  const handlePropChange = (propKey: string, newVal: PropertyValueType) => {
    setLabelState((state) => {
      state.curProps[propKey].value = newVal;
    });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div key="title-area" style={{ fontWeight: 700, color: '#456268' }}>
        Next Point
      </div>
      <div key="input-area" style={{ fontSize: 'small' }}>
        {KPGMold.map((kp: any, idx) => {
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
        <AddNextGraphButton />
      </div>
      <KeypointPropertiesInput
        configProperties={curKP < kpLen ? KPGMold[curKP].properties : curProps}
        valProperties={curProps}
        onChange={handlePropChange}
      />
    </div>
  );
};
