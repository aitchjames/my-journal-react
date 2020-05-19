import React, { useEffect, useState, useContext } from "react"
import DispatchContext from '../DispatchContext';
import Axios from 'axios';

function HeaderLoggedOut(props) {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const appDispatch = useContext(DispatchContext);

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await Axios.post("/login", {
                    username, password 
                }            
            )
            if (response.data) {
                localStorage.setItem("myjournalToken", response.data.token);
                localStorage.setItem("myjournalUsername", response.data.username);
                localStorage.setItem("myjournalAvatar", response.data.avatar);
                appDispatch({type: "login"})
            } else {
                console.log("Incorrect username / password")
            }            
        } catch(error) {
            console.log("There was a problem");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
            <div className="row align-items-center">
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={event => setUsername(event.target.value)} name="username" className="form-control form-control-sm input-dark" type="text"
                        placeholder="Username" autoComplete="off" />
                </div>
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={event => setPassword(event.target.value)} name="password" className="form-control form-control-sm input-dark" type="password"
                        placeholder="Password" />
                </div>
                <div className="col-md-auto">
                    <button className="btn btn-success btn-sm">Sign In</button>
                </div>
            </div>
        </form>
    )
}

export default HeaderLoggedOut