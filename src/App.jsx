// -- newest with zoom and all functions:
import { useEffect, useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import BillList from './BillList';
import toast from 'react-hot-toast';

// ── Detect iOS ────────────────────────────────────────────────────────────────
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function App() {
  const [tab, setTab] = useState(0);
  const [lastUpdate, setLastUpdate]= useState("20-01-2026");
  const [showQR, setShowQR] = useState(false);
  const [billItems, setBillItems] = useState([]);
  const [pureRate, setPureRate] = useState(10450);
  const [usesCSSZoom, setUsesCSSZoom] = useState(false); // true when iOS fallback is active

  const scanSessionId = useRef(0);
  const activeScanSession = useRef(0);
  const zoomRetryRef = useRef(null);

  useEffect(() => {
    const localRate = localStorage.getItem('pureRate');
    const localDate = localStorage.getItem('lastUpdate');
    if (localRate) setPureRate(Number(localRate));
    if (localDate) setLastUpdate(localDate);
  }, []);

  // ── Zoom effect: hardware zoom on Android, CSS scale fallback on iOS ────────
  useEffect(() => {
    if (!showQR) {
      if (zoomRetryRef.current) {
        clearInterval(zoomRetryRef.current);
        zoomRetryRef.current = null;
      }
      setUsesCSSZoom(false);
      return;
    }
    function formatDate(dateString) {
       const date = new Date(dateString);
       const day = String(date.getUTCDate()).padStart(2, "0");
       const month = String(date.getUTCMonth() + 1).padStart(2, "0");
       const year = date.getUTCFullYear();
       return `${day}-${month}-${year}`;
    }
    const applyZoom = async () => {
      try {
        const videoEl = document.querySelector('video');
        if (!videoEl || !videoEl.srcObject) return false; // not ready yet

        const track = videoEl.srcObject.getVideoTracks()[0];
        if (!track) return false;

        const capabilities = track.getCapabilities();

        if (capabilities.zoom) {
          // ✅ Android / desktop: real hardware zoom
          const targetZoom = Math.min(2, capabilities.zoom.max);
          await track.applyConstraints({ advanced: [{ zoom: targetZoom }] });
          console.info(`Hardware zoom applied: ${targetZoom}x`);
          setUsesCSSZoom(false);
          return true;
        } else {
          // ✅ iOS fallback: CSS scale on the video element
          // Scale up the video visually inside its clipped container.
          // The QrReader's internal decoder still sees the full frame,
          // but the user gets a magnified preview making it easier to aim.
          console.info('Hardware zoom unavailable — applying CSS zoom fallback');
          videoEl.style.transform = 'scale(2)';
          videoEl.style.transformOrigin = 'center center';
          setUsesCSSZoom(true);
          return true;
        }
      } catch (err) {
        console.info('Zoom attempt failed, will retry:', err);
        return false;
      }
    };

    zoomRetryRef.current = setInterval(async () => {
      const done = await applyZoom();
      if (done) {
        clearInterval(zoomRetryRef.current);
        zoomRetryRef.current = null;
      }
    }, 300);

    return () => {
      if (zoomRetryRef.current) {
        clearInterval(zoomRetryRef.current);
        zoomRetryRef.current = null;
      }
    };
  }, [showQR, scanSessionId.current]);

  const openScanner = () => {
    scanSessionId.current += 1;
    activeScanSession.current = scanSessionId.current;
    setShowQR(true);
  };

  const fetchMetalRates = async () => {
    try {
      const url =
        'https://api.metals.dev/v1/latest?api_key=QLOZSXK4X0ITJJC6AM5H818C6AM5H&currency=INR&unit=g';
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();

      if (result?.status === 'success' && result?.metals?.mcx_gold) {
        const newRate = Number((result.metals.mcx_gold)*1.01);
        const updateDate = result.timestamps.metal;
        // console.log(updateDate);
       const date1 = new Date(updateDate);
       const day1 = String(date1.getUTCDate()).padStart(2, "0");
       const month1 = String(date1.getUTCMonth() + 1).padStart(2, "0");
       const year1 = date1.getUTCFullYear();
        const newDate = `${day1}-${month1}-${year1}`
        setLastUpdate(newDate)
        setPureRate(newRate);
        localStorage.setItem('pureRate', newRate);
        localStorage.setItem('lastUpdate', newDate);
        toast.success("Today's MCX gold rate and timing updated");
      } else {
        toast.error('Failed to fetch MCX gold rate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching MCX rate');
    }
  };

  const makeResultHandler = (sessionId) => (result, error) => {
    if (sessionId !== activeScanSession.current) return;

    if (result?.text) {
      const parsed = result.text.split(',');
      if (parsed.length >= 3) {
        activeScanSession.current = -1;
        setBillItems((prev) => [...prev, parsed]);
        setTab(1);
        setShowQR(false);
        toast.success('Item added to bill');
      } else {
        toast.error('Invalid QR format. Expected: purity,name,weight[,stonePrice]');
      }
    }

    if (error) console.info(error);
  };

  const handleRemoveItem = (index) => {
    setBillItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setTab(0);
      return updated;
    });
  };

  const handleReset = () => {
    activeScanSession.current = -1;
    setTab(0);
    setBillItems([]);
    setShowQR(false);
  };

  // On iOS the video is CSS-scaled 2x inside this container.
  // overflow-hidden clips it so it doesn't spill outside the box,
  // giving the appearance of a zoomed-in camera view.
  const Scanner = () => (
    <div
      className="w-full max-w-sm mx-auto rounded-lg border-2 border-amber-600 shadow-lg"
      style={{
        overflow: 'hidden',
        // On iOS, the video scale(2) doubles its visual size.
        // We fix the container height so it doesn't push the layout around.
        height: usesCSSZoom ? '300px' : 'auto',
        position: 'relative',
      }}
    >
      {usesCSSZoom && (
        <div className="absolute top-2 left-0 right-0 z-10 text-center">
          <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            2× Preview (iOS)
          </span>
        </div>
      )}
      <QrReader
        key={scanSessionId.current}
        onResult={makeResultHandler(activeScanSession.current)}
        style={{ width: '100%' }}
        ViewFinder={() => null}
        constraints={{ facingMode: 'environment' }}
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-amber-400">
      {/* Logo */}
      <div className="w-[12rem] max-sm:-translate-x-[20vw]">
        <img src="/assets/logo_english_hd.PNG" alt="Logo" />
      </div>

      {/* Live Rate Display */}
      <div className="fixed right-0 md:right-6 top-6 font-semibold text-sm md:text-base">
        <div className="flex flex-col gap-3 text-sm">
          <div>On {lastUpdate} </div>
          <div>22k916 rate : &#8377; {(pureRate * 0.9166).toFixed(2)}</div>
          <div>18k750 rate : &#8377; {(pureRate * 0.75).toFixed(2)}</div>
        </div>
      </div>

      {tab === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 w-full px-4">
          <div
            onClick={openScanner}
            className="cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out"
          >
            <h1 className="rounded-md text-center text-amber-800 font-semibold shadow-md p-4">
              Scan QR code to get the estimate
            </h1>
          </div>

          {showQR && <Scanner />}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-5 w-full px-2">
          {billItems.length > 0 ? (
            <>
              <BillList
                items={billItems}
                pureRate={pureRate}
                onRemove={handleRemoveItem}
              />

              <div
                onClick={openScanner}
                className="cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out"
              >
                <h1 className="rounded-md text-center text-green-800 font-semibold shadow-md p-4 bg-green-100">
                  + Scan &amp; Add Another Item
                </h1>
              </div>

              {showQR && <Scanner />}

              <div
                onClick={handleReset}
                className="cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out"
              >
                <h1 className="rounded-md text-center text-amber-800 font-semibold shadow-md p-4">
                  New Bill (Clear All)
                </h1>
              </div>
            </>
          ) : (
            <div>No items in bill.</div>
          )}
        </div>
      )}

      <h1
        onClick={fetchMetalRates}
        className="cursor-pointer fixed bottom-8 rounded-md text-center text-amber-800 font-semibold shadow-md p-4"
      >
        Fetch Today's Rate
      </h1>
    </div>
  );
}

