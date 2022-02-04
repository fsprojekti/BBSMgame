import React, { useState, useContext } from 'react'

const AppContext = React.createContext();

const AppProvider = ({children}) => {
    const [isGameOn, setIsGameOn] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const [modalContent, setModalContent] = useState('');
    const [confirmModalContent, setConfirmModalContent] = useState('');
    const [tradeModalContent, setTradeModalContent] = useState('');
    const [cancelOrderModalContent, setCancelOrderModalContent] = useState('');

    const [gameData, setGameData] = useState({
        token: undefined,
        player: undefined,
        otherPrices: undefined,
        pendingTrades: undefined,
        requestedTrades: undefined,
        allPendingTransactions: undefined,
        totalStake: undefined
    });

    const clearGameData = () => {
        setGameData({
            token: undefined,
            player: undefined,
            otherPrices: undefined,
            pendingTrades: undefined,
            requestedTrades: undefined,
            allPendingTransactions: undefined,
            totalStake: undefined
        });
    };

    const openConfirmModal = () => {
        setIsConfirmModalOpen(true);
    };
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };

    const openStakeModal = () => {
        setIsStakeModalOpen(true);
    };
    const closeStakeModal = () => {
        setIsStakeModalOpen(false);
    };

    const openTradeModal = () => {
        setIsTradeModalOpen(true);
    };
    const closeTradeModal = () => {
        setIsTradeModalOpen(false);
    };

    const openCancelOrderModal = () => {
        setIsCancelOrderModalOpen(true);
    };
    const closeCancelOrderModal = () => {
        setIsCancelOrderModalOpen(false);
    };

    const openCreateOrderModal = () => {
        setIsCreateOrderModalOpen(true);
    };
    const closeCreateOrderModal = () => {
        setIsCreateOrderModalOpen(false);
    };

    const openAlert = () => {
        setIsAlertOpen(true);
    };
    const closeAlert = () => {
        setIsAlertOpen(false);
    };


    return (
        <AppContext.Provider value={{
            isGameOn,
            setIsGameOn,
            gameData,
            setGameData,
            clearGameData,
            modalContent,
            setModalContent,
            openConfirmModal,
            closeConfirmModal,
            confirmModalContent,
            setConfirmModalContent,
            isConfirmModalOpen,
            openStakeModal,
            closeStakeModal,
            isStakeModalOpen,
            openTradeModal,
            closeTradeModal,
            tradeModalContent,
            setTradeModalContent,
            isTradeModalOpen,
            openCancelOrderModal,
            closeCancelOrderModal,
            cancelOrderModalContent,
            setCancelOrderModalContent,
            isCancelOrderModalOpen,
            openCreateOrderModal,
            closeCreateOrderModal,
            isCreateOrderModalOpen,
            isAlertOpen,
            openAlert,
            closeAlert
        }}>
            {children}
        </AppContext.Provider>
    )
};



export const useGlobalContext = () => {
    return useContext(AppContext)
};

export {AppContext, AppProvider}