import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";

const RankingTable = () => {
    const { gameData,  } = useGlobalContext();
    const [tableDataArray, setTableDataArray] = useState([]);

    useEffect(() => {
        const renderTableData = async () => {
            const players = await gameData.players.sort((a, b) => parseInt(b.upgradeNumber) === parseInt(a.upgradeNumber) ? (parseInt(b.balance) + parseInt(b.stake)) - (parseInt(a.balance) + parseInt(a.stake)) : parseInt(b.upgradeNumber) - parseInt(a.upgradeNumber));
            setTableDataArray(players);
        };
        renderTableData();
    }, [gameData]);


    return (
        <>
            <div className="ranking-container">
                <div className="table-all-transactions-container">
                    <h2>Players Ranking</h2>
                    <div className="table-ranking">
                        <table className="table-all-rankings">
                            <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Type of service</th>
                                <th>Number of upgrades</th>
                                <th>Balance</th>
                                <th>Stake</th>
                                <th>Revenue from trade</th>
                                <th>Revenue from stake</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                tableDataArray.map((item, index) => (
                                    <tr
                                        key={item._id}
                                        style={{background: `${item.playerName === gameData.player.playerName ? '#fffd6c' : ''}`}}
                                    >
                                        <td><strong>{index + 1}</strong></td>
                                        <td>{item.playerName}</td>
                                        <td>{item.typeOfService}</td>
                                        <td>{item.upgradeNumber}</td>
                                        <td>{item.balance}</td>
                                        <td>{item.stake}</td>
                                        <td>{item.fromServiceBalance}</td>
                                        <td>{item.fromStakeBalance}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
};

export default RankingTable