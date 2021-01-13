import { ChangeEvent, useState, useEffect } from 'react';
import isElectron from 'is-electron';
import { Button, Input, Select, Switch } from 'antd';
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
import { getLabelingResult, getLabelingResultPath } from './tools';
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
  useEffect(() => {
    electron.ipcRenderer.once('load-config', handleConfigLoaded);
    // Specify how to clean up after this effect:
    return function cleanupListeners() {
      electron.ipcRenderer.removeAllListeners('load-config');
    };
  });
  const handleConfigLoaded = (event: any, configObject: any) => {
    loadLabelingConfig(configObject, setSetupState, setLabelState);
  };
  const handleUploadClick = () => {
    electron.ipcRenderer.send('load-config');
  };
  return (
    <div className="FooterRow">
      <Button
        style={{ width: 130 }}
        size="small"
        type="default"
        onClick={handleUploadClick}
      >
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

function ElectronWorkplaceControl() {
  const {
    imagePath,
    imageLoadError,
    labelingConfig,
    labelingConfigError,
    setSetupState,
  } = useSetupStore(setupSelector);
  const { keypointGraphList, setLabelState } = useLabelStore(labelSelector);
  const [workspacePath, setWorkspacePath] = useState<string | undefined>(
    undefined
  );
  const [imgPathList, setImgPathList] = useState<string[]>([]);
  const [autoSave, setAutoSave] = useState<boolean>(false);
  useEffect(() => {
    electron.ipcRenderer.once('select-workspace', handleWorkplaceSelected);
    electron.ipcRenderer.once('save-labeling-result', handleResultSaved);
    electron.ipcRenderer.once('load-labeling-result', handleResultLoaded);
    // Specify how to clean up after this effect:
    return function cleanupListeners() {
      electron.ipcRenderer.removeAllListeners('select-workspace');
      electron.ipcRenderer.removeAllListeners('save-labeling-result');
      electron.ipcRenderer.removeAllListeners('load-labeling-result');
    };
  });
  const handleResultLoaded = (event: any, info: any) => {
    const { isExist, labelingResult, success, error } = info;
    if (!isExist) {
      clearLabels();
    } else {
      const s = prepareLabels(labelingResult);
      if (!s) {
        clearLabels();
      }
    }
  };
  const handleWorkplaceSelected = (event: any, workspaceInfo: any) => {
    if (workspaceInfo.workspacePath) {
      setWorkspacePath(workspaceInfo.workspacePath);
    }
    if (workspaceInfo.imgList) {
      setImgPathList(workspaceInfo.imgList);
      if (workspaceInfo.imgList.length > 0) {
        openNewImage(workspaceInfo.imgList[0], autoSave);
      }
    }
  };
  const handleResultSaved = (event: any, info: any) => {
    const { labelingResultPath, success, error } = info;
    const notification = {
      title: 'Saved Successfully',
      body: `Labeling result saved to ${labelingResultPath}`,
    };
    if (!success) {
      notification.title = 'Save Error';
      notification.body = error;
    }
    new window.Notification(notification.title, notification);
  };
  const handleOpenDirClick = () => {
    electron.ipcRenderer.send('select-workspace');
  };
  const handleSelect = (value: string) => {
    openNewImage(value, autoSave);
  };
  const handleUpClick = () => {
    if (imagePath && imgPathList && imgPathList.length > 0) {
      const idx = imgPathList.indexOf(imagePath);
      if (idx > 0) {
        openNewImage(imgPathList[idx - 1], autoSave);
      }
    }
  };
  const handleDownClick = () => {
    if (imagePath && imgPathList && imgPathList.length > 0) {
      const idx = imgPathList.indexOf(imagePath);
      if (idx !== -1 && idx < imgPathList.length - 1) {
        openNewImage(imgPathList[idx + 1], autoSave);
      }
    }
  };
  const handleSwitchAutoSave = (checked: boolean) => {
    setAutoSave(checked);
  };

  const prepareLabels = (labelingResult: any) => {
    if (labelingResult['configVersion'] !== labelingConfig['configVersion']) {
      console.log(
        `labelingResult['configVersion'] !== labelingConfig['configVersion']`
      );
      return false;
    }
    if (
      labelingResult['keypointGraphList'] &&
      labelingResult['keypointGraphList'].length > 0
    ) {
      setLabelState((state) => {
        state.keypointGraphList = labelingResult['keypointGraphList'];
        state.selectedKPG = 0;
        state.selectedKP = undefined;
        state.nextProps = getKPDefaultProps(
          labelingConfig['keypointGraph'],
          labelingResult['keypointGraphList'].length
        );
      });
      return true;
    }
    return false;
  };
  const clearLabels = () => {
    setLabelState((state) => {
      state.keypointGraphList = [[]];
      state.selectedKPG = 0;
      state.selectedKP = undefined;
      state.nextProps = getKPDefaultProps(labelingConfig['keypointGraph'], 0);
    });
  };
  const openNewImage = (newImagePath: string, saveCurrent: boolean) => {
    if (saveCurrent) {
      saveLabelingResult();
    }
    const newLabelingResultPath = getLabelingResultPath(newImagePath);
    setSetupState((state) => {
      state.imagePath = newImagePath;
    });
    electron.ipcRenderer.send('load-labeling-result', newLabelingResultPath);
  };
  const saveLabelingResult = () => {
    if (!imagePath) {
      return;
    }
    const labelingResult = getLabelingResult(
      labelingConfig,
      keypointGraphList,
      labelingConfigError,
      imagePath.replace(`safe-file-protocol://`, ''),
      imageLoadError
    );
    const labelingResultPath = getLabelingResultPath(imagePath);
    electron.ipcRenderer.send('save-labeling-result', {
      labelingResultPath,
      labelingResult,
    });
  };

  return (
    <div className="FooterRow">
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Button
          size="small"
          style={{ width: 130 }}
          type="default"
          onClick={handleOpenDirClick}
        >
          Open Workspace
        </Button>
        <span style={{ marginLeft: '1em', width: 180, textAlign: 'end' }}>
          {workspacePath
            ? `${path.basename(workspacePath)}/`
            : 'workspace not selected'}
        </span>
        <span style={{ marginLeft: '0.4em' }}>
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
          <DownOutlined
            style={{ cursor: 'pointer' }}
            onClick={handleDownClick}
          />
        </span>
        <span style={{ marginLeft: '1em' }}>
          <span style={{ marginRight: '0.5em' }}>Auto Save:</span>
          <Switch
            size="small"
            checked={autoSave}
            onChange={handleSwitchAutoSave}
          />
        </span>
      </div>
      <span style={{ marginLeft: '1em', fontSize: '1.2em' }}>
        <Button
          style={{ width: 50 }}
          type="primary"
          size="small"
          disabled={!imagePath}
        >
          <SaveOutlined
            style={{ cursor: 'pointer' }}
            onClick={saveLabelingResult}
          />
        </Button>
      </span>
    </div>
  );
}

export function ElectronFooter() {
  return (
    <>
      <ElectronConfigFileUpload />
      <ElectronWorkplaceControl />
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