export default App;



// import { useEffect, useState, useRef } from 'react';
// import { QrReader } from 'react-qr-reader';
// import Webcam from "react-webcam";
// import Bill from './Bill';
// import toast from 'react-hot-toast';

// function App() {
//   const [cart, setCart] = useState([]);
//   const [pureRate, setPureRate] = useState(10450);
//   const [showScanner, setShowScanner] = useState(false);
//   const lastScannedRef = useRef(null);

//   useEffect(() => {
//     const localRate = localStorage.getItem('pureRate');
//     if (localRate) setPureRate(Number(localRate));
//   }, []);

//   const fetchMetalRates = async () => {
//     try {
//       const url = 'https://api.metals.dev/v1/latest?api_key=WR7YI2TLB495N46WKLRA4536WKLRA&currency=INR&unit=g'
//       const result = await res.json();

//       if (result?.status === "success" && result?.metals?.mcx_gold) {
//         const rate = Number(result.metals.mcx_gold) * 1.03;
//         setPureRate(rate);
//         localStorage.setItem('pureRate', rate);
//         toast.success("Today's MCX gold rate updated");
//       } else {
//         toast.error("Failed to fetch rate");
//       }
//     } catch {
//       toast.error("Error fetching rate");
//     }
//   };

//   const parseQR = (text) => {
//     const p = text.split(',');
//     return {
//       id: crypto.randomUUID(),
//       purity: p[0],
//       name: p[1],
//       weight: Number(p[2]),
//       stonePrice: p[3] ? Number(p[3]) : 0
//     };
//   };

