import React, { useRef } from "react";


function Input({getData}){
    let nameRef = useRef();

    const sendData = () => {
        alert("CLikc");
       
       getData(nameRef.current.value.trim());
      };
return(
<React.Fragment>
<input sendData={sendData} className="border border-blt rounded-md py-2 bg-blg" ref={nameRef}  type="text" />
   </React.Fragment>
)

}

export default Input;