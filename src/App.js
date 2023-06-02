import { useState } from 'react';
import './App.css';
//0x198d6389915b4cc3f35e3ba0ac3b4586c4bfa9181b195c508f53e7e2e567eaf3

const aptos = require("aptos");

function App() {
  const [currentpage, setpage] = useState(false)
  const [images, setImages] = useState([]);
  const [pvkey, setPvkey] = useState()
  const [collectionName, setCollectionName] = useState()
  const [collectionDescription, setCollectionDescription] = useState()
  const [supply, setSupply] = useState()

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cid, setCid] = useState(null);

  const [tokenName, settokenName] = useState()
  const [imagelink, setimagelink] = useState()

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCid(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDVFMDljRkMzQzlBMDM2MDc2NDg5MzI0MEU1NzNDNjFmRDdDNkQ1ZjkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NTcyMzU3Njk4MCwibmFtZSI6Im5ldyJ9.jxuyk_zwHsmIggyAZJg3tdBrBhbRheuGcdZ8RzFtpm4`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setCid(data.value.cid);
      setimagelink("https://ipfs.io/ipfs/" + data.value.cid + "/" + file.name)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () =>{
    const privateKeyBytes = aptos.HexString.ensure(pvkey).toUint8Array();
    const account = new aptos.AptosAccount(privateKeyBytes);
    const client = new aptos.AptosClient("https://fullnode.devnet.aptoslabs.com");
    const tokenClient = new aptos.TokenClient(client);
    const txnHash1 = await tokenClient.createCollection(
      account,
      collectionName,
      collectionDescription,
      "https://alice.com",
      supply,
    ); // <:!:section_4
  
    await client.waitForTransaction(txnHash1, { checkSuccess: true });
  }

  const createToken = async ()=>{
    const privateKeyBytes = aptos.HexString.ensure(pvkey).toUint8Array();
    const account = new aptos.AptosAccount(privateKeyBytes);
    const client = new aptos.AptosClient("https://fullnode.devnet.aptoslabs.com");
    const tokenClient = new aptos.TokenClient(client);
    const txnHash2 = await tokenClient.createToken(
      account,
      collectionName,
      tokenName,
      "test",
      1,
      imagelink
       ); // <:!:section_5
    await client.waitForTransaction(txnHash2, { checkSuccess: true });
  }

  return (
    <div className="App">
      {
        currentpage?
        <header className="App-header">
          <h1>Create Collection</h1>
          <input value={pvkey} onChange={e=>setPvkey(e.target.value)} placeholder='Pvkey'></input>
          <input value={collectionName} onChange={e=>setCollectionName(e.target.value)} placeholder='CollectionName'></input>
          <input value={collectionDescription} onChange={e=>setCollectionDescription(e.target.value)} placeholder='CollectionDescription'></input>
          <input value={supply} onChange={e=>setSupply(e.target.value)} placeholder='total supply'></input>

          <button onClick={createCollection}>CreateCollection</button>
          <button onClick={e=>setpage(!currentpage)}>{currentpage?"go to create token page":"go to collection page"}</button>
          </header>
          :
          <header className="App-header">
              <h1>Create NFT</h1>
              <input value={collectionDescription} onChange={e=>setCollectionDescription(e.target.value)} placeholder='CollectionDescription'></input>
              <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} />
            <button type="submit" disabled={!file || loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          {error && <p>{error}</p>}
          {cid && <p>File uploaded successfully! CID: {cid}</p>}
          <input value={imagelink} onChange={e=>setimagelink(e.target.value)} placeholder='image'></input>
          <input value={tokenName} onChange={e=>settokenName(e.target.value)} placeholder='tokenname'></input>
          <button onClick={createToken}>CreateToken</button>
          <button onClick={e=>setpage(!currentpage)}>{currentpage?"go to create token page":"go to collection page"}</button>

        </header>
      }
      
    </div>
  );
}

export default App;
