import { ChangeEvent, useState } from 'react';
import { Button, Input } from 'antd';
import { useSetupStore, setupSelector } from './App';
import './Footer.css';

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

export function Footer() {
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
    <div className="FooterWrapper">
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
    </div>
  );
}
