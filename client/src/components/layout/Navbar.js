import React, { useEffect }  from 'react';
import { useGlobalContext} from "../../context/context";

import AuthOptions from '../auth/AuthOptions'

const Navbar = () => {
    const { isAlertOpen, closeAlert } = useGlobalContext();

    useEffect(() => {
        const timer = setTimeout(() => {
            closeAlert();
        }, 10000);
        return () => clearTimeout(timer);
    }, [isAlertOpen]);

    return (
        <nav>
            <div className={"nav-center"}>
                <div className='nav-header'>
                    <div>
                        <h2 className={"nav-heading"}>
                            <a href={'/'}>SharedManufacturing</a>
                        </h2>
                    </div>
                    <div>
                        {
                            isAlertOpen ? (
                                <div className="event-alert">
                                    <p>Your order was canceled!</p>
                                </div>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                    <div className='nav-links-container'>
                        <ul>
                            <AuthOptions/>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
};

export default Navbar