//   const handleQRResult = (result) => {
//     if (!result?.text) return;

//     if (lastScannedRef.current === result.text) return;
//     lastScannedRef.current = result.text;

//     const item = parseQR(result.text);

//     setCart(prev => {
//       const exists = prev.some(
//         p =>
//           p.purity === item.purity &&
//           p.name === item.name &&
//           p.weight === item.weight &&
//           p.stonePrice === item.stonePrice
//       );
//       return exists ? prev : [...prev, item];
//     });

//     setShowScanner(false);

//     setTimeout(() => {
//       lastScannedRef.current = null;
//     }, 6200);
//   };

//   const removeItem = (id) => {
//     setCart(prev => prev.filter(i => i.id !== id));
//   };

//   const clearCart = () => setCart([]);

//   const printEstimate = () => {
//     window.print();
//   };

//   const videoConstraints = {
//     facingMode: "environment"
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-amber-400 p-4">

//       <div className="flex justify-center">
//         <img src="/assets/logo_english_hd.PNG" className="w-48" />
//       </div>

//       <div className="fixed right-4 top-20 text-sm font-semibold">
//         <div>Gold 916: ₹ {(pureRate * 0.9167).toFixed(2)}</div>
//         <div>Gold 750: ₹ {(pureRate * 0.755).toFixed(2)}</div>
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-center gap-4 my-6">
//         <button
//           onClick={() => setShowScanner(true)}
//           className="px-6 py-3 bg-amber-600 text-white rounded-md font-semibold"
//         >
//           {cart.length === 0 ? "Scan First Item" : "Add Item"}
//         </button>

//         {cart.length > 0 && (
//           <>
//             <button
//               onClick={printEstimate}
//               className="px-6 py-3 bg-green-700 text-white rounded-md font-semibold"
//             >
//               Print Estimate
//             </button>

//             <button
//               onClick={clearCart}
//               className="px-6 py-3 bg-red-600 text-white rounded-md font-semibold"
//             >
//               New Bill
//             </button>
//           </>
//         )}
//       </div>

//       {/* Scanner */}
//       {showScanner && (
//         <div className="max-w-md mx-auto">
//           <Webcam videoConstraints={videoConstraints} />
//           <QrReader
//             onResult={handleQRResult}
//             constraints={{ facingMode: 'environment' }}
//           />
//         </div>
//       )}

//       {/* Bill */}
//       {cart.length > 0 && (
//         <Bill
//           data={cart}
//           pureRate={pureRate}
//           removeItem={removeItem}
//         />
//       )}

