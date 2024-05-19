import { useState, useEffect } from 'react';
import './App.css';
import { Scanner } from '@yudiel/react-qr-scanner';

const App = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [units, setUnits] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [quantityInWords, setQuantityInWords] = useState('');
  const [qrData, setQrData] = useState('');
  const [showQrReader, setShowQrReader] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://api-staging.inveesync.in/test/get-items');
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Fetch Items Error:', error.message);
      }
    };

    fetchItems();
  }, []);

  const handleItemChange = (event) => {
    const selectedItem = event.target.value;
    const selectedUnit = items.find((item) => item.item_name === selectedItem)?.unit || '';
    setSelectedItem(selectedItem);
    setUnits(selectedUnit);
  };

  const handleQuantityChange = (event) => {
    const input = event.target.value.trim();
    if (!input) {
      setQuantityInWords('Zero');
      setQuantity();
    } else {
      const newQuantity = parseInt(input, 10);
      setQuantity(newQuantity);
      setQuantityInWords(convertToWords(newQuantity));
    }
  };

  const handleDestinationClick = () => {
    setQrData('');
    setShowQrReader(true); // Show QR reader when destination input is clicked
    setToastMessage(''); // Clear previous toast messages
  };

  const handleScanQrCode = (data) => {
    if (data) {
      setQrData(data);
      setShowQrReader(false); // Close QR reader after successful scan
    }
  };

  const handleSubmit = async () => {
    if (!qrData) {
      setToastMessage('Please scan the QR code for destination');
      return;
    }

    const selectedItemData = items.find((item) => item.item_name === selectedItem);
    if (!selectedItemData) {
      setToastMessage('Invalid item selected');
      return;
    }

    if (!selectedItemData.allowed_locations.includes(qrData)) {
      setToastMessage('Destination not allowed for selected item. Please try again.');
      setQrData('');
      return;
    }

    const response = await fetch('https://api-staging.inveesync.in/test/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ id: selectedItemData.id, item_name: selectedItemData.item_name, location: qrData }]),
    });

    if (response.ok) {
      setToastMessage('Item submitted successfully!');
      // Optionally, you can clear the form fields or reset the state here
    } else {
      throw new Error('Error submitting item');
    }
    setQrData('');
  };

  const convertToWords = (n) => {
    const singleDigit = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'
    ];
    const doubleDigit = [
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const belowHundred = [
      'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    const higherDenominations = ['', 'Thousand', 'Lakh'];
  
    if (n === 0) return 'Zero';
  
    function toWords(num) {
      let words = '';
      if (num < 10) {
        words = singleDigit[num];
      } else if (num < 20) {
        words = doubleDigit[num - 10];
      } else if (num < 100) {
        words = belowHundred[Math.floor(num / 10) - 2] + ' ' + singleDigit[num % 10];
      } else {
        const hundred = singleDigit[Math.floor(num / 100)] + ' Hundred';
        const remainder = toWords(num % 100);
        words = hundred + (remainder ? ' ' + remainder : '');
      }
      return words.trim();
    }
  
    let result = '';
    let index = 0;
    while (n > 0) {
      const chunk = n % 1000;
      if (chunk !== 0) {
        const words = toWords(chunk);
        result = words + ' ' + higherDenominations[index] + ' ' + result;
      }
      n = Math.floor(n / 1000);
      index++;
    }
  
    return result.trim();
  };

  return (
    <div className="container">
      <h1>Inveesync Inventorizer</h1>
      <div>
        <label htmlFor="itemSelect">Select Item:</label>
        <select id="itemSelect" value={selectedItem} onChange={handleItemChange}>
          <option value="">Select</option>
          {items.map((item) => (
            <option key={item.id} value={item.item_name}>{item.item_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="quantityInput">Quantity:</label>
        <input type="number" id="quantityInput" value={quantity} min="0" onChange={handleQuantityChange} />
      </div>
      <div>
        <label htmlFor="unitsInput">Unit:</label>
        <input type="text" id="unitsInput" value={units} readOnly />
      </div>
      <div>
        <label htmlFor="destinationInput">Destination:</label>
        <input
          type="text"
          id="destinationInput"
          onClick={handleDestinationClick}
          value={qrData}
          readOnly
          placeholder="Click to scan QR code"
        />
      </div>
      <p>Quantity in words: {quantityInWords}</p>
      
      {showQrReader && (
        <Scanner
          onResult={handleScanQrCode}
          onError={(error) => console.error('Scan Error:', error?.message)}
        />
      )}
      {toastMessage && <div className="toast">{toastMessage}</div>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default App;
