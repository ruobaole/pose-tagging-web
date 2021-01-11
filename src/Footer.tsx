import { Input } from 'antd';
import { useSetupStore, setupSelector } from './App';
import './Footer.css';

export function Footer() {
  const { imagePath, setSetupState } = useSetupStore(setupSelector);
  return (
    <div className="FooterWrapper">
      <Input size="small" placeholder="image URL" value={imagePath} />
    </div>
  );
}
