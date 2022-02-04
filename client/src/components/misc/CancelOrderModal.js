import React, { useEffect } from 'react'
import { useGlobalContext} from "../../context/context";
import { FaTimes } from 'react-icons/fa';
import Axios from "axios/index";

const CancelOrderModal = () => {
    const { isCancelOrderModalOpen, closeCancelOrderModal, cancelOrderModalContent } = useGlobalContext();

    const confirm = async () => {
        try {
            const token = localStorage.getItem("auth-token");
            const playerId = localStorage.getItem("playerId");

            const confirmRes =  await Axios.delete(`/player/cancelOrder/${playerId}`, {
                headers: {
                    Authorization: "Bearer " + token
                },
                data: {
                    orderId: cancelOrderModalContent._id
                }
            });
            closeCancelOrderModal();
        } catch(err) {
            console.log(err);
        }
    };

    const handleKeypress = (e) => {
        try {
            if (e.key === 'Enter') {
                confirm();
            }
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", e => handleKeypress(e));
        return () => {
            document.removeEventListener("keydown", e => handleKeypress(e));
        };
    }, [cancelOrderModalContent]);

    return (
        <div
            className={`${
                isCancelOrderModalOpen ? 'modal-confirm-overlay show-modal-confirm' : 'modal-confirm-overlay'
                }`}
        >
            <div className='modal-confirm-container'>
                <h3>Are you sure you want to cancel offer:</h3>
                <ul>
                    <li>Player: {cancelOrderModalContent.playerName}</li>
                    <li>typeOfService: {cancelOrderModalContent.typeOfService}</li>
                    <li>price: {cancelOrderModalContent.price}</li>
                </ul>
                <button className='close-modal-btn' onClick={closeCancelOrderModal}>
                    <FaTimes></FaTimes>
                </button>
                <button className='confirm-modal-btn' onClick={confirm}>Confirm</button>
            </div>
        </div>
    )
};

export default CancelOrderModal