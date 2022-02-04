import React, { useState } from 'react';
import Axios from 'axios';
import { useHistory } from 'react-router-dom';
import loginImg from '../../assets/login.svg';

export default function Login () {
    const [playerName, setPlayerName] = useState();
    const [password, setPassword] = useState();

    const [showAlert, setShowAlert] = useState(false);

    const history = useHistory();

    const submit = async (e) => {
        try {
            e.preventDefault();
            const loginPlayer = { playerName, password };
            const loginRes =  await Axios.post("/player/login", loginPlayer);
            localStorage.setItem("auth-token", loginRes.data.token);
            localStorage.setItem("playerId", loginRes.data.id);
            history.push("/");
            history.go(0);
        } catch(err) {
            if (err.response !== undefined && err.response.data.message === "Auth failed") {
                setShowAlert(true);
            }
        }
    };

    const handleKeypress = async e => {
        try {
            if (e.key === 'Enter') {
                submit(e);
            }
        } catch(err) {
            console.log(err);
        }
    };

    return (
        <div className="login-App">
            <div className="login">
                <div className="login-container">
                    <div className={"login-base-container"}>
                        <h3>Login</h3>
                        <div className={"login-content"}>
                            <div className={"login-image"}>
                                <img src={loginImg} alt={"login"}/>
                            </div>
                            <div className={"login-form"}>
                                <div className={"login-form-group"}>
                                    <label htmlFor={"playerName"}>Player name</label>
                                    <input type={"text"} name={"playerName"} placeholder={"Enter name"} onChange={e => setPlayerName(e.target.value)} onKeyPress={e => handleKeypress(e)}/>
                                </div>
                                <div className={"login-form-group"}>
                                    <label htmlFor={"password"}>Password</label>
                                    <input type={"password"} name={"password"} placeholder={"Enter password"} onChange={e => setPassword(e.target.value)} onKeyPress={e => handleKeypress(e)}/>
                                </div>
                            </div>
                        </div>
                        <div className={`${showAlert? 'login-alert show-alert' : 'login-alert'}`}>
                            The name or password is incorrect!
                        </div>
                        <div className="login-footer">
                            <button type="button" className="login-btn" onClick={submit}>
                                Log in
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
