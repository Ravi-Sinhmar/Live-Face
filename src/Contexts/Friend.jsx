import React, {useState} from 'react';
const MyContext = React.createContext(null);

 export const useFriend = () =>{
    return React.useContext(MyContext);
}
function FriendProvider(props){
  const [friend,setFriend] = useState(null);
  const [adminCon,setAdminCon] = useState(null);
  const [cons,setCons] = useState({video:true,audio:true});
  const [setting,setSetting] = useState("none");
    return(
        <MyContext.Provider value={{friend,setFriend,adminCon,setAdminCon,cons,setCons,setting,setSetting}}>
            {props.children}
        </MyContext.Provider>
    )
}

export default FriendProvider;



 