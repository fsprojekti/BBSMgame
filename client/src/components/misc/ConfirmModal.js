import React, { useEffect } from 'react'
import { useGlobalContext} from "../../context/context";
import { FaTimes } from 'react-icons/fa';
import Axios from "axios/index";

const ConfirmModal = () => {
    const { isConfirmModalOpen, closeConfirmModal, confirmModalContent } = useGlobalContext();

    const confirm = async () => {
        try {
            const token = localStorage.getItem("auth-token");
            const playerId = localStorage.getItem("playerId");
            debugger;
            if (confirmModalContent.type === "cancel transaction") {
                const confirmRes =  await Axios.delete(`/player/cancelTransaction/${playerId}`, {
                    headers: {
                        Authorization: "Bearer " + token
                    },
                    data: {
                        transactionId: confirmModalContent.id
                    }
                });
            }
            closeConfirmModal();
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
    }, [confirmModalContent]);

    return (
        <div
            className={`${
                isConfirmModalOpen ? 'modal-confirm-overlay show-modal-confirm' : 'modal-confirm-overlay'
                }`}
        >
            <div className='modal-confirm-container'>
                <h3>Are you sure you want to {confirmModalContent.type}:</h3>
                <ul>
                    <li>Consumer: {confirmModalContent.consumer}</li>
                    <li>Provider: {confirmModalContent.provider}</li>
                    <li>typeOfService: {confirmModalContent.typeOfService}</li>
                    <li>price: {confirmModalContent.price}</li>
                    <li>txFee: {confirmModalContent.txFee}</li>
                </ul>
                <button className='close-modal-btn' onClick={closeConfirmModal}>
                    <FaTimes></FaTimes>
                </button>
                <button className='confirm-modal-btn' onClick={confirm}>Confirm</button>
            </div>
        </div>
    )
};

export default ConfirmModal