//       <button
//         onClick={fetchMetalRates}
//         className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-amber-200 rounded-md font-semibold shadow-md"
//       >
//         Fetch Today’s Rate
//       </button>

//     </div>
//   );
// }

// export default App;

// // older version 2.0
// // import { useEffect, useState } from 'react';
// // import { QrReader } from 'react-qr-reader';
// // import Webcam from "react-webcam";
// // import Bill from './Bill';
// // import toast from 'react-hot-toast';

// // function App() {
// //   const [tab, setTab] = useState(0);
// //   const [showQR, setShowQR] = useState(false);
// //   const [data, setData] = useState('No result');
// //   const [arr, setArr] = useState([]);
// //   const [pureRate, setPureRate] = useState(10450);

// //   const QRScanHandler = () => {
// //     setShowQR(true);
// //   };

// //   useEffect(() => {
// //     const localRate = localStorage.getItem('pureRate');
// //     if (localRate) {
// //       setPureRate(Number(localRate));
// //     }
// //   }, []);

// //   // 🔑 Fetch MCX API
// //   const fetchMetalRates = async () => {
// //     try {
// //      // const url = 'https://api.metals.dev/v1/latest?api_key=WR7YI2TLB495N46WKLRA4536WKLRA&currency=INR&unit=g' // ye wala use ho gya
// //       const url = 'https://api.metals.dev/v1/latest?api_key=QLOZSXK4X0ITJJC6AM5H818C6AM5H&currency=INR&unit=g'// ye 26/01/26 ko
// //       const response = await fetch(url, {
// //         headers: {
// //           'Accept': 'application/json',
// //         },
// //       });

// //       const result = await response.json();
// //       console.log("Fetched rate:", result);

// //       if (result?.status === "success" && result?.metals?.mcx_gold) {
// //         setPureRate(Number(result.metals.mcx_gold)*1.03);
// //         localStorage.setItem('pureRate', Number(result.metals.mcx_gold)*1.03);
// //         toast.success("Today's MCX gold rate updated");
// //       } else {
// //         toast.error("Failed to fetch MCX gold rate");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Error fetching MCX rate");
// //     }
// //   };

// //   const videoConstraints = {
// //     width: 1280,
// //     height: 720,
// //     facingMode: "environment"
// //   };

// //   return (
// //     <div className='flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-amber-400'>
// //       <div className='w-[12rem]'>
// //         <div>
// //           <img src='/assets/logo_english_hd.PNG' alt='Logo' />
// //         </div>
// //       </div>

// //       <div className='fixed right-0 md:right-6 bottom-20 font-semibold text-sm md:text-base'>
// //         <div className='flex flex-col gap-3'>
// //           <div>Gold 916 rate : &#8377; {(pureRate * 0.9167).toFixed(2)}</div>
// //           <div>Gold 750 rate : &#8377; {(pureRate * 0.755).toFixed(2)}</div>
// //         </div>
// //       </div>

// //       {tab === 0 ? (
// //         <div className='flex flex-col items-center justify-center gap-5'>
// //           <div
// //             onClick={QRScanHandler}
// //             className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'
// //           >
// //             <h1 className='rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
// //               Scan QR code to get the estimate
// //             </h1>
// //           </div>

// //           {showQR && (
// //             <>
// //               <Webcam videoConstraints={videoConstraints} />
// //               <QrReader
// //                 onResult={(result, error) => {
// //                   if (!!result) {
// //                     setData(result?.text);
// //                     setArr(result?.text.split(','));
// //                     setTab(1);
// //                     setShowQR(false);
// //                   }

// //                   if (!!error) {
// //                     console.info(error);
// //                   }
// //                 }}
// //                 style={{ width: '100%' }}
// //                 ViewFinder={function noRefCheck() { }}
// //                 constraints={{ facingMode: 'environment' }}
// //               />
// //             </>
// //           )}
// //         </div>
// //       ) : (
// //         <div className='flex flex-col items-center justify-center gap-5'>
// //           {arr.length > 0 ? (
// //             <div>
// //               Bill of :
// //               {arr?.map((itm, idx) => (
// //                 <span className='mx-1 font-semibold' key={idx}>
// //                   {itm}
// //                 </span>
// //               ))}
// //               <Bill data={arr} pureRate={pureRate} />
// //               <div
// //                 onClick={() => {
// //                   setTab(0);
// //                   setArr([]);
// //                   setShowQR(false);
// //                 }}
// //                 className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'
// //               >
// //                 <h1 className='rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
// //                   Scan another QR code
// //                 </h1>
// //               </div>
// //             </div>
// //           ) : (
// //             <div>Invalid Response</div>
// //           )}
// //         </div>
// //       )}

