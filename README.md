# Inventoriser


## Overview


This project is a simplified version of an Inventory Location System. It allows users to select items from a dropdown list, enter quantities, and manage their product's physical locations through QR code scanning.


## Features


- **Item Selection:** Users can choose items from a dropdown list and enter quantities.
- **Text Numerals Display:** Displays text numerals (e.g., one thousand one hundred) below the quantity input.
- **Auto-set Unit:** The unit is auto-set based on the selected item.
- **QR Code Scanning:** Users can scan QR codes to indicate item locations.
- **Allowed Locations:** Each item has predefined allowed locations.
- **Move Item:** Items are moved to new locations upon correct QR scanning.
- **Error Handling:** Shows an error toaster if the scanned location is incorrect.


## Technology Stack


- **Frontend:** React, CSS, HTML, Javascript 
- **External Library:** QR code scanning library `https://www.npmjs.com/package/@yudiel/react-qr-scanner`
- **APIs:** 
  - GET `https://api-staging.inveesync.in/test/get-items`
  - POST `https://api-staging.inveesync.in/test/submit`


## Installation


1. Clone the repository: `git clone https://github.com/your-username/inventory-location-system.git`
2. Install dependencies: `npm install`
3. Run the application: `npm start`


## Additional Notes


- For testing, generate QR codes for allowed locations using any online QR code generator.