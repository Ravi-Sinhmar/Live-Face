import React, {useState} from 'react';
const MyContext = React.createContext(null);

 export const useFriend = () =>{
    return React.useContext(MyContext);
}
function FriendProvider(props){
  const [friend,setFriend] = useState(null);
  const [adminCon,setAdminCon] = useState(null);
    return(
        <MyContext.Provider value={{friend,setFriend,adminCon,setAdminCon}}>
            {props.children}
        </MyContext.Provider>
    )
}

export default FriendProvider;



 