// //       {/* 🔘 Replaced "Update Today's Rate" with Fetch button */}
// //       <h1
// //         onClick={fetchMetalRates}
// //         className='cursor-pointer fixed bottom-8 rounded-md text-center text-amber-800 font-semibold shadow-md p-4'
// //       >
// //         Fetch Today's Rate
// //       </h1>
// //     </div>
// //   );
// // }

// // export default App;



// // Older Version
// // import { useEffect, useState } from 'react';
// // import { QrReader } from 'react-qr-reader';
// // import Webcam from "react-webcam";
// // import Bill from './Bill';
// // import toast from 'react-hot-toast';

// // function App() {
// //   const [tab, setTab] = useState(0);
// //   const [showQR, setShowQR] = useState(false);
// //   const [data, setData] = useState('No result');
// //   const [arr, setArr] = useState([]);
// //   const [pureRate, setPureRate] = useState(10450);
// //   const [password, setPassword] = useState('');
// //   const [payloadRate, setPayloadRate] = useState('');
// //   const [showModal, setShowModal] = useState(false);

// //   const QRScanHandler = () => {
// //     setShowQR(true);
// //   };

// //   useEffect(() => {
// //     const localRate = localStorage.getItem('pureRate');
// //     if (localRate) {
// //       setPureRate(Number(localRate));
// //     }
// //   }, []);

// //   const handleRateUpdate = () => {
// //     if (password !== 'sdg453') {
// //       toast.error("Admin password was wrong");
// //       return;
// //     }

// //     if (!payloadRate || isNaN(payloadRate)) {
// //       toast.error("Please enter a valid rate");
// //       return;
// //     }

// //     localStorage.setItem('pureRate', payloadRate);
// //     setPureRate(Number(payloadRate));
// //     setShowModal(false);
// //     toast.success("Rate updated successfully");
// //   };

// //   const videoConstraints = {
// //     width: 1280,
// //     height: 720,
// //     facingMode: "environment"
// //   };

// //   return (
// //     <div className='flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-amber-400'>
// //       <div className='w-[12rem]'>
// //         <div>
// //           <img src='/assets/logo_english_hd.PNG' alt='Logo' />
// //         </div>
// //       </div>

// //       <div className='fixed right-0 md:right-6 bottom-20 font-semibold text-sm md:text-base'>
// //         <div className='flex flex-col gap-3'>
// //           <div>Gold 916 rate : &#8377; {(pureRate * 0.9167).toFixed(2)}</div>
// //           <div>Gold 750 rate : &#8377; {(pureRate * 0.77).toFixed(2)}</div>
// //         </div>
// //       </div>

// //       {
// //         showModal &&
// //         <Modal
// //           showModal={showModal}
// //           setShowModal={setShowModal}
// //           payloadRate={payloadRate}
// //           setPayloadRate={setPayloadRate}
// //           password={password}
// //           setPassword={setPassword}
// //           handleRateUpdate={handleRateUpdate}
// //         />
// //       }

// //       {tab === 0 ? (
// //         <div className='flex flex-col items-center justify-center gap-5'>
// //           <div
// //             onClick={QRScanHandler}
// //             className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'
// //           >
// //             <h1 className='rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
// //               Scan QR code to get the estimate
// //             </h1>
// //           </div>

// //           {showQR && (
// //             <>
// //               <Webcam videoConstraints={videoConstraints} />
// //               <QrReader
// //                 onResult={(result, error) => {
// //                   if (!!result) {
// //                     setData(result?.text);
// //                     setArr(result?.text.split(','));
// //                     setTab(1);
// //                     setShowQR(false);
// //                   }

