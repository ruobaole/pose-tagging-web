import { useCallback } from 'react';
import shallow from 'zustand/shallow';
import { useLabelStore, labelSelector } from './App';
import { List } from 'antd';
import './LabelDataDisplay.css';

function ItemList() {
  const kpgList = useLabelStore(
    (state) => Object.keys(state.keypointGraphList),
    shallow
  );
  const itemList: string[] = kpgList.map((kpgKey) => {
    return `Keypoint Graph #${kpgKey}`;
  });
  return (
    <>
      <div>Item List:</div>
      <List
        size="small"
        bordered
        dataSource={itemList}
        renderItem={(item) => (
          <List.Item
            style={{
              fontSize: 'small',
              color: '#2a3c40',
              fontFamily: 'monospace',
            }}
          >
            {item}
          </List.Item>
        )}
      />
    </>
  );
}

export function ItemDetail() {
  const { keypointGraphList, curKPG } = useLabelStore(labelSelector);
  return (
    <>
      <div>Detail:</div>
      {JSON.stringify(keypointGraphList[curKPG])}
    </>
  );
}

export function LabelDataDisplay() {
  return (
    <>
      Label Data
      <div className="ItemList">
        <ItemList />
      </div>
      <div className="ItemDetail">
        <ItemDetail />
      </div>
    </>
  );
}
