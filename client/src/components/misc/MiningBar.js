import React, {useState, useEffect, useRef} from 'react';
import { useGlobalContext} from "../../context/context";

const MiningBar = () => {
    const { gameData } = useGlobalContext();
    const [timeLeft, setTimeLeft] = useState('');
    const [width, setWidth] = useState(0);

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
        const createdMillis = await new Date(gameData.miningTime).getTime();
        let timeLeft = 10000 - (Date.now() - createdMillis);
        let width = await Math.floor((1 - ((Date.now() - createdMillis) / 10000)) * 100);
        if (width < 0 || timeLeft < 0) {
            width = 0;
            timeLeft = 0;
        }
        setTimeLeft(millisToMinutesAndSeconds(timeLeft));
        setWidth(width);
    }, 50);

    /*useEffect(() => {
        let time = 200;
        const interval = setInterval(async () => {
            let width = await Math.floor(((time / 200)) * 100);
            setTimeLeft(millisToMinutesAndSeconds(time*50));
            setWidth(width);
            time--;
            if (time < 0) {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [gameData.miningTime]);*/



    return (
        <>
            <div className="mining-progress-container">
                <div className="mining-progress-flex">
                    <p>Mining</p>
                    <div className="mining-progress">
                        <div className="mining-progress-filler" style={{width: `${width}%`}}></div>
                    </div>
                </div>
                <span className="mining-progress-text">Time left: {timeLeft}</span>
            </div>
        </>
    )
};

export default MiningBar