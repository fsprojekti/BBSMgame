import React, {useState, useEffect} from 'react';
import ReactTooltip from 'react-tooltip';
import { useGlobalContext} from "../../context/context";
import { FaTimes } from 'react-icons/fa';
import MiningBar from './MiningBar';


const TransactionsTable = () => {
    const { gameData, openConfirmModal, setConfirmModalContent } = useGlobalContext();
    const [tableDataArray, setTableDataArray] = useState([]);
    const [timeLeft, setTimeLeft] = useState('');
    const [width, setWidth] = useState(0);

    function millisToMinutesAndSeconds(millis) {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + 'min ' + d.getUTCSeconds() + 's' );
        }
    }

    const setCancelTransactionModal = (transaction) => {
        setConfirmModalContent(transaction);
        openConfirmModal();
    };

    useEffect(() => {
        const renderTableData = async () => {
            const transactions = await gameData.allPendingTransactions.sort((a, b) => parseInt(b.txFee) - parseInt(a.txFee));
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
        const calculateTimeLeft = async () => {
            const createdMillis = await new Date(gameData.miningTime).getTime();
            let timeLeft = 10000 - (Date.now() - createdMillis);
            let width = await Math.floor((1 - ((Date.now() - createdMillis) / 10000)) * 100);
            if (width < 0 || timeLeft < 0) {
                width = 0;
                timeLeft = 0;
            }
            setTimeLeft(millisToMinutesAndSeconds(timeLeft));
            setWidth(width);
        };
        calculateTimeLeft();
    }, [gameData]);


    return (
        <>
            <div className="pending-transactions-container">
                <MiningBar/>
                <div className="table-pending-transactions-container">
                    <table className="table-pending-transactions">
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
                                    style={{background: `${(item.consumer === gameData.player.playerName) || (item.provider === gameData.player.playerName) ? '#fffd6c' : ''}`}}
                                >
                                    <td><strong>{index + 1}</strong></td>
                                    <td>
                                        {item.consumer} &#8646; {item.provider}
                                        {item.consumer === gameData.player.playerName ?
                                            <button
                                                className='cancel-transaction-btn'
                                                onClick={() => { ((item.consumer === gameData.player.playerName) || (item.provider === gameData.player.playerName)) && setCancelTransactionModal(item)}}
                                            >
                                                <FaTimes></FaTimes>
                                            </button>
                                            :''}
                                    </td>
                                    <td>{item.txFee}</td>
                                    <td className="table-pending-transactions-tooltip">
                                        <ReactTooltip id={item.id} place="bottom" type="dark" effect="solid">
                                            <ul>
                                                <li>Consumer: {item.consumer}</li>
                                                <li>Provider: {item.provider}</li>
                                                <li>typeOfService: {item.typeOfService}</li>
                                                <li>price: {item.price}</li>
                                            </ul>
                                        </ReactTooltip>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
};

export default TransactionsTable