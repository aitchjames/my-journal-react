import React, { useEffect, useState, useContext } from "react"
import { withRouter } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';
import Page from './Page';
import Axios from 'axios';

function CreatePost(props) {
    const [title, setTitle] = useState();
    const [body, setBody] = useState();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await Axios.post("/create-post", {
                title, body, token: appState.user.token
            })
            // Redirect to new post url
            appDispatch({type: "flashMessage", value: "Successfully added new journal"})
            props.history.push(`/post/${response.data}`)
            console.log("New post was created")
        } catch(error) {
            console.log("There was a problem")
        }
    }

    return (
        <Page title="Create New Post">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                <label htmlFor="post-title" className="text-muted mb-1">
                    <small>Title</small>
                </label>
                <input onChange={event => setTitle(event.target.value)} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
                </div>

                <div className="form-group">
                <label htmlFor="post-body" className="text-muted mb-1 d-block">
                    <small>Body Content</small>
                </label>
                <textarea onChange={event => setBody(event.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
                </div>

                <button className="btn btn-primary">Save New Post</button>
            </form>
        </Page>
    )
}

export default withRouter(CreatePost);