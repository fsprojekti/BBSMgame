import React from 'react'
import { ResponsiveBar } from '@nivo/bar';
import { useGlobalContext} from "../../context/context";

const BarChart = ({dataArray, modifiedData, checked}) => {
    const { gameData, openTradeModal, setTradeModalContent, openCancelOrderModal, setCancelOrderModalContent } = useGlobalContext();

    const setTradeModal = (data) => {
        if (data.typeOfService !== gameData.player.typeOfService) {
            const realData = dataArray.filter(item => item._id === data._id);
            if (!(!Array.isArray(realData) || !realData.length)) {
                setTradeModalContent(realData[0]);
                openTradeModal();
            }
        } else {
            if (data.playerName === gameData.player.playerName) {
                const realData = dataArray.filter(item => item._id === data._id);
                if (!(!Array.isArray(realData) || !realData.length)) {
                    setCancelOrderModalContent(realData[0]);
                    openCancelOrderModal();
                }
            }
        }
    };

    const mouseHover = (data, event) => {
        if (data.typeOfService !== gameData.player.typeOfService) {
            event.target.style.cursor = 'pointer';
        } else {
            if (data.playerName === gameData.player.playerName) {
                event.target.style.cursor = 'pointer';
            }
        }
    };

    const renderLabel = (data) => {
        const realData = dataArray.filter(item => item._id === data._id);
        if (!(!Array.isArray(realData) || !realData.length)) {
            if (!checked) {
                return realData[0].price.toString();
            } else {
                return millisToMinutesAndSecondsShort(realData[0].timeForService);
            }
        }
    };

    const renderTooltip = (data) => {
        const realData = dataArray.filter(item => item._id === data._id);
        if (!(!Array.isArray(realData) || !realData.length)) {
            return realData[0].price.toString();
        }
    };

    const millisToMinutesAndSecondsShort = (millis) => {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + ':' + d.getUTCSeconds());
        }
    };

    function millisToMinutesAndSeconds(millis) {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + 'min ' + d.getUTCSeconds() + 's' );
        }
    }

    const toggleData = () => {
        if (!checked) {
            return [ 'price' ];
        } else {
            return [ 'height' ]
        }
    };

    const toggleNameAxis = () => {
        if (!checked) {
            return ('PRICE');
        } else {
            return ('TIME FOR SERVICE');
        }
    };


    return (
        <ResponsiveBar
            data={modifiedData}
            onClick={(data) => setTradeModal(data.data)}
            onMouseEnter={(data, event) => mouseHover(data.data, event)}
            keys={toggleData}
            indexBy="playerName"
            margin={{ top: 10, right: 20, bottom: 50, left: 70 }}
            padding={0.25}
            valueScale={{ type: 'symlog'}}
            theme={{ "fontSize": 14, fontFamily: "Roboto, sans-serif", axis: { legend: { text: { fontSize: "16px", fontWeight: "bold", fontFamily: "Roboto, sans-serif" } } } }}
            colors={d => d.data.color}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: toggleNameAxis(),
                legendPosition: 'middle',
                legendOffset: -50,
                tickValues: 3
            }}
            tooltip={({ data, id }) => {
                return (
                    <strong>
                        <p>Price - {data.playerName}: {renderTooltip(data)}</p>
                        <p>Time for service: {millisToMinutesAndSeconds(data.timeForService)}</p>
                    </strong>

                )
            }}
            label={(data) => renderLabel(data.data)}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="white"
            animate={false}
            motionStiffness={90}
            motionDamping={15}
        />
    )
};


export default BarChart