import React, { useState } from 'react';
import { connect } from 'react-redux';
import { decryptVault, extractVaultFromFile, isVaultValid } from './lib.js';

function AppRoot({ view, nonce }) {
 const [vaultData, setVaultData] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState(null);
 const [decrypted, setDecrypted] = useState(null);
 const [vaultSource, setVaultSource] = useState('text');
 const [fileValidation, setFileValidation] = useState(null);

 const handleFileInputChange = async (event) => {
  try {
   if (!event.target.files.length) {
    setFileValidation(null);
    return;
   }
   const file = event.target.files[0];
   const data = await file.text();
   let vaultData = extractVaultFromFile(data);
   if (!vaultData || !isVaultValid(vaultData)) {
    setFileValidation('fail');
    setVaultData(null);
    return;
   }
   setFileValidation('pass');
   if (vaultData.data && vaultData.data.mnemonic) {
    setDecrypted(vaultData);
    return;
   }
   setVaultData(vaultData);
  } catch (err) {
   setFileValidation('fail');
   setVaultData(null);
   if (err.name === 'SyntaxError') {
    // Invalid JSON
   } else {
    console.error(err);
   }
  }
 };

 const handleTextInputChange = (event) => {
  try {
   const vaultData = JSON.parse(event.target.value);
   if (!isVaultValid(vaultData)) {
    console.error('Invalid input data');
    return;
   }
   setVaultData(vaultData);
  } catch (err) {
   if (err.name === 'SyntaxError') {
    // Invalid JSON
   } else {
    console.error(err);
   }
  }
 };

 const handlePasswordChange = (event) => {
  const password = event.target.value;
  setPassword(password);
 };

 const handleDecrypt = (event) => {
  if (!vaultData || !password) {
   return;
  }

  setError(null);
  decryptVault(password, vaultData)
   .then((keyrings) => {
    const serializedKeyrings = JSON.stringify(keyrings);
    console.log('Decrypted!', serializedKeyrings);
    setDecrypted(serializedKeyrings);
   })
   .catch((reason) => {
    if (reason.message === 'Incorrect password') {
     setError(reason.message);
     return;
    }
    console.error(reason);
    setError('Problem decoding vault.');
   });
 };

 return (
  <div className='content'>
   <div>
    <h1>
     MetaMask Vault Decryptor (Updated by <a href='https://github.com/gerwld'>gerwld</a>)
    </h1>

    <a href='https://metamask.zendesk.com/hc/en-us/articles/360018766351-How-to-use-the-Vault-Decryptor-with-the-MetaMask-Vault-Data'>
     How to use the Vault Decryptor with the MetaMask Vault Data
    </a>
    <br />
    <a href='https://github.com/MetaMask/vault-decryptor'>Fork on Github</a>
    <br />
    <hr />
    <table>
     <tbody>
      <tr>
       <td>
        <input
         id='radio-fileinput'
         name='vault-source'
         type='radio'
         onChange={() => {
          setVaultSource('file');
          setVaultData(null);
         }}
        />
        <label htmlFor='radio-fileinput'>Database backup</label>
       </td>
       <td>
        <input
         className='file'
         disabled={vaultSource !== 'file'}
         id='fileinput'
         type='file'
         placeholder='file'
         onChange={handleFileInputChange}
        />
        {fileValidation ? (
         <span
          style={{
           color: fileValidation === 'pass' ? 'green' : 'red',
          }}
         >
          {fileValidation === 'pass' ? '\u2705' : '\u274c Can not read vault from file'}
         </span>
        ) : null}
       </td>
      </tr>
      <tr>
       <td>
        <input
         id='radio-textinput'
         name='vault-source'
         type='radio'
         onChange={() => {
          setVaultSource('text');
          setVaultData(null);
          setFileValidation(null);
         }}
         checked={vaultSource === 'text'}
        />
        <label htmlFor='radio-textinput'>Paste text</label>
       </td>
       <td>
        <textarea
         className='vault-data'
         disabled={false}
         id='textinput'
         style={{
          width: '50em',
          height: '15em',
         }}
         placeholder='Paste your vault data here.'
         onChange={handleTextInputChange}
        />
       </td>
      </tr>
      <tr>
       <td>
        <label htmlFor='passwordinput'>Password</label>
       </td>
       <td>
        <input
         className='password'
         id='passwordinput'
         type='text'
         placeholder='Password'
         onChange={handlePasswordChange}
        />
       </td>
      </tr>
     </tbody>
    </table>
    <button className='decrypt' onClick={handleDecrypt} disabled={!vaultData || !password}>
     Decrypt
    </button>
    {error ? (
     <div className='error' style={{ color: 'red' }}>
      {error}
     </div>
    ) : null}
    {decrypted ? (
     <div>
      <div
       style={{
        backgroundColor: 'black',
        color: 'white',
        display: 'inline-block',
        fontFamily: 'monospace',
        margin: '1em',
        padding: '1em',
       }}
      >
       {decrypted}
      </div>
     </div>
    ) : null}
   </div>
  </div>
 );
}

function mapStateToProps(state) {
 return {
  view: state.currentView,
  nonce: state.nonce,
 };
}

export default connect(mapStateToProps)(AppRoot);
