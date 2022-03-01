import {initializeApp} from 'firebase/app'; 
import {
    getFirestore, collection, onSnapshot,
    getDocs,
    addDoc, deleteDoc, doc,
    query, orderBy, serverTimestamp,
    getDoc,
    setDoc
}  from 'firebase/firestore'; 

import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCKmtHknH9oF1J4EpkYmbRVWMj3ny1rLeM",
    authDomain: "usertracking-f7c9e.firebaseapp.com",
    projectId: "usertracking-f7c9e",
    storageBucket: "usertracking-f7c9e.appspot.com",
    messagingSenderId: "892550331243",
    appId: "1:892550331243:web:e99df2ad5d439aa5c76a2e"
  
  };

  // init app
  initializeApp(firebaseConfig);

  // init services
  // for data base
  const db = getFirestore(); 
  // for current login user 
  const auth = getAuth();

  var watchID; 
  var geo; 
  var currentUser; 
  
  // collection ref
  const colRef = collection(db, 'tracking');

  // continuously track user movement
  const trackMe = document.querySelector(".track");
  trackMe.addEventListener('click', (e) =>{
      e.preventDefault();
      
      if (currentUser){
          if(navigator.geolocation){
            geo = navigator.geolocation;
            watchID = geo.watchPosition(
                // we got a position
                 (position)=>{
                    // get the user doc with userid and set/update
                    const mydoc = doc(db, "tracking", currentUser.uid);
                    setDoc(mydoc, {
                        position: {
                            timestamp: position.timestamp,
                            name: currentUser.displayName,
                            coords: {
                                accuracy: position.coords.accuracy,
                                altitude: position.coords.altitude,
                                altitudeAccuracy: position.coords.altitudeAccuracy,
                                heading: position.coords.heading,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                speed: position.coords.speed
                            }
                        },
                        timestamp: serverTimestamp()
                    })
                    .then(
                        () => {
                            console.log("update tracking");
                        }
                    )
                    .catch((err)=>{
                        console.error(err.message); 
                    })  

                }, 
                // error tracking
                (err) => {
                    console.error(err.message);
                },
                { enableHighAccuracy: true}
            );
          }
          else {
              alert("Sorry Browser Doesn't support Geolocation");
          }
      }
      else{
        alert("Must be logged in");
      }

  });

  // update all users any time the collection changes
const unsub = onSnapshot(colRef, (snapshot) => {
    let locs =[]
    snapshot.docs.forEach((doc) => {
        locs.push({...doc.data(), id:doc.id})
    })
    console.log(locs);
});

  /*
const unsubCol = onSnapshot(q, (snapshot) => {
    let books =[];
    snapshot.docs.forEach((doc)=>{
        books.push({...doc.data(), id: doc.id});
    });
    console.log(books);

}); 

// adding docouments 
const addBookForm = document.querySelector('.add');
addBookForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    addDoc(colRef, {
        title: addBookForm.title.value ,
        author: addBookForm.author.value,
        createdAt: serverTimestamp()
    }).then(()=>{
        addBookForm.reset(); 
    });
});

// deleting documents
const deleteBookForm = document.querySelector('.delete');
deleteBookForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    // Get doc reference
    const docRef = doc(db,'Books', deleteBookForm.id.value); 
    
    // delete doc with id 
    deleteDoc(docRef)
    .then(()=>{
        deleteBookForm.reset(); 
    });

});

// Get single doc
const docRef = doc(db, "Books", "4cZSUjUhrCRtXAQ8HnYd");

const unsubDoc = onSnapshot(docRef, (doc)=> {
    console.log(doc.data(), doc.id);
});


const updateform = document.querySelector('.update');
updateform.addEventListener('submit', (e) =>{
    e.preventDefault();
    
    const docRef = doc(db,'Books', updateform.id.value); 

    updateDoc(docRef, {
        title: 'updated title'
    })
    .then(()=>{
        updateform.reset(); 
    });

});

*/ 
// signup
const signUpForm = document.querySelector('.signup');
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const email = signUpForm.email.value;
    const password = signUpForm.password.value; 
    const displayName = signUpForm.displayName.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            updateProfile(cred.user, {
                displayName: displayName 
            }).catch(err =>{
                console.log(err.message);
            });
            console.log('user created:', cred.user);
            signUpForm.reset(); 
        })
        .catch((err) =>{
            console.log(err.message);
        });
});

// log out 
const logoutButton = document.querySelector('.logout');
logoutButton.addEventListener('click', (e) =>{
    e.preventDefault();
    // stop the tracking
    if (currentUser){
        if (watchID){
            const geo = navigator.geolocation;
            geo.clearWatch(watchID);
            watchID = null;
        }
        const mydoc = doc(db, "tracking", currentUser.uid);
        deleteDoc(mydoc)
        .then( () => {
            console.log("Data deleted successfully")
            currentUser = null;
            signOut(auth)
                .then(()=>{
                        console.log('The user signed out');
                })
                .catch((err) => {
                    console.log(err.message);
                });

        }).catch( (err) => {
            console.error(err.message);
        });
    }
    else{
        alert("must be logged in")
    }
});

const loginForm = document.querySelector('.login');
loginForm.addEventListener('click', (e) =>{
    e.preventDefault(); 
    
    const email = loginForm.email.value;
    const password = loginForm.password.value; 

    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('user logged in', cred);
        }).catch((err) =>{
            console.log(err.message);
        });

});


const unsubAuth = onAuthStateChanged(auth, (user)=>{
    currentUser = user; 
    console.log(currentUser); 
});

/*
const unsubButton = document.querySelector('.unsub');
unsubButton.addEventListener('click', () =>{
    console.log('unsubing');
    unsubAuth();
    unsubDoc();
    unsubCol();
}); 
*/