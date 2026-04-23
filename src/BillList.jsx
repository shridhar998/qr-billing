// // versi "react-qr-reader" 1.0.0. component API harus disesuaikan dengan yg baru

// import { useState } from "react";
// import { QrReader } from "react-qr-reader";

// const App2 = () => {
//   const [selected, setSelected] = useState("environment");
//   const [startScan, setStartScan] = useState(false);
//   const [loadingScan, setLoadingScan] = useState(false);
//   const [data, setData] = useState("");

//   const handleScan = async (scanData) => {
//     setLoadingScan(true);
//     console.log(`loaded data data`, scanData);
//     if (scanData && scanData !== "") {
//       console.log(`loaded >>>`, scanData);
//       setData(scanData);
//       setStartScan(false);
//       setLoadingScan(false);
//       // setPrecScan(scanData);
//     }
//   };
//   const handleError = (err) => {
//     console.error(err);
//   };
//   return (
//     <div className="z-[1000] flex flex-col justify-center items-center font-mono text-center">
//       <h1>Hello CodeSandbox</h1>
//       <h2>
//         Last Scan:
//         {selected}
//       </h2>

//       <button
//         onClick={() => {
//           setStartScan(!startScan);
//         }}
//       >
//         {startScan ? "Stop Scan" : "Start Scan"}
//       </button>
//       {startScan && (
//         <>
//           <select onChange={(e) => setSelected(e.target.value)}>
//             <option value={"environment"}>Back Camera</option>
//             <option value={"user"}>Front Camera</option>
//           </select>
//           <QrReader
//             facingMode={selected}
//             delay={1000}
//             onError={handleError}
//             onScan={handleScan}
//             // chooseDeviceId={()=>selected}
//             style={{ width: "300px" }}
//           />
//         </>
//       )}
//       {loadingScan && <p>Loading</p>}
//       {data !== "" && <p>{data}</p>}
//     </div>
//   );
// };

// export default App2;
import React from 'react';
import Bill, { calculateBill } from './Bill';

/**
 * BillList
 * Renders one <Bill> row per scanned item, a remove button for each,
 * and a grand-total summary across all items.
 */
const BillList = ({ items = [], pureRate, onRemove }) => {
  // Compute totals across all items using the shared helper from Bill.jsx
  const grandTotal = items.reduce(
    (acc, data) => {
      const result = calculateBill(data, pureRate);
      return {
        goldAmount: acc.goldAmount + result.goldAmount,
        stonePrice: acc.stonePrice + result.stonePrice,
        gstAmount: acc.gstAmount + result.gstAmount,
        totalAmount: acc.totalAmount + result.totalAmount,
      };
    },
    { goldAmount: 0, stonePrice: 0, gstAmount: 0, totalAmount: 0 }
  );

  const hasStone = items.some((data) => data.length > 3);

  return (
    <div className="w-full">
      {/* Per-item bills */}
      {items.map((item, idx) => (
        <div key={idx} className="relative mb-4">
          {/* Item header */}
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-sm font-semibold text-amber-900">
              Item {idx + 1} —{' '}
              <span className="uppercase">{item[1]}</span>{' '}
              ({item[0]})
            </span>
            <button
              onClick={() => onRemove(idx)}
              className="text-xs text-red-600 font-bold border border-red-400 rounded px-2 py-0.5 hover:bg-red-100 transition-colors"
            >
              ✕ Remove
            </button>
          </div>

          <Bill data={item} pureRate={pureRate} />
        </div>
      ))}

      {/* Grand Total — only shown when 2+ items */}
      {items.length >= 2 && (
        <div className="mt-6 border-2 border-amber-800 rounded-md p-3 bg-amber-50 md:text-base text-xs">
          <h2 className="text-center font-bold text-amber-900 text-base md:text-lg mb-3 tracking-wide">
            GRAND TOTAL ({items.length} Items)
          </h2>

          <div className="grid grid-cols-2 gap-y-2">
            <div className="font-semibold text-gray-700">Gold Amount</div>
            <div className="text-right">&#8377; {grandTotal.goldAmount.toFixed(2)}</div>

            {hasStone && (
              <>
                <div className="font-semibold text-gray-700">Stone Amount</div>
                <div className="text-right">&#8377; {grandTotal.stonePrice.toFixed(2)}</div>
              </>
            )}

            <div className="font-semibold text-gray-700">
              GST 3% (SGST 1.5% + CGST 1.5%)
            </div>
            <div className="text-right">&#8377; {grandTotal.gstAmount.toFixed(2)}</div>

            <div className="col-span-2 border-t border-amber-800 mt-1 pt-2 flex justify-between font-bold text-amber-900 text-sm md:text-base">
              <span>Total Payable</span>
              <span>&#8377; {grandTotal.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;
