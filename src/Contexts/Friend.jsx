import React, {useState} from 'react';
const MyContext = React.createContext(null);

 export const useFriend = () =>{
    return React.useContext(MyContext);
}
function FriendProvider(props){
  const [friend,setFriend] = useState(null);
  const [adminCon,setAdminCon] = useState(null);
  const [userName, setUserName] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [joined, setJoined] = useState(false);
  const [live, setLive] = useState(false);
    return(
        <MyContext.Provider value={{friend,setFriend,adminCon,setAdminCon,userName,setUserName,fullName,setFullName,joined,setJoined,live,setLive}}>
            {props.children}
        </MyContext.Provider>
    )
}
export default FriendProvider;



 