import { useEffect, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import Webcam from "react-webcam";
import Bill from './Bill';
import axios from 'axios';
import toast from 'react-hot-toast';

const API  = 'https://qr-billing-api-production.up.railway.app/api/v1/todayRate';

function App() {
  const [tab, setTab] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [data, setData] = useState('No result');
  const [arr, setArr] = useState([]);
  const [pureRate, setPureRate ] = useState(76000);
  const [password, setPassword] = useState('');
  const [payloadRate, setPayloadRate] = useState();
  const [showModal, setShowModal] = useState(false);

  const QRScanHandler = () => {
    setShowQR(true);
  };

  useEffect(() => {
    fetchPureRate()
  }, []);

  const fetchPureRate = async() => {
    const res = await axios.get(API);
    setPureRate(res.data.rate)
  }

  const handleRateUpdate = async() => {
    const payload = {
      rate : payloadRate,
      password : password
    }
    console.log(payload)
    const res = await axios.put(API,payload)
    if(res.data.error){
      toast.error("Admin password was wrong")
      return;
    }
    window.location.reload()
  }
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
 }

  return (
    <div className='flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-amber-400'>
      <div className='w-[12rem]'>
        <div>
          <img src='/assets/logo_english_hd.PNG' alt='Logo' />
        </div>
      </div>
      <div className='fixed right-0 md:right-6 bottom-20 font-semibold text-sm md:text-base'>
        <div className='flex flex-col gap-3'>
          <div>Gold 916 rate : &#8377; {(pureRate*0.8985).toFixed(2)}<span className="line-through">{ (pureRate*0.9167).toFixed(2)  }</span></div>
          <div>Gold 750 rate : &#8377; {(pureRate*0.7707).toFixed(2)}</div>
        </div>
      </div>
      {
        showModal && 
        <Modal
         showModal={showModal}
         setShowModal={setShowModal}
         payloadRate={payloadRate}
         setPayloadRate={setPayloadRate}
         password={password}
         setPassword={setPassword}
         handleRateUpdate={handleRateUpdate}
        />
      }
      {tab === 0 ? (
        <>
          <div className='flex flex-col items-center justify-center gap-5'>
            <div
              onClick={QRScanHandler}
              className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'
            >
              <h1 className='rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
                Scan QR code to get the estimate
              </h1>
            </div>
            {showQR && (
              <>
                <Webcam
                videoConstraints={videoConstraints}
                />
                <QrReader
                onResult={(result, error) => {
                  if (!!result) {
                    setData(result?.text);
                    setArr(result?.text.split(','))
                    setTab(1)
                    setShowQR(false)
                  }
                
                  if (!!error) {
                    console.info(error);
                  }
                }}
                style={{ width: '100%' }}
                ViewFinder={function noRefCheck(){}}
                constraints={{facingMode:'environment'}}
              />
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className='flex flex-col items-center justify-center gap-5'>
            {arr.length > 0 ? (
              <div>
                Bill of :
                {arr?.map((itm, idx) => (
                  <span className='mx-1 font-semibold' key={idx}>
                    {itm}
                  </span>
                ))}
                <Bill 
                 data={arr} 
                 pureRate={pureRate} 
                />
                <div
                  onClick={() => window.location.reload()}
                  className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'
                >
                  <h1 className='rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
                    Scan another QR code
                  </h1>
                </div>
              </div>
            ) : (
              <div>Invalid Response</div>
            )}
          </div>
        </>
      )}
      <h1 onClick={()=>setShowModal(true)} className='cursor-pointer fixed bottom-8 rounded-md text-center text-amber-800 font-semibold shadow-md p-4'>
        Update Today's Rate {"(Only Admin access)"}
      </h1>
    </div>
  );
}

const Modal = ({ 
  showModal = true,
  setShowModal,
  password,
  setPassword,
  payloadRate,
  setPayloadRate,
  handleRateUpdate = () => {}
}) => {
  return (
    <>
      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center  outline-none focus:outline-none">
          <div className='flex flex-col gap-4'>
            <label>Enter Pure Gold Rate : </label>
            <input type='number' onChange={(e)=>setPayloadRate(e.target.value)} value={payloadRate}/>
            <label>Enter Admin password</label>
            <input type='password' onChange={(e)=>setPassword(e.target.value)} value={password}/>
            <button onClick={()=>{
            handleRateUpdate()
            setShowModal(false)
          }} className='p-4 text-teal-400 bg-slate-100 hover:scale-[85%] transition-all delay-100 ease-in-out rounded-md'>
            Update Rate
          </button>
          </div>
          
        </div>
      ) : null}
    </>
  );
};

export default App;
