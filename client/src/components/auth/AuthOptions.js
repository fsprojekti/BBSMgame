import React from 'react';
import { useHistory } from 'react-router-dom';
import {useGlobalContext} from "../../context/context";

export default function AuthOptions () {
    const {gameData, clearGameData} = useGlobalContext();
    const history = useHistory();

    const login = () => history.push("/login");
    const logout = () => {
        clearGameData();
        localStorage.setItem("auth-token", "");
        localStorage.setItem("playerId", "");
        window.location.reload(false);
    };

    return (
        <nav>
            {
                gameData.player ? (
                    <button className="nav-btn" onClick={logout}>Log out</button>
                ) : (
                    <>
                        <button className="nav-btn" onClick={login}>Log in</button>
                    </>
                )
            }
        </nav>
    )
};
