import React, {useState} from 'react';
const MyContext = React.createContext(null);

 export const useFriend = () =>{
    return React.useContext(MyContext);
}
function FriendProvider(props){
  const [friend,setFriend] = useState(null);
  const [adminCon,setAdminCon] = useState("uususususususususuus");
  const [cons,setCons] = useState({video:true,audio:true});
  const [audioOutput,setAudioOutput] = useState("");
  const [setting,setSetting] = useState(false);
    return(
        <MyContext.Provider value={{friend,setFriend,adminCon,setAdminCon,cons,setCons,setting,setSetting,audioOutput,setAudioOutput}}>
            {props.children}
        </MyContext.Provider>
    )
}

export default FriendProvider;



 