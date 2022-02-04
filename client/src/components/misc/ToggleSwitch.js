import React from 'react';
import Switch from "react-switch";


const SwitchToggle = (data) => {

    const handleChange = nextChecked => {
        data.onChange(nextChecked);
    };


    return (
        <div className="toggle-switch">
            <div className="toggle-switch-text">Price</div>
            <Switch
                onChange={handleChange}
                checked={data.checked}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
            />
            <div className="toggle-switch-text">Time</div>
        </div>
    )
};


export default SwitchToggle