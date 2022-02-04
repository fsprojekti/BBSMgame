import React, { useEffect } from 'react';
import {useGlobalContext} from "../../context/context";

import Sidebar from '../layout/Sidebar';
import Modal from '../misc/Modal';
import Trades from '../misc/Trades';
import TradeModal from '../misc/TradeModal';
import CancelOrderModal from '../misc/CancelOrderModal';



const Trade = () => {
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
                                                <Trades/>
                                            </div>
                                        </div>
                                        <TradeModal/>
                                        <CancelOrderModal/>
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

export default Trade