import React, { useEffect } from 'react';
import {useGlobalContext} from "../../context/context";

import Sidebar from '../layout/Sidebar';
import Modal from '../misc/Modal';
import BlockchainData from '../misc/BlockchainData';
import ConfirmModal from '../misc/ConfirmModal';


const Blockchain = () => {
    const { gameData, isGameOn, setModalContent } = useGlobalContext();


    useEffect(() => {
        const checkLoggedInAndGame = async () => {
            let token = localStorage.getItem("auth-token");
            let playerId = localStorage.getItem("playerId");
            if (token !== (null || "") && playerId !== (null || "")) {
                if (!isGameOn) {
                    setModalContent('Wait for the admin to start the game!');
                }
            } else {
                setModalContent('Please log in!');
            }
        };
        checkLoggedInAndGame();
    }, []);

    return (
        <div>
            <div>
                {
                    gameData.player ? (
                        <div>
                            {
                                isGameOn ? (
                                    <div>
                                        <div className="home-grid">
                                            <div className="item-sidebar">
                                                <Sidebar/>
                                            </div>
                                            <div className="item-content">
                                                <BlockchainData/>
                                            </div>
                                        </div>
                                        <ConfirmModal/>
                                    </div>
                                ) : (
                                    <>
                                        <Modal/>
                                    </>
                                )
                            }
                        </div>

                    ) : (
                        <>
                            <Modal/>
                        </>
                    )
                }
            </div>
        </div>
    )
};

export default Blockchain