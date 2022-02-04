import React from 'react';
import { useGlobalContext} from "../../context/context";
import { ResponsivePie } from '@nivo/pie'

const CenteredMetric = ({ dataWithArc, centerX, centerY }) => {
    const { gameData } = useGlobalContext();
    let total = gameData.totalStake;
    return (
        <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
                fontSize: '25px',
                fontWeight: '500',
            }}
        >
            {total}
        </text>
    )
};

const PieChart = ({ data }) => (
    <ResponsivePie
        data={data}
        theme={{ "fontSize": 16, fontFamily: "Roboto, sans-serif", axis: { legend: { text: { fontSize: "16px", fontWeight: "bold", fontFamily: "Roboto, sans-serif" } } } }}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        innerRadius={0.3}
        padAngle={1}
        cornerRadius={3}
        colors={{ scheme: 'yellow_orange_red' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
        enableRadialLabels={false}
        sliceLabelsSkipAngle={10}
        sliceLabelsTextColor="#333333"
        sortByValue={true}
        layers={['slices', 'sliceLabels', CenteredMetric]}
    />
);

export default PieChart