// //                   if (!!error) {
// //                     console.info(error);
// //                   }
// //                 }}
// //                 style={{ width: '100%' }}
// //                 ViewFinder={function noRefCheck() { }}
// //                 constraints={{ facingMode: 'environment' }}
// //               />
// //             </>
// //           )}
// //         </div>
// //       ) : (
// //         <div className='flex flex-col items-center justify-center gap-5'>
// //           {arr.length > 0 ? (
// //             <div>
// //               Bill of :
// //               {arr?.map((itm, idx) => (
// //                 <span className='mx-1 font-semibold' key={idx}>
// //                   {itm}
// //                 </span>
// //               ))}
// //               <Bill data={arr} pureRate={pureRate} />
// //               <div
// //                 onClick={() => {
// //                   setTab(0);
// //                   setArr([]);
// //                   setShowQR(false);
// //                 }}
// //                 className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'
// //               >
// //                 <h1 className='rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
// //                   Scan another QR code
// //                 </h1>
// //               </div>
// //             </div>
// //           ) : (
// //             <div>Invalid Response</div>
// //           )}
// //         </div>
// //       )}

// //       <h1 onClick={() => setShowModal(true)} className='cursor-pointer fixed bottom-8 rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
// //         Update Today's Rate {"(Only Admin access)"}
// //       </h1>
// //     </div>
// //   );
// // }

// // const Modal = ({
// //   showModal = true,
// //   setShowModal,
// //   password,
// //   setPassword,
// //   payloadRate,
// //   setPayloadRate,
// //   handleRateUpdate = () => { }
// // }) => {
// //   return showModal ? (
// //     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
// //       <div className='flex flex-col gap-4 bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md'>
// //         <label>Enter Pure Gold Rate: </label>
// //         <input
// //           type='number'
// //           onChange={(e) => setPayloadRate(e.target.value)}
// //           value={payloadRate}
// //           className='border p-2 rounded'
// //         />
// //         <label>Enter Admin password:</label>
// //         <input
// //           type='password'
// //           onChange={(e) => setPassword(e.target.value)}
// //           value={password}
// //           className='border p-2 rounded'
// //         />
// //         <button
// //           onClick={handleRateUpdate}
// //           className='p-3 text-white bg-amber-600 hover:bg-amber-700 rounded'
// //         >
// //           Update Rate
// //         </button>
// //       </div>
// //     </div>
// //   ) : null;
// // };

// // export default App;
// ------------ did not have zoom
// import { useEffect, useRef, useState } from 'react';
// import { QrReader } from 'react-qr-reader';
// import BillList from './BillList';
// import toast from 'react-hot-toast';

// function App() {
//   const [tab, setTab] = useState(0);
//   const [showQR, setShowQR] = useState(false);
//   const [billItems, setBillItems] = useState([]);
//   const [pureRate, setPureRate] = useState(10450);

//   // Increments every time the scanner is deliberately opened.
//   // Used as React key on QrReader → forces full unmount/remount each session,
//   // which also forces the browser to release the camera stream properly.
//   const scanSessionId = useRef(0);
//   const activeScanSession = useRef(0);

//   useEffect(() => {
//     const localRate = localStorage.getItem('pureRate');
//     if (localRate) setPureRate(Number(localRate));
//   }, []);

//   const openScanner = () => {
//     scanSessionId.current += 1;
//     activeScanSession.current = scanSessionId.current;
//     setShowQR(true);
//   };

//   const fetchMetalRates = async () => {
//     try {
//       const url =
//         'https://api.metals.dev/v1/latest?api_key=WR7YI2TLB495N46WKLRA4536WKLRA&currency=INR&unit=g';
//       const response = await fetch(url, {
//         headers: { Accept: 'application/json' },
//       });
//       const result = await response.json();

//       if (result?.status === 'success' && result?.metals?.mcx_gold) {
//         const newRate = Number(result.metals.mcx_gold) * 1.03;
//         setPureRate(newRate);
//         localStorage.setItem('pureRate', newRate);
//         toast.success("Today's MCX gold rate updated");
//       } else {
//         toast.error('Failed to fetch MCX gold rate');
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error('Error fetching MCX rate');
//     }
//   };

