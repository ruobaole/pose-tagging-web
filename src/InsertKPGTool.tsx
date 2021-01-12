import { Checkbox, Button } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import {
  useLabelStore,
  labelSelector,
  getKPDefaultProps,
  IConfigProperty,
  IProperties,
  PropertyValueType,
  useSetupStore,
  setupSelector,
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
  const { labelingConfig } = useSetupStore(setupSelector);
  const handlePropChange = (propKey: string, newVal: PropertyValueType) => {
    setLabelState((state) => {
      state.nextProps[propKey].value = newVal;
    });
  };
  function handleNextGraph() {
    setLabelState((state) => {
      if (state.selectedKPG === state.keypointGraphList.length - 1) {
        // last graph -> add one
        state.selectedKPG = state.keypointGraphList.length;
        state.keypointGraphList.push([]);
        state.nextProps = getKPDefaultProps(labelingConfig.keypointGraph, 0);
      } else {
        //not last graph -> to next one
        state.nextProps = getKPDefaultProps(
          labelingConfig.keypointGraph,
          state.keypointGraphList[state.selectedKPG + 1].length
        );
        state.selectedKPG += 1;
      }
      state.selectedKP = undefined;
    });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div key="title-area" style={{ fontWeight: 700, color: '#456268' }}>
        Next Point
      </div>
      <div key="input-area" style={{ fontSize: 'small' }}>
        {labelingConfig.keypointGraph.map((kp: any, idx) => {
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
                {kp.displayText}
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
          disabled={props.nextPointIdx !== labelingConfig.keypointGraph.length}
          onClick={handleNextGraph}
        >
          NEXT GRAPH
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
