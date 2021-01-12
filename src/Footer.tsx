import { ChangeEvent, useState } from 'react';
import isElectron from 'is-electron';
import { Button, Input } from 'antd';
import {
  useSetupStore,
  setupSelector,
  useLabelStore,
  labelSelector,
  getKPDefaultProps,
  SetupState,
  LabelState,
} from './App';
import './Footer.css';

const electron = window.require('electron');

function LabelingConfigUploader() {
  const handleFileLoad = (e: ProgressEvent<FileReader>) => {
    if (e.target && e.target.result) {
      console.log('e.target.result: ', JSON.parse(e.target.result.toString()));
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = handleFileLoad;
    }
  };
  return (
    <input
      type="file"
      accept="application/JSON"
      onChange={handleChange}
      title="Upload Labeling Config"
    />
  );
}

export function WebFooter() {
  const { imagePath, setSetupState } = useSetupStore(setupSelector);
  const [imageURLInput, setImageURLInput] = useState<string | undefined>(
    imagePath
  );
  function handleImageURLChange(e: ChangeEvent<HTMLInputElement>) {
    setImageURLInput(e.target.value);
  }
  function handleReload() {
    if (imageURLInput !== undefined) {
      setSetupState((state) => {
        state.imagePath = imageURLInput;
      });
    }
  }
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Input
          size="small"
          placeholder="image URL"
          value={imageURLInput}
          onChange={handleImageURLChange}
        />
        <Button size="small" type="primary" onClick={handleReload}>
          Reload Image
        </Button>
      </div>
      <LabelingConfigUploader />
    </>
  );
}

function validateLabelingConfig(newConfig: any) {
  if (
    !newConfig['example_pose1'] ||
    !newConfig['keypointGraph'] ||
    newConfig['keypointGraph'].length < 1
  ) {
    return false;
  }
  return true;
}

export function loadLabelingConfig(
  newConfig: any,
  setSetupState: (fn: (state: SetupState) => void) => void,
  setLabelState: (fn: (state: LabelState) => void) => void
) {
  if (!validateLabelingConfig(newConfig)) {
    setSetupState((state) => {
      state.labelingConfigError = 'labeling config invalid';
    });
    return;
  }
  setSetupState((state) => {
    state.labelingConfigError = undefined;
    state.labelingConfig = newConfig;
  });
  setLabelState((state) => {
    state.selectedKPG = 0;
    state.selectedKP = undefined;
    state.keypointGraphList = [[]];
    state.nextProps = getKPDefaultProps(newConfig['keypointGraph'], 0);
  });
}

function ElectronConfigFileUpload() {
  const { labelingConfig, labelingConfigError, setSetupState } = useSetupStore(
    setupSelector
  );
  const { setLabelState } = useLabelStore(labelSelector);
  const handleUploadClick = () => {
    electron.ipcRenderer.send('open-upload-config');
  };
  electron.ipcRenderer.on('load-config', (event: any, configObject: any) => {
    loadLabelingConfig(configObject, setSetupState, setLabelState);
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Button size="small" type="primary" onClick={handleUploadClick}>
        Upload Config
      </Button>
      <span style={{ marginLeft: '1em' }}>
        {labelingConfigError === undefined
          ? `Config Version: ${labelingConfig.configVersion}`
          : `Config Invalid!`}
      </span>
    </div>
  );
}

export function ElectronFooter() {
  const { imagePath } = useSetupStore(setupSelector);
  const [imageURLInput, setImageURLInput] = useState<string | undefined>(
    imagePath
  );
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}></div>
      <ElectronConfigFileUpload />
    </>
  );
}

export function Footer() {
  return (
    <div className="FooterWrapper">
      {isElectron() ? <ElectronFooter /> : <WebFooter />}
    </div>
  );
}
