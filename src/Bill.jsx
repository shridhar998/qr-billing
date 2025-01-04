import React, {useEffect, useState} from 'react'

const Bill = ({
    data = ['916','tika','3.41'],
    pureRate ,
}) => {
    const [purity, setPurity] = useState('')
    const [name, setName] = useState('')
    const [wt, setWt] = useState(0)
    const [rate, setRate] = useState(0)
    const [bamt, setbamt] = useState(0)
    const [making, setMaking] = useState(0)
    useEffect(() => {
      if(data.length > 0){
        if(data[0] === '916'){
            if(data[1]==='Chain' || data[1]==='chain'){
              setMaking(0.09)
            }
            else if(parseFloat(data[2])<3.00){
              setMaking(0.18)
            }
            else{
              setMaking(0.15)
            }
            setRate((parseFloat(pureRate)*0.08985).toFixed(2))
        }
        else if(data[0] === '750'){
          if(data[1]==='Chain' || data[1]==='chain'){
            setMaking(0.10)
          }
          else if(parseFloat(data[2])<3.00){
            setMaking(0.20)
          }
          else if(parseFloat(data[2])<5.00 && parseFloat(data[2])>=3.00){
            setMaking(0.18)
          }
          else{
            setMaking(0.15)
          }
            setRate((parseFloat(pureRate)*0.0755).toFixed(2))
        }
        setPurity(data[0])
        setName(data[1].toString().toUpperCase())
        setWt(parseFloat(data[2]).toFixed(3))
      }
    }, [data])

    
  return (
    <div className="md:text-base text-xs grid grid-cols-10 text-center my-5 p-1 border-2 rounded-md border-gray-800">
      
        <div className="col-span-1 font-normal md:font-bold border border-black py-2 animate-column">Purity</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Item Name</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Weight</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Rate</div>
        <div className="col-span-1 font-normal md:font-bold border border-black py-2 animate-column">Making charges</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Billing Amount</div>
      
      
        <div className="col-span-1 p-3 font-normal md:font-bold border border-black animate-column">{purity}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{name}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{wt}{"gm"}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{rate}</div>
        <div className="col-span-1 p-3 font-normal md:font-bold border border-black animate-column">{making*100}{"%"}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">&#8377;{(wt*rate*(1+making)).toFixed(2)}</div>

        <div className="col-span-8 font-bold py-2 border border-black animate-column"><span>GST {"3%"} SGST+CGST{"(1.5% + 1.5%)"}</span><span className='font-normal ml-10'>GST Amount :</span></div>
        <div className="col-span-2 p-3 font-bold py-2 border border-black animate-column">&#8377;{(wt*rate*(1+making)*0.03).toFixed(2)}</div>
      
        <div className="col-span-8 font-bold py-2 border border-black animate-column">Total amount : </div>
        <div className="col-span-2 font-bold py-2 border border-black animate-column">&#8377;{(wt*rate*(1+making)*1.03).toFixed(2)}</div>
    </div>
  )
}

export default Bill
