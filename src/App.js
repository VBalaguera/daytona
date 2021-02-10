import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'; 

firebase.initializeApp({
  apiKey: "AIzaSyBROhx4y-bcdgmoub3-NRGokQaV2Tici1E",
  authDomain: "daytona-chatzone.firebaseapp.com",
  projectId: "daytona-chatzone",
  storageBucket: "daytona-chatzone.appspot.com",
  messagingSenderId: "859647345578",
  appId: "1:859647345578:web:608b1034b34dd6c67021d3",
  measurementId: "G-2NJVFX8S83"
})

const auth = firebase.auth();
const firestore = firebase.firestore(); 
const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <h1>DAYTONA</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  ); 
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Behave yourselves</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(30);

  const [messages] = useCollectionData(query, { idField: 'id'}); 

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser; 

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth'}); 
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='your thoughts?' />

      <button type='submit' disabled={!formValue}>send</button>
    </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return ( <>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'http://clipart-library.com/images/8cGEdLeXi.png'} alt='user'/>
      <p>{text}</p>
    </div>
  </>)
}

export default App; 