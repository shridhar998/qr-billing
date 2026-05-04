// import React from 'react';

// const calculateItem = (item, pureRate) => {
//   let rate = 0, making = 0, perPc = false;
//    let makingAmt = 0;

//   if (item.purity === '916') {
//     rate = pureRate * 0.9167;
//     making = 0.069;
//   }

//   if (item.purity === '750') {
//     rate = pureRate * 0.755;
//     if (item.weight <= 1) {
//       making = 2500;
//       perPc = true;
//     } 
//     else if(item.weight <= 15){
//       making = 0.109
//     }
//     else {
//       making = 0.089;
//     }
//   }
 
//   makingAmt = perPc
//     ? making
//     : item.weight * rate *  making;
//   const goldAmount = perPc
//     ? item.weight * rate + making
//     : item.weight * rate * (1 + making);

//   const subtotal = goldAmount + item.stonePrice;
//   const gst = subtotal * 0.03;
//   const total = subtotal + gst;

//   return { ...item, rate, goldAmount, gst, total };
// };

// const Bill = ({ data, pureRate, removeItem }) => {
//   const items = data.map(i => calculateItem(i, pureRate));
//   const grandTotal = items.reduce((s, i) => s + i.total, 0);

//   return (
//     <div className="print-area p-4 mt-6">

//       <h2 className="text-center font-bold text-xl mb-4">
//         ESTIMATE (NOT A TAX INVOICE)
//       </h2>

//       <table className="w-full border border-black text-sm">
//         <thead>
//           <tr className="border">
//             <th>Item</th>
//             <th>Wt(g)</th>
//             <th>Rate</th>
//             <th>Making</th>
//             <th>Amount</th>
//             <th>{"GST(to be added)"}</th>
//             <th>Total</th>
//             <th className="no-print"></th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map(i => (
//             <tr key={i.id} className="border text-center">
//               <td>{i.purity}{i.name}</td>
//               <td>{i.weight}</td>
//               <td>₹{i.rate.toFixed(2)}</td>
//               <td>{makingAmt}</td>
//               <td>₹{i.goldAmount.toFixed(2)}</td>
//               <td>₹{i.gst.toFixed(2)}</td>
//               <td>₹{i.total.toFixed(2)}</td>
//               <td className="no-print">
//                 <button onClick={() => removeItem(i.id)}>❌</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="text-right font-bold text-lg mt-4">
//         Grand Total: ₹ {grandTotal.toFixed(2)}
//       </div>

//     </div>
//   );
// };

import React from 'react';

// ── Cell uses inline style for gridColumn — bypasses Tailwind JIT entirely ───
const Cell = ({ span = 1, bold = false, children }) => (
  <div
    style={{ gridColumn: `span ${span} / span ${span}` }}
    className={`p-2 border border-black text-center ${
      bold ? 'font-bold' : 'font-normal md:font-semibold'
    } animate-column`}
  >
    {children}
  </div>
);

