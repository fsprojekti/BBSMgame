import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";
import { FaTimes } from 'react-icons/fa';
import Axios from "axios/index";

const CreateOrderModal = () => {
    const { gameData, isCreateOrderModalOpen, closeCreateOrderModal } = useGlobalContext();
    const [price, setPrice] = useState("0");
    const [showAlert, setShowAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');

    const countDecimals = (value) => {
        if(Math.floor(value).toString() === value) return 0;
        return value.toString().split(".")[1].length || 0;
    };

    const confirm = async () => {
        try {
            if (price === undefined || price === "") {
                setAlertContent('You must enter a value');
                setShowAlert(true);
            } else {
                if (isNaN(price) || price < 0) {
                    setAlertContent('Input must be a non-negative number');
                    setShowAlert(true);
                } else {
                    if (countDecimals(price) > 0) {
                        setAlertContent('Input value must be an integer');
                        setShowAlert(true);
                    } else {
                        if (parseInt(price) > 30000) {
                            setAlertContent('Maximum price in this game is 30000');
                            setShowAlert(true);
                        } else {
                            if (gameData.player.amountOfAvailableService === 0) {
                                setAlertContent('Amount of available services is too low');
                                setShowAlert(true);
                            } else {
                                const token = localStorage.getItem("auth-token");
                                const playerId = localStorage.getItem("playerId");
                                const data = {
                                    amountOfService: 1,
                                    price: price
                                };
                                const options = {
                                    headers: {
                                        Authorization: "Bearer " + token
                                    }
                                };
                                const createRes =  await Axios.post(`/player/createOrder/${playerId}`, data, options);
                                closeCreateOrderModal();
                                setAlertContent('');
                                setShowAlert(false);
                                setPrice("0");
                                document.getElementById("priceInput").value= "";
                            }
                        }
                    }
                }
            }
        } catch(err) {
            if (err.response !== undefined && err.response.data.message === "Trade already exists") {
                setAlertContent('Trade with this person already exists');
                setShowAlert(true);
            }
        }
    };

    const changePriceInput = async (e) => {
        try {
            if (e.target.value === "") {
                setPrice("0");
            } else {
                setPrice(e.target.value)
            }
        } catch(err) {
            console.log(err);
        }
    };

    const handleKeypress = async e => {
        try {
            if (e.key === 'Enter') {
                confirm();
            }
        } catch(err) {
            console.log(err);
        }
    };

    return (
        <div
            className={
                `${isCreateOrderModalOpen ? 'modal-confirm-overlay show-modal-confirm' : 'modal-confirm-overlay'}`
            }
        >
            <div className='modal-confirm-container'>
                <h3>Set Price</h3>
                <div className={"modal-input-group"}>
                    <label htmlFor={"price"}>Price</label>
                    <div className="modal-input-group-container">
                        <input type={"text"} name={"price"} id={"priceInput"} placeholder={"Enter price"} onChange={e => changePriceInput(e)} onKeyPress={e => handleKeypress(e)}/>
                    </div>
                </div>
                <div className={`${showAlert? 'modal-input-alert show-modal-input-alert' : 'modal-input-alert'}`}>
                    {alertContent}
                </div>
                <button className='close-modal-btn' onClick={() => {
                    closeCreateOrderModal();
                    setAlertContent('');
                    setShowAlert(false);
                    setPrice();
                    document.getElementById("priceInput").value= "";
                }}>
                    <FaTimes></FaTimes>
                </button>
                <button className='confirm-modal-btn' onClick={confirm}>Confirm</button>
            </div>
        </div>
    )
};

export default CreateOrderModal;