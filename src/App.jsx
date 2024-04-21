import { useEffect, useState, useRef } from 'react'
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { QrReader } from 'react-qr-reader';
import Bill from './Bill';



function App() {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [data, setData] = useState('No result')
  const [arr, setArr] = useState([])
  const [delayScan , setDelayScan] = useState(500);
  const pureRate = 76100;

  const ref = useRef()

  const QRScanHandler = () => {
    setShowQR(true);
  }


  return (
    <div className='flex flex-col items-center  min-h-screen bg-gradient-to-b from-white to-amber-400'>
      <div className='w-[12rem]'>
        <div><img src='/assets/logo_english_hd.PNG'/></div>
      </div>
      <div className='fixed right-0 md:right-6 top-4 font-semibold text-sm md:text-base'>
        Pure Gold 999 rate : &#8377; {pureRate}
      </div>
      {
        tab === 0 ?
        <>
          <div className='flex flex-col items-center justify-center gap-5'>
            <div onClick={QRScanHandler} className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'>
              <h1 className='rounded-md text-center text-amber-800  font-semibold shadow-md p-4'>Scan QR code to get the estimate</h1>
            </div>
            {
              showQR &&
              <QrReader
                constraints={ {facingMode: 'environment'} }
                onResult={(result, error) => {
                  if (!!result) {
                    setData(result?.text);
                    console.log(result?.text)
                    setShowQR(false)
                    setTab(1)
                    setArr(result?.text.split(','))
                    ref?.current?.stop()
                  }
                
                  if (!!error) {
                    console.info(error);
                  }
                }}
                videoStyle={previewStyle}
                videoContainerStyle={camStyle}
              />
            }
            {/* <p>{data}</p> */}
          </div>
        </>
        :
        <>
          <div className='flex flex-col items-center justify-center gap-5'>
            {
              arr.length > 0 ?
              <div>
                Bill of :
                {
                  arr?.map((itm,idx)=>(
                    <span className='mx-1 font-semibold' key={idx}>{itm}</span>
                  ))
                }
                <Bill data={arr} pureRate={pureRate}/>
                <div onClick={()=>window.location.reload()} className='cursor-pointer hover:scale-[85%] transition-all delay-100 ease-in-out'>
                  <h1 className='rounded-md text-center text-amber-800  font-semibold shadow-md p-4'>Scan another QR code</h1>
                </div>
              </div>
              :
              <div>Invalid Response</div>
            }
          </div>
        </>
      }
      {/* <div className='fixed bottom-5 bg-amber-700 rounded-lg w-[30%]'>
        <div><img src='/assets/ContactAddressNoBg.PNG'/></div>
      </div> */}
    </div>
  )
}

const previewStyle = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  }
  
  const camStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '-100px',
  }

export default App
