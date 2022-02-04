import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AllTransactionsTable = () => {
    const { gameData,  } = useGlobalContext();
    const [tableDataArray, setTableDataArray] = useState([]);
    const [sortBy, setSortBy] = useState('time');
    const [orderOfSort, setOrderOfSort] = useState('ascending');
    const [checkBoxes, setCheckBoxes] = useState([{type: "Mechanical service", isChecked: false}, {type: "Electrical service", isChecked: false}, {type: "IT service", isChecked: false}, {type: "Stake", isChecked: false}, {type: "Unstake", isChecked: false}]);

    const displayTime = async (time) => {
        const createdMillis = await new Date(time);
        return createdMillis.toLocaleTimeString('it-IT');
    };

    const sortDataArray = async (dataArray) => {
        if (sortBy === 'time') {
            return await dataArray.sort((a, b) => {
                let arrayA = a.createdAt.split(":");
                let timeA = (parseInt(arrayA[0], 10) * 60 * 60) + (parseInt(arrayA[1], 10) * 60) + parseInt(arrayA[2], 10);
                let arrayB = b.createdAt.split(":");
                let timeB = (parseInt(arrayB[0], 10) * 60 * 60) + (parseInt(arrayB[1], 10) * 60) + parseInt(arrayB[2], 10);
                if (orderOfSort === "descending") {
                    return timeB - timeA;
                } if (orderOfSort === "ascending") {
                    return timeA - timeB;
                }
            });
        } if (sortBy === 'consumer') {
            return await dataArray.sort((a, b) => {
                let textA = a.consumer.toUpperCase();
                let textB = b.consumer.toUpperCase();
                if (orderOfSort === "descending") {
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                } if (orderOfSort === "ascending") {
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                }
            });
        } if (sortBy === 'provider') {
            return await dataArray.sort((a, b) => {
                let textA = a.provider.toUpperCase();
                let textB = b.provider.toUpperCase();
                if (orderOfSort === "descending") {
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                } if (orderOfSort === "ascending") {
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                }
            });
        } if (sortBy === 'typeOfService') {
            return await dataArray.sort((a, b) => {
                let textA = a.typeOfService.toUpperCase();
                let textB = b.typeOfService.toUpperCase();
                if (orderOfSort === "descending") {
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                } if (orderOfSort === "ascending") {
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                }
            });
        } if (sortBy === 'price') {
            if (orderOfSort === "descending") {
                return await dataArray.sort((a, b) => parseInt(b.price) - parseInt(a.price));
            } if (orderOfSort === "ascending") {
                return await dataArray.sort((a, b) => parseInt(a.price) - parseInt(b.price));
            }
        } if (sortBy === 'txFee') {
            if (orderOfSort === "descending") {
                return await dataArray.sort((a, b) => parseInt(b.txFee) - parseInt(a.txFee));
            } if (orderOfSort === "ascending") {
                return await dataArray.sort((a, b) => parseInt(a.txFee) - parseInt(b.txFee));
            }
        }
    };

    const selectOne = async (e) => {
        let itemName = e.target.name;
        let checked = e.target.checked;
        const newArray = await checkBoxes.map(item =>
            item.type === itemName ? { ...item, isChecked: checked } : item
        );
        setCheckBoxes(newArray);
    };

    const filterDataArray = async (dataArray) => {
        const checkedBoxes = await checkBoxes.filter(item => item.isChecked);
        const selectedTypes = await checkedBoxes.map(item => item.type);
        if (!Array.isArray(selectedTypes) || !selectedTypes.length) {
            return dataArray;
        }
        return dataArray.filter(data => selectedTypes.includes(data.typeOfService));
    };

    useEffect(() => {
        const renderTableData = async () => {
            const transactionsArray = await Promise.all(gameData.allTransactions.map(async (item) => {
                let { consumer, provider, typeOfService, amountOfService, price, txFee, createdAt } = item;
                const consumerObject = await gameData.players.filter(player => player._id === consumer);
                const providerObject = await gameData.players.filter(player => player._id === provider);
                const timeString = await displayTime(createdAt);
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
                            type: "cancel transaction",
                            createdAt: timeString
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
                        type: "cancel transaction",
                        createdAt: timeString
                    }
                )
            }));
            const filteredTransactionsArray = await filterDataArray(transactionsArray);
            const dataArray = await sortDataArray(filteredTransactionsArray);
            setTableDataArray(dataArray);
        };
        renderTableData();
    }, [gameData, checkBoxes, orderOfSort]);


    return (
        <>
            <div className="table-all-transactions-container">
                <div className="filter-all-transactions">
                    {
                        checkBoxes.map((item) => (
                            <label className="checkbox-container" key={item.type}>{item.type}
                                <input type="checkbox" name={item.type} checked={item.isChecked} onChange={selectOne}/>
                                <span className="checkmark"></span>
                            </label>
                        ))
                    }
                </div>
                <div className="table-all-transactions-overflow">
                    <table className="table-all-transactions">
                        <thead>
                        <tr>
                            <th onClick={() => {
                                setSortBy('time');
                                if (orderOfSort === 'ascending') {
                                    setOrderOfSort('descending');
                                } if (orderOfSort === 'descending') {
                                    setOrderOfSort('ascending');
                                }
                            }}>Time {sortBy === 'time' ? orderOfSort === 'ascending' ? <FaArrowUp/> : <FaArrowDown/> : ""}</th>
                            <th onClick={() => {
                                setSortBy('consumer');
                                if (orderOfSort === 'ascending') {
                                    setOrderOfSort('descending');
                                } if (orderOfSort === 'descending') {
                                    setOrderOfSort('ascending');
                                }
                            }}>Consumer {sortBy === 'consumer' ? orderOfSort === 'ascending' ? <FaArrowUp/> : <FaArrowDown/> : ""}</th>
                            <th onClick={() => {
                                setSortBy('provider');
                                if (orderOfSort === 'ascending') {
                                    setOrderOfSort('descending');
                                } if (orderOfSort === 'descending') {
                                    setOrderOfSort('ascending');
                                }
                            }}>Provider {sortBy === 'provider' ? orderOfSort === 'ascending' ? <FaArrowUp/> : <FaArrowDown/> : ""}</th>
                            <th onClick={() => {
                                setSortBy('typeOfService');
                                if (orderOfSort === 'ascending') {
                                    setOrderOfSort('descending');
                                } if (orderOfSort === 'descending') {
                                    setOrderOfSort('ascending');
                                }
                            }}>Type of service {sortBy === 'typeOfService' ? orderOfSort === 'ascending' ? <FaArrowUp/> : <FaArrowDown/> : ""}</th>
                            <th onClick={() => {
                                setSortBy('price');
                                if (orderOfSort === 'ascending') {
                                    setOrderOfSort('descending');
                                } if (orderOfSort === 'descending') {
                                    setOrderOfSort('ascending');
                                }
                            }}>Price/Amount {sortBy === 'price' ? orderOfSort === 'ascending' ? <FaArrowUp/> : <FaArrowDown/> : ""}</th>
                            <th onClick={() => {
                                setSortBy('txFee');
                                if (orderOfSort === 'ascending') {
                                    setOrderOfSort('descending');
                                } if (orderOfSort === 'descending') {
                                    setOrderOfSort('ascending');
                                }
                            }}>Tx Fee {sortBy === 'txFee' ? orderOfSort === 'ascending' ? <FaArrowUp/> : <FaArrowDown/> : ""}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            tableDataArray.map((item) =>
                                (
                                    <tr key={item.id}>
                                        <td>{item.createdAt}</td>
                                        <td>{item.consumer}</td>
                                        <td>{item.provider}</td>
                                        <td>{item.typeOfService}</td>
                                        <td>{item.price}</td>
                                        <td>{item.txFee}</td>
                                    </tr>
                                )
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
};

export default AllTransactionsTable