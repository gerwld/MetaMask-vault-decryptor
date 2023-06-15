import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { decryptVault, extractVaultFromFile, isVaultValid } from './lib.js';
import usePrevious from './hooks/usePrevious';

function AppRoot() {
 const textareaRef = useRef();
 const [formData, setFormData] = useState({
  vaultData: '',
  password: '',
  error: null,
  decrypted: null,
  vaultSource: 'text',
  fileValidation: null,
 });

 const { vaultData, password, error, decrypted, vaultSource, fileValidation } = formData;
 const previousVault = usePrevious(vaultSource);

 const handleFileInputChange = async (event) => {
  try {
   if (!event.target.files.length) {
    setFormData({ ...formData, fileValidation: null });
    return;
   }
   const file = event.target.files[0];
   const data = await file.text();
   let vaultData = extractVaultFromFile(data);
   if (!vaultData || !isVaultValid(vaultData)) {
    setFormData({ ...formData, fileValidation: 'fail', vaultData: null });
    return;
   }
   setFormData({ ...formData, fileValidation: 'pass' });
   if (vaultData.data && vaultData.data.mnemonic) {
    setFormData({ ...formData, decrypted: vaultData });
    return;
   }
   setFormData({ ...formData, vaultData });
  } catch (err) {
   setFormData({ ...formData, fileValidation: 'fail', vaultData: null });
   if (err.name === 'SyntaxError') {
    setFormData({ ...formData, error: 'Invalid File Content (SyntaxError)' });
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
    setFormData({ ...formData, vaultData, error: 'Invalid input data' });
    return;
   }
   setFormData({ ...formData, vaultData, error: null });
  } catch (err) {
   if (err.name === 'SyntaxError' && event.target.value !== '') {
    setFormData({ ...formData, error: 'Invalid Vault.' });
   } else {
    setFormData({ ...formData, error: '' });
    if (err.message !== 'Unexpected end of JSON input') {
     console.error(err.message);
    }
   }
  }
 };

 const handlePasswordChange = (event) => {
  const password = event.target.value;
  setFormData({ ...formData, password });
 };

 const handleDecrypt = (event) => {
  if (!vaultData || !password) {
   return;
  }

  setFormData({ ...formData, error: null });
  decryptVault(password, vaultData)
   .then((keyrings) => {
    const serializedKeyrings = JSON.stringify(keyrings);
    console.log('Decrypted!', serializedKeyrings);
    setFormData({ ...formData, decrypted: serializedKeyrings });
   })
   .catch((reason) => {
    if (reason.message === 'Incorrect password') {
     setFormData({ ...formData, error: reason.message });
     return;
    }
    console.error(reason);
    setFormData({ ...formData, error: 'Problem decoding vault.' });
   });
 };

 //Changes error on toggle
 useEffect(() => {
  if (previousVault !== vaultSource) {
   setFormData({ ...formData, error: '' });
  }
  if (previousVault !== vaultSource && vaultSource === 'text') {
   handleTextInputChange({ target: { value: textareaRef.current.value } });
  }
 }, [formData.vaultSource]);

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
          setFormData({ ...formData, vaultSource: 'file', vaultData: null });
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
          setFormData({ ...formData, vaultSource: 'text', vaultData: null, fileValidation: null });
         }}
         checked={vaultSource === 'text'}
        />
        <label htmlFor='radio-textinput'>Paste text</label>
       </td>
       <td>
        <textarea
         ref={textareaRef}
         className='vault-data'
         disabled={vaultSource !== 'text'}
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
         type='password'
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
