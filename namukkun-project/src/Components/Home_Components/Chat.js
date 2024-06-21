import React, { useState } from "react";
import { generateText } from "../../API/OpenAI";

function Chat(){

    const [inputValue, setInputValue] =useState("");
    const [outputValue, setOutputValue] = useState(""); 

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleFormSubmit =async (e) => {
        e.preventDefault();
        const result =await generateText(inputValue);
        setOutputValue(result);
        setInputValue("");
    }

    return(
        <div>
            <form onSubmit={handleFormSubmit}>
                <input type="text" value={inputValue} onChange={handleInputChange}>
                <button type="submit">확인</button>
                </input>
            </form>
            <div>{outputValue}</div>
        </div>
    );
}

export default Chat;
