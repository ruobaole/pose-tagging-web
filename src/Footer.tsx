import { ChangeEvent, useState } from 'react';
import { Button, Input } from 'antd';
import { useSetupStore, setupSelector } from './App';
import './Footer.css';

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
    </div>
  );
}
