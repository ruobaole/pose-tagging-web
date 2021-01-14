import { Slider } from 'antd';
import { useSetupStore, setupSelector } from './App';

export function DisplayOptionTool() {
  const { keypointRadius, setSetupState } = useSetupStore(setupSelector);
  const handleRadiusChange = (v: number) => {
    setSetupState((state) => {
      state.keypointRadius = v;
    });
  };
  return (
    <div>
      <div>Display Option</div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>Point Radius:</div>
        <div>
          <Slider
            style={{ width: 600 }}
            min={1}
            max={256}
            onChange={handleRadiusChange}
            value={keypointRadius}
          />
        </div>
      </div>
    </div>
  );
}
