/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QrScannerModal from "./QrScannerModal";

const App = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [units, setUnits] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [quantityInWords, setQuantityInWords] = useState("");
  const [qrData, setQrData] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchItems = async () => {
      const response = await fetch(
        "https://api-staging.inveesync.in/test/get-items"
      );
      const data = await response.json();
      setItems(data);
      setIsLoading(false);
    };

    fetchItems();
  }, []);

  const handleItemChange = (event) => {
    const selectedItem = event.target.value;
    const selectedUnit =
      items.find((item) => item.item_name === selectedItem)?.unit || "";
    setSelectedItem(selectedItem);
    setUnits(selectedUnit);
  };

  const handleQuantityChange = (event) => {
    const input = event.target.value.trim();
    if (!input) {
      setQuantityInWords("Zero");
      setQuantity();
    } else {
      const newQuantity = parseInt(input, 10);
      setQuantity(newQuantity);
      setQuantityInWords(convertToWords(newQuantity));
    }
  };

  const handleDestinationClick = () => {
    setShowQrModal(true);
    setToastMessage("");
    setQrData("");
    setQuantityInWords("");
  };

  const handleScanQrCode = (data) => {
    if (data) {
      setQrData(data);
      setShowQrModal(false);
    }
  };

  const handleSubmit = async () => {
    if (!qrData) {
      showToast("Please scan the QR code for destination");
      return;
    }

    const selectedItemData = items.find(
      (item) => item.item_name === selectedItem
    );
    if (!selectedItemData) {
      showToast("Invalid item selected");
      return;
    }

    if (!selectedItemData.allowed_locations.includes(qrData)) {
      showToast("Destination not allowed for selected item. Please try again.");
      setQrData("");
      return;
    }

    const response = await fetch(
      "https://api-staging.inveesync.in/test/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            id: selectedItemData.id,
            item_name: selectedItemData.item_name,
            location: qrData,
          },
        ]),
      }
    );

    if (response.ok) {
      showToast("Submitted successfully!", "success");
      setSelectedItem("");
      setUnits("");
      setQuantity(0);
    } else {
      showToast("Error", "error");
    }
    setQrData("");
  };

  const showToast = (message, type = "error") => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const convertToWords = (n) => {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const num = parseInt(n, 10);
    if (num === 0) {
      return "Zero";
    }
    if (num < 20) {
      return ones[num];
    }
    if (num < 100) {
      return tens[Math.floor(num / 10)] + " " + ones[num % 10];
    }
    if (num < 1000) {
      return (
        ones[Math.floor(num / 100)] + " hundred " + convertToWords(num % 100)
      );
    }
    if (num < 1000000) {
      return (
        convertToWords(Math.floor(num / 1000)) +
        " thousand " +
        convertToWords(num % 1000)
      );
    }
    if (num < 1000000000) {
      return (
        convertToWords(Math.floor(num / 1000000)) +
        " million " +
        convertToWords(num % 1000000)
      );
    }
    return "Number too large";
  };

  return (
    <>
      {!isLoading && <div></div>}
      <div className="container">
        <h1>Inventorizer</h1>
        <div>
          <label htmlFor="itemSelect">Select Item:</label>
          <select
            id="itemSelect"
            value={selectedItem}
            onChange={handleItemChange}
          >
            <option value="">Select</option>
            {items.map((item) => (
              <option key={item.id} value={item.item_name}>
                {item.item_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantityInput">Quantity:</label>
          <input
            type="number"
            id="quantityInput"
            value={quantity}
            min="0"
            onChange={handleQuantityChange}
          />
          {quantityInWords && (
            <span className="quantityInWords">{quantityInWords}</span>
          )}
        </div>

        <div className="unitsInput">
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

        {showQrModal && (
          <QrScannerModal
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            onScan={handleScanQrCode}
          />
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <button id="submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </>
  );
};

export default App;
