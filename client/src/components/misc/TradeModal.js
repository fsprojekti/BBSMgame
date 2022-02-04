import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";
import { FaTimes } from 'react-icons/fa';
import Axios from "axios/index";

const TradeModal = () => {
    const { gameData, isTradeModalOpen, closeTradeModal, tradeModalContent } = useGlobalContext();
    const [txFee, setTxFee] = useState("0");
    const [showAlert, setShowAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [tableDataArray, setTableDataArray] = useState([]);

    const countDecimals = (value) => {
        if(Math.floor(value).toString() === value) return 0;
        return value.toString().split(".")[1].length || 0;
    };

    const confirm = async () => {
        try {
            if (txFee === undefined || txFee === "") {
                setAlertContent('You must enter a value');
                setShowAlert(true);
            } else {
                if (isNaN(txFee) || txFee < 0) {
                    setAlertContent('Input cannot be a negative number');
                    setShowAlert(true);
                } else {
                    if (countDecimals(txFee) > 0) {
                        setAlertContent('Input value must be an integer');
                        setShowAlert(true);
                    } else {
                        if (parseInt(tradeModalContent.price) + parseInt(txFee) > gameData.player.balance) {
                            setAlertContent('Price and TxFee is higher than balance');
                            setShowAlert(true);
                        } else {
                            const token = localStorage.getItem("auth-token");
                            const playerId = localStorage.getItem("playerId");
                            const data = {
                                orderId: tradeModalContent._id,
                                txFee: txFee
                            };
                            const options = {
                                headers: {
                                    Authorization: "Bearer " + token
                                }
                            };
                            const createRes =  await Axios.post(`/player/createTransaction/${playerId}`, data, options);
                            closeTradeModal();
                            setAlertContent('');
                            setShowAlert(false);
                            setTxFee();
                            document.getElementById("inputHolder").value= "";
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

    const changeFeeInput = async (e) => {
        try {
            if (e.target.value === "") {
                setTxFee("0");
            } else {
                setTxFee(e.target.value)
            }
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const renderTableData = async () => {
            const transactions = await gameData.allPendingTransactions.sort((a, b) => b.txFee - a.txFee);
            const transactionsArray = await Promise.all(transactions.map(async (item) => {
                let { consumer, provider, typeOfService, amountOfService, price, txFee } = item;
                const consumerObject = await gameData.players.filter(player => player._id === consumer);
                const providerObject = await gameData.players.filter(player => player._id === provider);
                if (!Array.isArray(providerObject) || !providerObject.length) {
                    return (
                        {
                            id: item._id,
                            consumer: consumerObject[0].playerName,
                            provider: "Blockchain",
                            typeOfService: typeOfService,
                            amountOfService: amountOfService,
                            price: price,
                            txFee: txFee,
                            type: "cancel transaction"
                        }
                    )
                }
                return (
                    {
                        id: item._id,
                        consumer: consumerObject[0].playerName,
                        provider: providerObject[0].playerName,
                        typeOfService: typeOfService,
                        amountOfService: amountOfService,
                        price: price,
                        txFee: txFee,
                        type: "cancel transaction"
                    }
                )
            }));
            setTableDataArray(transactionsArray);
        };
        renderTableData();
    }, [gameData]);

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
                `${isTradeModalOpen ? 'modal-confirm-overlay show-modal-confirm' : 'modal-confirm-overlay'}`
            }
        >
            <div className='modal-confirm-container'>
                <h3>Create Trade</h3>
                <div className='modal-confirm-container-data'>
                    <div className='modal-confirm-container-input'>
                        <ul>
                            <li>Player: {tradeModalContent.playerName}</li>
                            <li>typeOfService: {tradeModalContent.typeOfService}</li>
                            <li>price: {tradeModalContent.price}</li>
                        </ul>
                        <div className={"trade-modal-input-group"}>
                            <label htmlFor={"txFee"}>Tx Fee</label>
                            <div className="trade-modal-input-group-container">
                                <input type={"text"} name={"txFee"} id={"inputHolder"} placeholder={"Enter tx fee"} onChange={e => changeFeeInput(e)} onKeyPress={e => handleKeypress(e)}/>
                            </div>
                        </div>
                        <div className={`${showAlert? 'trade-modal-input-alert show-trade-modal-input-alert' : 'trade-modal-input-alert'}`}>
                            {alertContent}
                        </div>
                    </div>
                    <div className="trade-modal-table-container">
                        <table className="modal-table-pending-transactions">
                            <thead>
                            <tr>
                                <th className="table-pending-transactions-head">No.</th>
                                <th className="table-pending-transactions-head">Pending transactions</th>
                                <th className="table-pending-transactions-head">Tx Fee</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                tableDataArray.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        data-tip data-for={item.id}
                                    >
                                        <td><strong>{index + 1}</strong></td>
                                        <td>
                                            {item.consumer} &#8646; {item.provider}
                                        </td>
                                        <td>{item.txFee}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
                <button className='close-modal-btn' onClick={() => {
                    closeTradeModal();
                    setAlertContent('');
                    setShowAlert(false);
                    setTxFee();
                    document.getElementById("inputHolder").value= "";
                }}>
                    <FaTimes></FaTimes>
                </button>
                <button className='confirm-modal-btn' onClick={confirm}>Confirm</button>
            </div>
        </div>
    )
};

export default TradeModal