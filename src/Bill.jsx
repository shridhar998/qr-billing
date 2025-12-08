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
    const [perPc, setPerPc] = useState(false)
    const [isStone, setIsStone] = useState(false)
    const [stonePrice, setStonePrice] = useState(0)
    useEffect(() => {
      if(data.length > 0){
          if(data.length > 3){
              setIsStone(true)
              setStonePrice(Number(data[3]))
          }
        if(data[0] === '916'){
            if(parseFloat(data[2])>=20.0 && (data[1]==='Chain' || data[1]==='chain' || data[1]==='CHAIN')){
              setMaking(0.13)
            }
            else if(parseFloat(data[2])>=40.0 && (data[1]==='Churi' || data[1]==='churi'|| data[1]==='CHURI')){
              setMaking(0.12)
            }
            else if(parseFloat(data[2])>=30.0 && (
                data[1]==='Har' || data[1]==='HAR' || data[1]==='HARSET'|| data[1]==='LSET' || data[1]==='HARST' || data[1]==='CHOKER'|| data[1]==='Choker' || data[1]==='LONGSET'
            )){
                 setMaking(0.13)
            }
            else if(parseFloat(data[2])>=30.0){
              setMaking(0.12)
            }
            else if(parseFloat(data[2])<3.00 && data[2]>1.50){
              setMaking(0.20)
            }
            else{
              setMaking(0.18)
            }
            setRate((parseFloat(pureRate)*0.9167).toFixed(2))
        }
        else if(data[0] === '750'){
             if(parseFloat(data[2])<=0.500){
              setPerPc(true)  
              setMaking(1500)
            }
            else if(parseFloat(data[2])<=0.800){
              setPerPc(true)  
              setMaking(2000)
            }
            else if(parseFloat(data[2])<=1.00){
              setPerPc(true)  
              setMaking(2500)
            }
            else if(parseFloat(data[2])<=1.50){
              setPerPc(true)  
              setMaking(3000)
            }
          else if(parseFloat(data[2])<2.00){
            setMaking(0.25)
          }else if(parseFloat(data[2])<3.5 && parseFloat(data[2])>=2.00){
            setMaking(0.20)
          }
          else if(parseFloat(data[2])<5.00 && parseFloat(data[2])>=3.50){
            setMaking(0.18)
          }
          else if(parseFloat(data[2])>=20.0 && (data[1]==='Chain' || data[1]==='chain'|| data[1]==='CHAIN')){
            setMaking(0.15)
          }
          else{
            setMaking(0.20)
          }
            setRate((parseFloat(pureRate)*0.755).toFixed(2))
        }
        setPurity(data[0])
        setName(data[1].toString().toUpperCase())
        setWt(parseFloat(data[2]).toFixed(3))
      }
    }, [data])

    
  return (
   <>
       {
           isStone?
        <div className="md:text-base text-xs grid grid-cols-10 text-center my-5 p-1 border-2 rounded-md border-gray-800">
      
        <div className="col-span-1 font-normal md:font-bold border border-black py-2 animate-column">Purity</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Item Name</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Weight</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Rate</div>
        <div className="col-span-1 font-normal md:font-bold border border-black py-2 animate-column">Making charges</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Gold Amount</div>
      
      
        <div className="col-span-1 p-3 font-normal md:font-bold border border-black animate-column">{purity}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{name}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{wt}{"gm"}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{rate}</div>
        <div className="col-span-1 p-3 font-normal md:font-bold border border-black animate-column">
          {!perPc ? making * 100 + "%" : making + " per pc"}
        </div>

        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">
            &#8377; {!perPc ? (wt*rate*(1+making)).toFixed(2) : (wt*rate + making).toFixed(2)}
        </div>

            
        <div className="col-span-3 font-bold py-2 border border-black animate-column">Stone Details</div>
        <div className="col-span-2 font-bold py-2 border border-black animate-column">{(stonePrice/1500).toFixed(2)}{"ct"}</div> 
        <div className="col-span-3 p-3 font-bold py-2 border border-black animate-column">
            &#8377; {"1500"}
        </div>
        <div className="col-span-2 font-bold py-2 border border-black animate-column">{(stonePrice).toFixed(2)}</div> 

            
        <div className="col-span-8 font-bold py-2 border border-black animate-column"><span> {"Gold+Stone"} : </span></div>
        <div className="col-span-2 p-3 font-bold py-2 border border-black animate-column">
            &#8377;{!perPc ? (wt*rate*(1+making) + stonePrice).toFixed(2) : (wt*rate + making + stonePrice).toFixed(2)}
        </div>

        <div className="col-span-8 font-bold py-2 border border-black animate-column"><span>GST {"3%"} SGST+CGST{"(1.5% + 1.5%)"}</span><span className='font-normal ml-10'>GST Amount :</span></div>
        <div className="col-span-2 p-3 font-bold py-2 border border-black animate-column">
            &#8377;{!perPc ? ((wt*rate*(1+making) + stonePrice)*0.03).toFixed(2) : ( (wt*rate + making + stonePrice)*0.03).toFixed(2)}
        </div>

            
        <div className="col-span-8 font-bold py-2 border border-black animate-column">Total amount : </div>
        <div className="col-span-2 font-bold py-2 border border-black animate-column">
            &#8377;{!perPc ? ((wt*rate*(1+making) + stonePrice)*1.03).toFixed(2) : ( (wt*rate + making + stonePrice) * 1.03).toFixed(2)}
        </div>
    </div>
           :
        <div className="md:text-base text-xs grid grid-cols-10 text-center my-5 p-1 border-2 rounded-md border-gray-800">
      
        <div className="col-span-1 font-normal md:font-bold border border-black py-2 animate-column">Purity</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Item Name</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Weight</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Rate</div>
        <div className="col-span-1 font-normal md:font-bold border border-black py-2 animate-column">Making charges</div>
        <div className="col-span-2 font-normal md:font-bold border border-black py-2 animate-column">Gold Amount</div>
      
      
        <div className="col-span-1 p-3 font-normal md:font-bold border border-black animate-column">{purity}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{name}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{wt}{"gm"}</div>
        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">{rate}</div>
        <div className="col-span-1 p-3 font-normal md:font-bold border border-black animate-column">
          {!perPc ? making * 100 + "%" : making + " per pc"}
        </div>

        <div className="col-span-2 p-3 font-normal md:font-bold border border-black animate-column">
            &#8377; {!perPc ? (wt*rate*(1+making)).toFixed(2) : (wt*rate + making).toFixed(2)}
        </div>

        <div className="col-span-8 font-bold py-2 border border-black animate-column"><span>GST {"3%"} SGST+CGST{"(1.5% + 1.5%)"}</span><span className='font-normal ml-10'>GST Amount :</span></div>
        <div className="col-span-2 p-3 font-bold py-2 border border-black animate-column">
            &#8377;{!perPc ? (wt*rate*(1+making)*0.03).toFixed(2) : ( (wt*rate + making) * 0.03).toFixed(2)}
        </div>
      
        <div className="col-span-8 font-bold py-2 border border-black animate-column">Total amount : </div>
        <div className="col-span-2 font-bold py-2 border border-black animate-column">
            &#8377;{!perPc ? (wt*rate*(1+making)*1.03).toFixed(2) : ( (wt*rate + making) * 1.03).toFixed(2)}
        </div>
        </div>
       }
   </>
  )
}

export default Bill
