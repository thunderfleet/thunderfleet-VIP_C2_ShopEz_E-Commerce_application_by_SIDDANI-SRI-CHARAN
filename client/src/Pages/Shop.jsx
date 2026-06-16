import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import TrustIndicators from '../Components/TrustIndicators/TrustIndicators'
import { backend_url } from '../App'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'

const Shop = () => {

  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);

  const fetchInfo = () => { 
    fetch(`${backend_url}/popularinwomen`) 
            .then((res) => res.json()) 
            .then((data) => setPopular(data))
    fetch(`${backend_url}/newcollections`) 
            .then((res) => res.json()) 
            .then((data) => setNewCollection(data))
    }

    useEffect(() => {
      fetchInfo();
    }, [])


  return (
    <div>
      <Hero/>
      <TrustIndicators/>
      <Popular data={popular}/>
      <Offers/>
      <NewCollections data={newcollection}/>
      <NewsLetter/>
    </div>
  )
}

export default Shop
