import React, { useEffect, useContext } from "react"
import DispatchContext from '../DispatchContext';
import { useImmer } from 'use-immer';
import Axios from "axios";
import { Link } from "react-router-dom";

function Search() {
    const appDispatch = useContext(DispatchContext);
    const [state, setState] = useImmer({
        searchTerm: "",
        results: [],
        show: "neither",
        requestCount: 0
    })   

    useEffect(() => {
        // To add event listener for escape key, once search component mounted
        document.addEventListener("keyup", searchKeyPressHandler);
        // To remove event listener for escape key, once search component unmounted
        return () => document.removeEventListener("keyup", searchKeyPressHandler);
    }, [])

    useEffect(() => {
        if (state.searchTerm.trim()) {
            setState(draft => {
                draft.show = 'loading'
            })

            const delay = setTimeout(() => {
                // To increment requestCount by 1 to send off axios req in another useEffect
                setState(draft => {
                    draft.requestCount++
                })
            }, 750);
    
            return () => clearTimeout(delay);
        } else {
            setState(draft => {
                draft.show = 'neither'
            })
        }
    }, [state.searchTerm])

    useEffect(() => {
        if (state.requestCount) {
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults() {
                try {
                    const response = await Axios.post('/search', { searchTerm: state.searchTerm }, {cancelToken: ourRequest.token});
                    setState(draft => {
                        draft.results = response.data
                        draft.show = 'results'
                    })
                } catch (error) {
                    console.log("There was a problem or request was cancelled")
                }
            }
            fetchResults()
            // To clean up useEffect with cancel token
            return () => ourRequest.cancel()
        } 
    }, [state.requestCount])

    function searchKeyPressHandler(event) {
        if (event.keyCode == 27) {
            appDispatch({type: "closeSearch"})
        }
    }

    function handleInput(event) {
        const value = event.target.value;
        setState(draft => {
            draft.searchTerm = value
        })
    }

    return (
        <div className="search-overlay">
            <div className="search-overlay-top shadow-sm">
                <div className="container container--narrow">
                <label htmlFor="live-search-field" className="search-overlay-icon">
                    <i className="fas fa-search"></i>
                </label>
                <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
                <span onClick={() => appDispatch({type: "closeSearch"})} className="close-live-search">
                    <i className="fas fa-times-circle"></i>
                </span>
                </div>
            </div>
  
            <div className="search-overlay-bottom">
            <div className="container container--narrow py-3">
                <div className={"circle-loader " + (state.show == "loading" ? 'circle-loader--visible' : '')}></div>
                <div className={"live-search-results " + (state.show == "results" ? 'live-search-results--visible' : '')}>
                    {Boolean(state.results.length) && (
                        <div className="list-group shadow-sm">
                            <div className="list-group-item active"><strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)</div>
                            {state.results.map(post => {
                                const date = new Date(post.createdDate);
                                const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

                                return(
                                    <Link onClick={() => appDispatch({type: "closeSearch"})} key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
                                        <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>
                                        <span className="text-muted small"> by {post.author.username} on {dateFormatted} </span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                    {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, there were no results</p>}
                </div>
            </div>
            </div>
        </div>
    )
}

export default Search