// ── Pure calculation helper (exported for BillList grand total) ──────────────
export function calculateBill(data, pureRate) {
  if (!data || data.length < 3) {
    return {
      purity: '', name: '', wt: 0, rate: 0,
      making: 0, perPc: false, isStone: false, stonePrice: 0,
      goldAmount: 0, gstAmount: 0, totalAmount: 0,
    };
  }

  const purity     = data[0];
  const name       = data[1].toString().toUpperCase();
  const wt         = parseFloat(data[2]);
  const isStone    = data.length > 3;
  const stonePrice = isStone ? Number(data[3]) : 0;

  let rate   = 0;
  let making = 0;
  let perPc  = false;

  if (purity === '916') {
    rate = parseFloat(pureRate) * 0.9167;

    if      (wt >= 20.0 && ['CHAIN'].includes(name))                                              making = 0.13;
    else if (wt >= 40.0 && ['CHURI'].includes(name))                                              making = 0.12;
    else if (wt >= 30.0 && ['HAR','HARSET','LSET','HARST','CHOKER','LONGSET'].includes(name))     making = 0.13;
    else if (wt >= 30.0)                                                                           making = 0.12;
    else if (wt > 1.5 && wt < 3.0)                                                                making = 0.20;
    else                                                                                           making = 0.18;

  } else if (purity === '750') {
    rate = parseFloat(pureRate) * 0.755;

    if      (wt <= 0.5)  { perPc = true; making = 1500; }
    else if (wt <= 0.8)  { perPc = true; making = 2000; }
    else if (wt <= 1.0)  { perPc = true; making = 2500; }
    else if (wt <= 1.5)  { perPc = true; making = 3000; }
    else if (wt < 2.0)   making = 0.25;
    else if (wt < 3.5)   making = 0.20;
    else if (wt < 5.0)   making = 0.18;
    else if (wt >= 20.0 && ['CHAIN'].includes(name)) making = 0.15;
    else                 making = 0.20;
  }

  const goldAmount  = perPc ? wt * rate + making : wt * rate * (1 + making);
  const base        = goldAmount + stonePrice;
  const gstAmount   = base * 0.03;
  const totalAmount = base * 1.03;

  return {
    purity, name,
    wt:         wt.toFixed(3),
    rate:       rate.toFixed(2),
    making, perPc, isStone, stonePrice,
    goldAmount, gstAmount, totalAmount,
  };
}

// ── Bill component ───────────────────────────────────────────────────────────
const Bill = ({ data = ['916', 'Tika', '3.41'], pureRate }) => {
  const {
    purity, name, wt, rate,
    making, perPc, isStone, stonePrice,
    goldAmount, gstAmount, totalAmount,
  } = calculateBill(data, pureRate);

  const makingLabel = perPc
    ? `${making} per pc`
    : `${(making * 100).toFixed(0)}%`;

  return (
    <div
      className="md:text-base text-xs grid text-center my-5 p-1 border-2 rounded-md border-gray-800 w-full"
      style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
    >
      {/* ── Header ── */}
      <Cell span={1} bold>Purity</Cell>
      <Cell span={2} bold>Item Name</Cell>
      <Cell span={2} bold>Weight</Cell>
      <Cell span={2} bold>Rate</Cell>
      <Cell span={1} bold>Making</Cell>
      <Cell span={2} bold>Gold Amount</Cell>

      {/* ── Data ── */}
      <Cell span={1}>{purity}</Cell>
      <Cell span={2}>{name}</Cell>
      <Cell span={2}>{wt} gm</Cell>
      <Cell span={2}>{rate}</Cell>
      <Cell span={1}>{makingLabel}</Cell>
      <Cell span={2}>&#8377; {goldAmount.toFixed(2)}</Cell>

      {/* ── Stone rows (conditional) ── */}
      {isStone && (
        <>
          <Cell span={3} bold>Stone Details</Cell>
          <Cell span={2} bold>{(stonePrice / 1500).toFixed(2)} ct</Cell>
          <Cell span={3} bold>&#8377; 1500 / ct</Cell>
          <Cell span={2} bold>&#8377; {stonePrice.toFixed(2)}</Cell>

          <Cell span={8} bold>Gold + Stone</Cell>
          <Cell span={2} bold>&#8377; {(goldAmount + stonePrice).toFixed(2)}</Cell>
        </>
      )}

      {/* ── GST ── */}
      <Cell span={8} bold>
        GST 3% &nbsp; SGST + CGST (1.5% + 1.5%)
      </Cell>
      <Cell span={2} bold>&#8377; {gstAmount.toFixed(2)}</Cell>

      {/* ── Total ── */}
      <Cell span={8} bold>Total Amount</Cell>
      <Cell span={2} bold>&#8377; {totalAmount.toFixed(2)}</Cell>
    </div>
  );
};

export default Bill;

