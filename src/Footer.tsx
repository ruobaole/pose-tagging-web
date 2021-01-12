import { ChangeEvent, useState } from 'react';
import isElectron from 'is-electron';
import { Button, Input, Select } from 'antd';
import { UpOutlined, DownOutlined, SaveOutlined } from '@ant-design/icons';
import path from 'path';
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

const electron = isElectron() ? window.require('electron') : undefined;

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
      <Button size="small" type="default" onClick={handleUploadClick}>
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

function ElectronDirSelector() {
  const { imagePath, setSetupState } = useSetupStore(setupSelector);
  const [workspacePath, setWorkspacePath] = useState<string | undefined>(
    undefined
  );
  const [imgPathList, setImgPathList] = useState<string[]>([]);
  const handleOpenDirClick = () => {
    electron.ipcRenderer.send('open-workspace');
  };
  electron.ipcRenderer.on(
    'selected-workspace',
    (event: any, workspaceInfo: any) => {
      if (workspaceInfo.workspacePath) {
        setWorkspacePath(workspaceInfo.workspacePath);
      }
      if (workspaceInfo.imgList) {
        setImgPathList(workspaceInfo.imgList);
        if (workspaceInfo.imgList.length > 0) {
          setSetupState((state) => {
            state.imagePath = workspaceInfo.imgList[0];
          });
        }
      }
    }
  );
  const handleSelect = (value: string) => {
    setSetupState((state) => {
      state.imagePath = value;
    });
  };
  const handleUpClick = () => {
    if (imagePath && imgPathList && imgPathList.length > 0) {
      const idx = imgPathList.indexOf(imagePath);
      console.log(idx);
      if (idx > 0) {
        setSetupState((state) => {
          state.imagePath = imgPathList[idx - 1];
        });
      }
    }
  };
  const handleDownClick = () => {
    if (imagePath && imgPathList && imgPathList.length > 0) {
      const idx = imgPathList.indexOf(imagePath);
      console.log(idx);
      if (idx !== -1 && idx < imgPathList.length - 1) {
        setSetupState((state) => {
          state.imagePath = imgPathList[idx + 1];
        });
      }
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Button size="small" type="default" onClick={handleOpenDirClick}>
        Open Workspace
      </Button>
      <span style={{ marginLeft: '1em', width: 180 }}>
        {workspacePath
          ? `${path.basename(workspacePath)}/`
          : 'workspace not selected'}
      </span>
      <span style={{ marginLeft: '1em' }}>
        <Select
          // showSearch
          size="small"
          style={{ width: 300 }}
          placeholder="Select image"
          optionFilterProp="children"
          value={imagePath}
          onSelect={handleSelect}
          // filterOption={(input, option) => {
          //   return (
          //     option !== undefined &&
          //     option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
          //   );
          // }}
          filterSort={(optionA, optionB) => {
            if (optionA === undefined || optionB === undefined) {
              return false;
            }
            return optionA.value
              .toLowerCase()
              .localeCompare(optionB.value.toLowerCase());
          }}
        >
          {imgPathList.map((imgPath, idx) => {
            return (
              <Select.Option key={imgPath} value={imgPath}>
                {path.basename(imgPath)}
              </Select.Option>
            );
          })}
        </Select>
      </span>
      <span style={{ marginLeft: '1em', fontSize: '1.2em' }}>
        <UpOutlined
          style={{ marginRight: '1em', cursor: 'pointer' }}
          onClick={handleUpClick}
        />
        <DownOutlined style={{ cursor: 'pointer' }} onClick={handleDownClick} />
      </span>
      <span style={{ marginLeft: '1em', fontSize: '1.2em' }}>
        <Button type="primary" size="small">
          <SaveOutlined style={{ cursor: 'pointer' }} />
        </Button>
      </span>
    </div>
  );
}

export function ElectronFooter() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}></div>
      <ElectronConfigFileUpload />
      <ElectronDirSelector />
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
