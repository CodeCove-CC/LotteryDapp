import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from './abi/config';
import './App.css';

function App() {

  const [lotteryContract, setLotteryContract] = useState()

  const [metamask, setMetamask] = useState(true)
  const [signer, setSigner] = useState()
  const [address, setAddress] = useState()
  const [manager, setManager] = useState()
  const [players, setPlayers] = useState()
  const [pool, setPool] = useState()
  const [refresh, setRefresh] = useState()
  const [showPlayers, setShowPlayers] = useState(false)

  const [amount, setAmount] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    
    if(window.ethereum){
      setMetamask(true)

      const provider = new ethers.providers.Web3Provider(window.ethereum, "any")

      const contract = new ethers.Contract('0xf08a18cadd8d24c78cb759d49e3fb0aa8cb0348a', abi, provider)

      setLotteryContract(contract)

      provider.send("eth_requestAccounts", [])
      .then((signerRes)=>{
        const signer = provider.getSigner();
        setSigner(signer);
        setAddress(signerRes[0]);

        contract.manager().then(admin => {
          setManager(admin)

          contract.getPlayers().then(list => {
            setPlayers(list)

            contract.lotteryPool().then(amt => {
              setPool(amt)
              setLoading(false)
            })
            .catch(err => console.log(err))

          })
          .catch(err => console.log(err))

        })
        .catch(err => console.log(err))

      })
      .catch(err => console.log(err))
    }
    else{
      setMetamask(false)
    }
    
  }, [refresh])

  const etherToWei = amount => {
    return ethers.utils.parseUnits(amount, "ether")
  }

  const weiToEther = amount => {
    return ethers.utils.formatEther(amount)
  }

  const handleEnter = () => {
    const lotteryContractSigner = lotteryContract.connect(signer)
    lotteryContractSigner.enter({value: etherToWei(amount)}).then(res => {
      setLoading(true)
      res.wait().then(receipt => {
        setRefresh(receipt)
      })
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
  }

  const handleWinner = () => {
    const lotteryContractSigner = lotteryContract.connect(signer)
    lotteryContractSigner.pickWinner().then(res => {
      setLoading(true)
      res.wait().then(receipt => {
        setRefresh(receipt)
      })
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
  }
  
  return (
    <div className="container">
      {
        metamask
        ?
          !loading
          ?
          (
            <div className='elements' >
              <div className='header' >{address}</div>
              <div className='header' >Lottery Pool - {Number(weiToEther(pool))} ETH</div>
              <input className='input' type='number' placeholder='0.01 ETH' onChange={(e) => {setAmount(e.target.value)}} />
              {
                showPlayers
                ?
                (
                  <div className='players-container' >
                    {
                      players.map((player, index) => (
                        <div key={index} >{player}</div>
                      ))
                    }
                    <button onClick={() => setShowPlayers(false)} className='btn' >Back</button>
                  </div>
                )
                :
                (
                  <div className='btn-container' >
                    <button onClick={handleEnter} className='btn' >Enter Lottery</button>
                    {
                      address.toUpperCase() === manager.toUpperCase()
                      ?
                      (
                        <button onClick={handleWinner} className='btn' >Pick Winner</button>
                      )
                      :
                      null
                    }
                    <button onClick={() => setShowPlayers(true)} className='btn' >Show Players</button>
                  </div>
                )
              }
            </div>
          )
          :
          (
            <div className='header' >Loading...</div>
          )
        :
        (
          <div>NO METAMASK DETECTED</div>
        )
      }
    </div>
  );
}

export default App;
