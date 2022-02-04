import React, {useState, useEffect} from 'react'
import { useGlobalContext} from "../../context/context";
import balanceImg from '../../assets/balance.png';
import stakeImg from '../../assets/stake.png';
import ServiceBar from './ServiceBar';
import ServiceLoading from './ServiceLoading';

const Stats = () => {
    const { gameData } = useGlobalContext();
    const [relativeStake, setRelativeStake] = useState(0);
    const [serviceDataArray, setServiceDataArray] = useState([]);

    function millisToMinutesAndSeconds(millis) {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + 'min ' + d.getUTCSeconds() + 's' );
        }
    }

    useEffect(() => {
        let newRelativeStake = ((gameData.player.stake / gameData.totalStake) * 100).toFixed(1);
        setRelativeStake(newRelativeStake);
        const renderServiceData = async () => {
            const services = await gameData.services.filter(service => service.consumer === gameData.player._id);
            const serviceArray = await Promise.all(services.map(async (item) => {
                let { consumer, provider, typeOfService, serviceTimestamp, timeForService } = item;
                const consumerObject = await gameData.players.filter(player => player._id === consumer);
                const providerObject = await gameData.players.filter(player => player._id === provider);
                return (
                    {
                        id: item._id,
                        consumer: consumerObject[0].playerName,
                        provider: providerObject[0].playerName,
                        typeOfService: typeOfService,
                        serviceTimestamp: serviceTimestamp,
                        timeForService: timeForService
                    }
                )
            }));
            setServiceDataArray(serviceArray);
        };
        renderServiceData();
    }, [gameData]);

    return (
        <>
            <div className="stats-grid">
                <div className="grid-item-stats">
                    <div className={"stats-image"}>
                        <img src={balanceImg} alt={"balance"}/>
                    </div>
                    <div className={"stats-value"}>
                        <p>{gameData.player.balance}</p>
                    </div>
                </div>
                <div className="grid-item-stats">
                    <div className="time-value">
                        <h2>{gameData.player.typeOfService}</h2>
                    </div>
                    <div className={`${gameData.player.amountOfAvailableService === 1 ? 'time-value-available' : 'time-value-unavailable'}`}>
                        <h2>{gameData.player.amountOfAvailableService === 1 ? 'Available' : 'Unavailable'}</h2>
                    </div>
                    <ServiceBar/>
                </div>
                <div className="grid-item-stats">
                    <div className="stake-image">
                        <img src={stakeImg} alt={"stake"}/>
                    </div>
                    <div className={"stake-value"}>
                        <p>{gameData.player.stake}</p>
                    </div>
                    <div className={"stake-value"}>
                        <p>({relativeStake}%)</p>
                    </div>
                </div>
                <div className="grid-item-stats">
                    <div className="upgrade-value">
                        <h3>Number of upgrades: {gameData.player.upgradeNumber}</h3>
                    </div>
                    <div className="upgrade-container">
                        <div className={`${(gameData.player.amountOfOtherService1 > 0) ? 'upgrade-container-green' : 'upgrade-container-red'}`}>
                            <p>{`${gameData.player.amountOfOtherService1}`} &#215; {`${gameData.player.typeOfOtherService1}`}</p>
                        </div>
                        <div>
                            <p>+</p>
                        </div>
                        <div className={`${(gameData.player.amountOfOtherService2 > 0) ? 'upgrade-container-green' : 'upgrade-container-red'}`}>
                            <p>{`${gameData.player.amountOfOtherService2}`} &#215; {`${gameData.player.typeOfOtherService2}`}</p>
                        </div>
                    </div>
                    <div className="upgrade-container">
                        <div className="upgrade-container-formula">
                            <p>{`${gameData.player.typeOfOtherService1}`} + {`${gameData.player.typeOfOtherService2}`} = &#8681; {millisToMinutesAndSeconds(gameData.player.timeForService - gameData.player.nextTimeForService)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="services-container">
                <h3>Purchased Services</h3>
                <div className="loading-services-container">
                    {
                        serviceDataArray.map((item) => (
                            <ServiceLoading item={item} key={item.id}/>
                        ))
                    }
                </div>
            </div>
        </>
    )
};

export default Stats