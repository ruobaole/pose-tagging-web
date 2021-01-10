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
        const value: PropertyValueType =
          valProperties[propKey] === undefined
            ? configProperties[propKey].default
            : valProperties[propKey].value;
        let input: JSX.Element;
        function handleCheckboxChange(e: CheckboxChangeEvent) {
          onChange(propKey, e.target.checked);
        }
        switch (configProperties[propKey]['type']) {
          case 'boolean':
            input = (
              <Checkbox
                key={`propKey-${propKey}`}
                checked={value === true}
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

interface IInsertKPGToolProps {
  nextPointIdx: number;
}

export const InsertKPGTool = (props: IInsertKPGToolProps) => {
  const { nextProps, setLabelState } = useLabelStore(labelSelector);
  const handlePropChange = (propKey: string, newVal: PropertyValueType) => {
    setLabelState((state) => {
      state.nextProps[propKey].value = newVal;
    });
  };
  function handleAddNextGraph() {
    setLabelState((state) => {
      state.selectedKPG = state.keypointGraphList.length;
      state.selectedKP = undefined;
      state.keypointGraphList.push([]);
      state.nextProps = getKPDefaultProps(0);
    });
  }
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
                  props.nextPointIdx === idx
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
        <Button
          size="small"
          type="primary"
          disabled={props.nextPointIdx !== kpLen}
          onClick={handleAddNextGraph}
        >
          ADD NEXT GRAPH
        </Button>
      </div>
      <KeypointPropertiesInput
        configProperties={nextProps}
        valProperties={nextProps}
        onChange={handlePropChange}
      />
    </div>
  );
};