//   // Each QrReader instance captures its session ID at mount time via closure.
//   // Stale instances firing cached results are rejected because their
//   // session ID no longer matches activeScanSession.
//   const makeResultHandler = (sessionId) => (result, error) => {
//     if (sessionId !== activeScanSession.current) return;

//     if (result?.text) {
//       const parsed = result.text.split(',');
//       if (parsed.length >= 3) {
//         activeScanSession.current = -1; // close this session synchronously
//         setBillItems((prev) => [...prev, parsed]);
//         setTab(1);
//         setShowQR(false);        // unmounts QrReader → browser releases camera
//         toast.success('Item added to bill');
//       } else {
//         toast.error('Invalid QR format. Expected: purity,name,weight[,stonePrice]');
//       }
//     }

//     if (error) console.info(error);
//   };

//   const handleRemoveItem = (index) => {
//     setBillItems((prev) => {
//       const updated = prev.filter((_, i) => i !== index);
//       if (updated.length === 0) setTab(0);
//       return updated;
//     });
//   };

//   const handleReset = () => {
//     activeScanSession.current = -1; // invalidate any lingering scanner
//     setTab(0);
//     setBillItems([]);
//     setShowQR(false);
//   };

//   // Single reusable QrReader — keyed by session ID so React fully
//   // unmounts the old instance (and its camera stream) before mounting the new one
//   const Scanner = () => (
//     <div className="w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg border-2 border-amber-600">
//       <QrReader
//         key={scanSessionId.current}
//         onResult={makeResultHandler(activeScanSession.current)}
//         style={{ width: '100%' }}
//         ViewFinder={() => null}
//         constraints={{ facingMode: 'environment' }}
//       />
//     </div>
//   );

//   return (
//     <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-amber-400">
//       {/* Logo */}
//       <div className="w-[12rem]">
//         <img src="/assets/logo_english_hd.PNG" alt="Logo" />
//       </div>

//       {/* Live Rate Display */}
//       <div className="fixed right-0 md:right-6 bottom-20 font-semibold text-sm md:text-base">
//         <div className="flex flex-col gap-3">
//           <div>Gold 916 rate : &#8377; {(pureRate * 0.9167).toFixed(2)}</div>
//           <div>Gold 750 rate : &#8377; {(pureRate * 0.755).toFixed(2)}</div>
//         </div>
//       </div>

//       {tab === 0 ? (
//         /* ── SCAN SCREEN ── */
//         <div className="flex flex-col items-center justify-center gap-5 w-full px-4">
//           <div
//             onClick={openScanner}
//             className="cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out"
//           >
//             <h1 className="rounded-md text-center text-amber-800 font-semibold shadow-md p-4">
//               Scan QR code to get the estimate
//             </h1>
//           </div>

//           {showQR && <Scanner />}
//         </div>
//       ) : (
//         /* ── BILL SCREEN ── */
//         <div className="flex flex-col items-center justify-center gap-5 w-full px-2">
//           {billItems.length > 0 ? (
//             <>
//               <BillList
//                 items={billItems}
//                 pureRate={pureRate}
//                 onRemove={handleRemoveItem}
//               />

//               <div
//                 onClick={openScanner}
//                 className="cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out"
//               >
//                 <h1 className="rounded-md text-center text-green-800 font-semibold shadow-md p-4 bg-green-100">
//                   + Scan &amp; Add Another Item
//                 </h1>
//               </div>

//               {showQR && <Scanner />}

//               <div
//                 onClick={handleReset}
//                 className="cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out"
//               >
//                 <h1 className="rounded-md text-center text-amber-800 font-semibold shadow-md p-4">
//                   New Bill (Clear All)
//                 </h1>
//               </div>
//             </>
//           ) : (
//             <div>No items in bill.</div>
//           )}
//         </div>
//       )}

//       {/* Fetch Rate Button */}
//       <h1
//         onClick={fetchMetalRates}
//         className="cursor-pointer fixed bottom-8 rounded-md text-center text-amber-800 font-semibold shadow-md p-4"
//       >
//         Fetch Today's Rate
//       </h1>
//     </div>
//   );
// }

// export default App;
