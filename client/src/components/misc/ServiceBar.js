import React, {useState, useEffect, useRef} from 'react';
import { useGlobalContext} from "../../context/context";

const ServiceBar = () => {
    const { gameData } = useGlobalContext();
    const [serviceCompleted, setServiceCompleted] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    function millisToMinutesAndSeconds(millis) {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + 'min ' + d.getUTCSeconds() + 's' );
        }
    }

    useInterval(async () => {
        if (gameData.player.amountOfAvailableService === 0) {
            const service = await gameData.services.filter(service => service.provider === gameData.player._id);
            let newServiceCompleted = Math.floor(((Date.now() - service[0].serviceTimestamp) / service[0].timeForService) * 100);
            setServiceCompleted(newServiceCompleted);
            let timeLeft = service[0].timeForService - (Date.now() - service[0].serviceTimestamp);
            setTimeLeft(millisToMinutesAndSeconds(timeLeft));
        } else {
            setServiceCompleted(100);
        }
    }, 50);


    return (
        <>
            <div className="time-container">
                <div className="bar-container">
                    <div className="bar-filler" style={{width: `${serviceCompleted}%`}}>
                        <span className="bar-label">{`${serviceCompleted}%`}</span>
                    </div>
                    <div className="bottom">
                        {
                            gameData.player.amountOfAvailableService === 1 ? (
                                <p>Time for service = {millisToMinutesAndSeconds(gameData.player.timeForService)}</p>
                            ) : (
                                <p>Time left = {timeLeft}</p>
                            )
                        }
                        <i></i>
                    </div>
                </div>
            </div>
        </>
    )
};

export default ServiceBar