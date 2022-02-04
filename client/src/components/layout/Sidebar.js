import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { links } from '../../links';
import { FaMoneyBillAlt, FaBusinessTime, FaChartPie } from 'react-icons/fa';
import { useGlobalContext} from "../../context/context";
import CreateOrderModal from '../misc/CreateOrderModal';

const Sidebar = () => {
    const { gameData, openCreateOrderModal } = useGlobalContext();
    const [orderExists, setOrderExists] = useState(false);
    const [relativeStake, setRelativeStake] = useState(0);
    const [tableDataArray, setTableDataArray] = useState([]);

    const orderNotExists = async () => {
        const order = gameData.orders.filter(item => item.provider === gameData.player._id);
        setOrderExists(!Array.isArray(order) || !order.length);
    };

    useEffect(() => {
        orderNotExists();
        let newRelativeStake = ((gameData.player.stake / gameData.totalStake) * 100).toFixed(1);
        setRelativeStake(newRelativeStake);
        const renderTableData = async () => {
            const players = await gameData.players.sort((a, b) => parseInt(b.upgradeNumber) === parseInt(a.upgradeNumber) ? (parseInt(b.balance) + parseInt(b.stake)) - (parseInt(a.balance) + parseInt(a.stake)) : parseInt(b.upgradeNumber) - parseInt(a.upgradeNumber));
            const playersArray = await players.slice(0, 5);
            setTableDataArray(playersArray);
        };
        renderTableData();
    }, [gameData]);

    return (
        <div>
            <div className="sidebar">
                <ul className='sidebar-links'>
                    {links.map((link) => {
                        const { id, url, text, icon } = link;
                        return (
                            <li key={id}>
                                <Link to={url}>
                                    {icon}
                                    {text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="stats-sidebar">
                <h3>Stats</h3>
                <div className="stats-sidebar-values">
                    <div className="stats-sidebar-values-stat">
                        <FaMoneyBillAlt style={{color: "green", fontSize: "22px"}}/>
                        <h4>{gameData.player.balance}</h4>
                    </div>
                    <div className="stats-sidebar-values-stat">
                        <FaBusinessTime style={{color: "#38aaff", fontSize: "22px"}}/>
                        <h4 style={gameData.player.amountOfAvailableService === 1 ? {color: "forestgreen", fontSize: "18px"} : {color: "darkred", fontSize: "18px"}}>{gameData.player.amountOfAvailableService === 1 ? 'AVAILABLE' : 'UNAVAILABLE'}</h4>
                    </div>
                    <div className="stats-sidebar-values-stat">
                        <FaChartPie style={{color: "#ffba72", fontSize: "22px"}}/>
                        <h4>{gameData.player.stake} ({relativeStake}%)</h4>
                    </div>
                    <hr />
                    <div className="stats-sidebar-values-stat">
                        <h4>Number of upgrades: {gameData.player.upgradeNumber}</h4>
                    </div>
                    <div className="stats-sidebar-other-services">
                        <div className={`${(gameData.player.amountOfOtherService1 > 0) ? 'stats-sidebar-container-green' : 'stats-sidebar-container-red'}`}>
                            <h4>{gameData.player.typeOfOtherService1}</h4>
                        </div>
                        <div className={`${(gameData.player.amountOfOtherService1 > 0) ? 'stats-sidebar-container-green' : 'stats-sidebar-container-red'}`}>
                            <h4>{gameData.player.amountOfOtherService1}</h4>
                        </div>
                    </div>
                    <div className="stats-sidebar-other-services">
                        <div className={`${(gameData.player.amountOfOtherService2 > 0) ? 'stats-sidebar-container-green' : 'stats-sidebar-container-red'}`}>
                            <h4>{gameData.player.typeOfOtherService2}</h4>
                        </div>
                        <div className={`${(gameData.player.amountOfOtherService2 > 0) ? 'stats-sidebar-container-green' : 'stats-sidebar-container-red'}`}>
                            <h4>{gameData.player.amountOfOtherService2}</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div className="create-order-container">
                {gameData.player.amountOfAvailableService === 1 && orderExists ? <button className="create-order-btn" onClick={openCreateOrderModal}>Set Price</button> : ''}
            </div>
            <div className="ranking-sidebar">
                <h3>Top 5 players</h3>
                <table className="table-all-rankings">
                    <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Number of upgrades</th>
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
                                <td>{item.upgradeNumber}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>
            <CreateOrderModal/>
        </div>
    )
};

export default Sidebar