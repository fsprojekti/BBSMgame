import React from 'react'
import { useGlobalContext} from "../../context/context";

const Modal = () => {
    const { modalContent } = useGlobalContext();
    return (
        <div className={'modal-overlay'}>
            <div className="modal-container">
                <h2>{modalContent}</h2>
            </div>
        </div>
    )
};

export default Modal