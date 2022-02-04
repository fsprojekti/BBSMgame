import React, {useState, useEffect} from 'react'
import { useGlobalContext} from "../../context/context";
import BarChart from '../misc/BarChart';
import ToggleSwitch from '../misc/ToggleSwitch';


const Trade = () => {
    const { gameData } = useGlobalContext();
    const [dataArray1, setDataArray1] = useState([]);
    const [dataArray2, setDataArray2] = useState([]);
    const [dataArray3, setDataArray3] = useState([]);
    const [modifiedDataArray1, setModifiedDataArray1] = useState([]);
    const [modifiedDataArray2, setModifiedDataArray2] = useState([]);
    const [modifiedDataArray3, setModifiedDataArray3] = useState([]);

    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);

    const handleChange1 = nextChecked => {
        setChecked1(nextChecked);
    };

    const handleChange2 = nextChecked => {
        setChecked2(nextChecked);
    };

    const handleChange3 = nextChecked => {
        setChecked3(nextChecked);
    };

    const millisToFloat = (millis) => {
        const time = millis/60000;
        return time.toFixed(2);
    };


    useEffect(() => {
        const sortDataArrays = async () => {
            let array1 = await gameData.orders.filter(item => item.typeOfService === gameData.player.typeOfOtherService1);
            let array2 = await gameData.orders.filter(item => item.typeOfService === gameData.player.typeOfOtherService2);
            let array3 = await gameData.orders.filter(item => item.typeOfService === gameData.player.typeOfService);
            if (checked1) {
                await array1.forEach((item) => {
                    item.price = parseInt(item.price);
                    item.color = '#1E90FF';
                });
                await array1.sort((a, b) => a.timeForService - b.timeForService);
                await array1.forEach((item) => {
                    item.height = millisToFloat(item.timeForService);
                });
                setDataArray1(array1);

            } else {
                await array1.forEach((item) => {
                    item.price = parseInt(item.price);
                    item.color = '#1E90FF';
                });
                await array1.sort((a, b) => a.price - b.price);
                setDataArray1(array1);
            }
            if (checked2) {
                await array2.forEach((item) => {
                    item.price = parseInt(item.price);
                    item.color = 'green';
                });
                await array2.sort((a, b) => a.timeForService - b.timeForService);
                await array2.forEach((item) => {
                    item.height = millisToFloat(item.timeForService);
                });
                setDataArray2(array2);

            } else {
                await array2.forEach((item) => {
                    item.price = parseInt(item.price);
                    item.color = 'green';
                });
                await array2.sort((a, b) => a.price - b.price);
                setDataArray2(array2);
            }

            if (checked3) {
                await array3.forEach((item) => {
                    item.price = parseInt(item.price);
                    if (item.playerName === gameData.player.playerName) {
                        item.color = '#FFD700';
                    } else {
                        item.color = "#FF8C00";
                    }
                });
                await array3.sort((a, b) => a.timeForService - b.timeForService);
                await array3.forEach((item) => {
                    item.height = millisToFloat(item.timeForService);
                });
                setDataArray3(array3);
            } else {
                await array3.forEach((item) => {
                    item.price = parseInt(item.price);
                    if (item.playerName === gameData.player.playerName) {
                        item.color = '#FFD700';
                    } else {
                        item.color = "#FF8C00";
                    }
                });
                await array3.sort((a, b) => a.price - b.price);
                setDataArray3(array3);
            }
            let modifiedArray1 = await array1.map((item) => {
               if (item.price < 1) {
                   return {...item, price: 0.9};
               } else {
                   return {...item};
               }
            });
            let modifiedArray2 = await array2.map((item) => {
                if (item.price < 1) {
                    return {...item, price: 0.9};
                } else {
                    return {...item};
                }
            });
            let modifiedArray3 = await array3.map((item) => {
                if (item.price < 1) {
                    return {...item, price: 0.9};
                } else {
                    return {...item};
                }
            });
            setModifiedDataArray1(modifiedArray1);
            setModifiedDataArray2(modifiedArray2);
            setModifiedDataArray3(modifiedArray3);
        };
        sortDataArrays();
    }, [gameData, checked1, checked2, checked3]);

    return (
        <>
            <div className="trades-container">
                <div className="other-services-trade-container">
                    <div className="chart-container">
                        <div className="chart-container-text">
                            <h3>{`${gameData.player.typeOfOtherService1}`}</h3>
                        </div>
                        <ToggleSwitch checked={checked1} onChange={handleChange1}/>
                        <div className="chart-container-chart">
                            <BarChart dataArray={dataArray1} modifiedData={modifiedDataArray1} checked={checked1}/>
                        </div>
                    </div>
                    <div className="chart-container">
                        <div className="chart-container-text">
                            <h3>{`${gameData.player.typeOfOtherService2}`}</h3>
                        </div>
                        <ToggleSwitch checked={checked2} onChange={handleChange2}/>
                        <div className="chart-container-chart">
                            <BarChart dataArray={dataArray2} modifiedData={modifiedDataArray2} checked={checked2}/>
                        </div>
                    </div>
                </div>
                <div className="my-service-trade-container">
                    <div className="chart-container">
                        <div className="chart-container-text">
                            <h3>{`${gameData.player.typeOfService}`}</h3>
                        </div>
                        <ToggleSwitch checked={checked3} onChange={handleChange3}/>
                        <div className="chart-container-chart">
                            <BarChart dataArray={dataArray3} modifiedData={modifiedDataArray3} checked={checked3}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Trade;