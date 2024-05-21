/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QrScannerModal = ({ isOpen, onClose, onScan }) => {
  const [qrData, setQrData] = useState('');

  const handleScanQrCode = (data) => {
    if (data) {
      setQrData(data);
      onScan(data);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`}>
      <div className="modal-overlay"></div>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <Scanner className="qr-scanner"
          onResult={handleScanQrCode}
          onError={(error) => console.error('Scan Error:', error?.message)}
        />
      </div>
    </div>
  );
};

export default QrScannerModal;
