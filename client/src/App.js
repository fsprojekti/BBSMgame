import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {useGlobalContext} from "./context/context";
import { io } from 'socket.io-client';

import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from "./components/auth/Login";
import Trade from './components/pages/Trade';
import Blockchain from './components/pages/Blockchain';
import Ranking from './components/pages/Ranking';
import Error from './components/pages/Error';
import Axios from "axios/index";

//Axios.defaults.baseURL = 'https://sharedmanufacturing.ldse.si:8000';
Axios.defaults.baseURL = 'http://localhost:8000';

function App() {
    const { setIsGameOn, isGameOn, setGameData, gameData, openAlert } = useGlobalContext();
    const [socket, setSocket] = useState();

    const socketConnected = useCallback(() => {
        try {
            const playerId = localStorage.getItem("playerId");
            const sessionID = socket.id;
            socket.emit("query", sessionID, playerId);
        } catch (err) {
            if (err.response !== undefined && err.response.data.message === "Auth failed") {
                localStorage.setItem("auth-token", "");
                localStorage.setItem("playerId", "");
                window.location.reload(false);
            }
        }
    }, [socket]);

    const initialData = useCallback(async (data) => {
        try {
            const token = localStorage.getItem("auth-token");
            setGameData({
                token,
                player: data.player,
                orders: data.orders,
                allPendingTransactions: data.allPendingTransactions,
                services: data.services,
                totalStake: data.totalStake,
                players: data.players,
                allTransactions: data.allTransactions,
                miningTime: data.miningTime
            });
            setIsGameOn(data.isGameOn);
        } catch (err) {
            console.log(err);
        }
    }, [setGameData, setIsGameOn]);

    const startGame = useCallback(async (data) => {
        try {
            setIsGameOn(true);
            setGameData(prevState => {
                let newData = {...prevState};
                newData.miningTime = data;
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData, setGameData, setIsGameOn]);

    const endGame = useCallback(async () => {
        try {
            setIsGameOn(false);
        } catch (err) {
            console.log(err);
        }
    }, [setIsGameOn]);

    const createOrder = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.orders.push(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, []);

    const deleteOrder = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.orders = newData.orders.filter( obj => obj._id !== data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData, setGameData]);

    const updateBalance = useCallback(async (value, id, type, amount) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                if (newData.player._id === id) {
                    newData.player.balance = parseInt(value);
                    const elementsIndex = newData.players.findIndex(el => el._id === id );
                    let newArray = [...newData.players];
                    if (type === "stake") {
                        newData.player.fromStakeBalance = parseInt(amount);
                        newArray[elementsIndex] = {...newArray[elementsIndex], balance: parseInt(value), fromStakeBalance: parseInt(amount)};
                    } else if (type === "trade") {
                        newData.player.fromServiceBalance = parseInt(amount);
                        newArray[elementsIndex] = {...newArray[elementsIndex], balance: parseInt(value), fromServiceBalance: parseInt(amount)};
                    } else {
                        newArray[elementsIndex] = {...newArray[elementsIndex], balance: parseInt(value)};
                    }
                    newData.players = newArray;
                } else {
                    const elementsIndex = newData.players.findIndex(el => el._id === id );
                    let newArray = [...newData.players];
                    if (type === "stake") {
                        newArray[elementsIndex] = {...newArray[elementsIndex], balance: parseInt(value), fromStakeBalance: parseInt(amount)};
                    } else if (type === "trade") {
                        newArray[elementsIndex] = {...newArray[elementsIndex], balance: parseInt(value), fromServiceBalance: parseInt(amount)};
                    } else {
                        newArray[elementsIndex] = {...newArray[elementsIndex], balance: parseInt(value)};
                    }
                    newData.players = newArray;
                }
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const deleteTransaction = useCallback(async (data, intended) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                const transaction = newData.allPendingTransactions.filter( obj => obj._id === data);
                if ((transaction[0].consumer === newData.player._id) && !intended)  {
                    openAlert();
                }
                newData.allPendingTransactions = newData.allPendingTransactions.filter( obj => obj._id !== data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData, setGameData]);

    const createTransaction = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                const found = prevState.allPendingTransactions.some(el => el._id === data._id);
                if (!found) {
                    let newData = {...prevState};
                    newData.allPendingTransactions.push(data);
                    return newData;
                } else {
                    return {...prevState};
                }
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const createService = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.services.push(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, []);

    const deleteService = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.services = newData.services.filter( obj => obj._id !== data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData, setGameData]);

    const updateAvailableService = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.player.amountOfAvailableService = parseInt(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateOtherService1 = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.player.amountOfOtherService1 = parseInt(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateOtherService2 = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.player.amountOfOtherService2 = parseInt(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateStake = useCallback(async (id, value) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                if (newData.player._id === id) {
                    newData.player.stake = parseInt(value);
                    const elementsIndex = newData.players.findIndex(el => el._id === id );
                    let newArray = [...newData.players];
                    newArray[elementsIndex] = {...newArray[elementsIndex], stake: parseInt(value)};
                    newData.players = newArray;
                    newData.totalStake = newArray.reduce((total, current) => total + current.stake, 0);
                } else {
                    const elementsIndex = newData.players.findIndex(el => el._id === id );
                    let newArray = [...newData.players];
                    newArray[elementsIndex] = {...newArray[elementsIndex], stake: parseInt(value)};
                    newData.players = newArray;
                }
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateTime = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.miningTime = parseInt(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const initialTime = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.player.nextTimeForService = data;
                newData.player.initialTimeForService = newData.player.timeForService;
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateServiceTime = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.player.serviceTimestamp = data;
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateProduction = useCallback(async (newTimeForService, newNextTimeForService, upgradeNumber, service1, service2) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.player.timeForService = newTimeForService;
                newData.player.nextTimeForService = newNextTimeForService;
                newData.player.upgradeNumber = upgradeNumber;
                newData.player.amountOfOtherService1 = service1;
                newData.player.amountOfOtherService2 = service2;
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const addAllTransaction = useCallback(async (data) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                newData.allTransactions.push(data);
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);

    const updateUpgrade = useCallback(async (id, value) => {
        try {
            setGameData(prevState => {
                let newData = {...prevState};
                if (newData.player._id === id) {
                    newData.player.upgradeNumber = value;
                    const elementsIndex = newData.players.findIndex(el => el._id === id );
                    let newArray = [...newData.players];
                    newArray[elementsIndex] = {...newArray[elementsIndex], upgradeNumber: value};
                    newData.players = newArray;
                } else {
                    const elementsIndex = newData.players.findIndex(el => el._id === id );
                    let newArray = [...newData.players];
                    newArray[elementsIndex] = {...newArray[elementsIndex], upgradeNumber: value};
                    newData.players = newArray;
                }
                return newData;
            });
        } catch (err) {
            console.log(err);
        }
    }, [gameData]);


    useEffect(() => {
        const connectSocket = async () => {
            const token = await localStorage.getItem("auth-token");
            const playerId = await localStorage.getItem("playerId");
            if (!((token === null || token === "") && (playerId === null || playerId === ""))) {
                /*const newSocket = io('https://sharedmanufacturing.ldse.si:8000', {
                    query: {
                        playerId: playerId
                    },
                    auth: {
                        token: token
                    }
                });*/
                const newSocket = io('localhost:8000', {
                    query: {
                        playerId: playerId
                    },
                    auth: {
                        token: token
                    }
                });
                setSocket(newSocket);
                return () => newSocket.close();
            }
        };
        connectSocket();
    }, [isGameOn]);


    useEffect(() => {
        if (socket == null) return;
        socket.on('connect', socketConnected);
        socket.on('data', initialData);
        socket.on('start', startGame);
        socket.on('end', endGame);
        socket.on("create_order", createOrder);
        socket.on("delete_order", deleteOrder);
        socket.on("update_balance", updateBalance);
        socket.on("delete_transaction", deleteTransaction);
        socket.on("create_transaction", createTransaction);
        socket.on("create_service", createService);
        socket.on("delete_service", deleteService);
        socket.on("update_available_service", updateAvailableService);
        socket.on("update_other_service1", updateOtherService1);
        socket.on("update_other_service2", updateOtherService2);
        socket.on("update_stake", updateStake);
        socket.on("update_time", updateTime);
        socket.on("initial_time", initialTime);
        socket.on("update_service_time", updateServiceTime);
        socket.on("update_production", updateProduction);
        socket.on("add_allTransaction", addAllTransaction);
        socket.on("update_upgrade", updateUpgrade);
        return () => {
            socket.off('connect');
            socket.off('data');
            socket.off('start');
            socket.off('end');
            socket.off('create_order');
            socket.off('delete_order');
            socket.off('update_balance');
            socket.off('delete_transaction');
            socket.off('create_transaction');
            socket.off('create_service');
            socket.off('delete_service');
            socket.off('update_available_service');
            socket.off('update_other_service1');
            socket.off('update_other_service2');
            socket.off('update_stake');
            socket.off('update_time');
            socket.off('initial_time');
            socket.off('update_service_time');
            socket.off('update_production');
            socket.off('add_allTransaction');
            socket.off('update_upgrade');
        }
    }, [socket,
        gameData,
        socketConnected,
        initialData,
        startGame,
        endGame,
        createOrder,
        deleteOrder,
        updateBalance,
        deleteTransaction,
        createTransaction,
        createService,
        deleteService,
        updateAvailableService,
        updateOtherService1,
        updateOtherService2,
        updateStake,
        updateTime,
        initialTime,
        updateServiceTime,
        updateProduction,
        addAllTransaction,
        updateUpgrade]
    );

    return (
        <>
            <Router>
                <Navbar/>
                <Switch>
                    <Route exact path={"/"} component={Home} />
                    <Route path={"/login"} component={Login}/>
                    <Route path={"/trade"} component={Trade}/>
                    <Route path={"/blockchain"} component={Blockchain}/>
                    <Route path={"/ranking"} component={Ranking}/>
                    <Route path={"*"} component={Error}/>
                </Switch>
            </Router>
        </>
    )
}

export default App
