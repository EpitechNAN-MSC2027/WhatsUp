import React, {useState} from "react";

function Chat () {
    const [inputValue, setInputValue] = useState('');
    const [displayValue, setDisplayValue] = useState('');

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };
     const handleSend = () => {
         setDisplayValue(inputValue);
         setInputValue('');
     };

     return (
         <div>
             <div>
                 <input type="text" value={inputValue} onChange={handleInputChange} placeholder="Ecrit connard"/>
                 <button onClick={handleSend}>Send</button>
             </div>
             <div>
                 <h3>Output:</h3>
                 <p>{displayValue}</p>
             </div>
         </div>
     )
}

export default Chat