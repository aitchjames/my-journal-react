import React, { useState, useReducer, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Axios from 'axios';
Axios.defaults.baseURL = process.env.BACKENDURL || "https://my-journal-react.herokuapp.com";

// Components
import Header from "./components/Header";
import HomeGuest from './components/HomeGuest';
import Home from './components/Home';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from "./components/NotFound";
import Search from "./components/Search";
const Chat = React.lazy(() => import("./components/Chat"));
import LoadingDotsIcon from "./components/LoadingDotsIcon";

// Context Providers
import DispatchContext from './DispatchContext';
import StateContext from './StateContext';


function Main() {
    const initialState = {
        loggedIn: Boolean(localStorage.getItem("myjournalToken")),
        flashMessages: [],
        user: {
            token: localStorage.getItem("myjournalToken"),
            username: localStorage.getItem("myjournalUsername"),
            avatar: localStorage.getItem("myjournalAvatar")
        },
        isSearchOpen: false,
        isChatOpen: false,
        unreadChatCount: 0
    }

    function ourReducer(draft, action) {
        switch (action.type) {
            case "login":
                draft.loggedIn = true
                draft.user = action.data
                return
            case "logout":
                draft.loggedIn = false
                return
            case "flashMessage":
                draft.flashMessages.push(action.value)
                return   
            case "openSearch":
                draft.isSearchOpen = true
                return
            case "closeSearch":
                draft.isSearchOpen = false
                return  
            case "toggleChat":
                draft.isChatOpen = !draft.isChatOpen
                return
            case "closeChat":
                draft.isChatOpen = false
                return
            case "incrementChatCount":
                draft.unreadChatCount++
                return
            case "clearUnreadChatCount":
                draft.unreadChatCount = 0
                return
        }
    }
    
    const [state, dispatch] = useImmerReducer(ourReducer, initialState);

    useEffect(() => {
        if (state.loggedIn) {
            localStorage.setItem("myjournalToken", state.user.token);
            localStorage.setItem("myjournalUsername", state.user.username);
            localStorage.setItem("myjournalAvatar", state.user.avatar);
        } else {
            localStorage.removeItem("myjournalToken");
            localStorage.removeItem("myjournalUsername");
            localStorage.removeItem("myjournalAvatar");
        }
    }, [state.loggedIn])

    // Check if token has expired on first render

    useEffect(() => {
        if (state.loggedIn) {
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults() {
                try {
                    const response = await Axios.post('/checkToken', { token: state.user.token }, {cancelToken: ourRequest.token});
                    if (!response.data) {
                        dispatch({type: "logout"})
                        dispatch({type: "flashMessage", value: "Your session has expired. Please log in again"})
                    }
                } catch (error) {
                    console.log("There was a problem or request was cancelled")
                }
            }
            fetchResults()
            // To clean up useEffect with cancel token
            return () => ourRequest.cancel()
        } 
    }, [])

    return(
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>  
                <FlashMessages messages={state.flashMessages} />  
                    <Header />
                    <Suspense fallback={<LoadingDotsIcon />}>
                        <Switch>
                            <Route path="/profile/:username">
                                <Profile />
                            </Route>
                            <Route path="/" exact>
                                {state.loggedIn ? <Home /> : <HomeGuest />}
                            </Route>
                            <Route path="/post/:id" exact>
                                <ViewSinglePost />
                            </Route>
                            <Route path="/post/:id/edit" exact>
                                <EditPost />
                            </Route>
                            <Route path="/create-post">
                                <CreatePost />
                            </Route>
                            <Route path="/about-us">
                                <About />
                            </Route>
                            <Route path="/terms">
                                <Terms />
                            </Route>
                            <Route>
                                <NotFound />
                            </Route>
                        </Switch>
                    </Suspense>
                    <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
                        <Search />
                    </CSSTransition>
                    <Suspense fallback="">
                        {state.loggedIn && 
                        <Chat />
                        }
                    </Suspense>
                    <Footer />        
                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

ReactDOM.render(<Main />, document.querySelector("#app"));