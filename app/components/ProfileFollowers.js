import React, { useEffect, useState } from "react"
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfileFollowers(props) {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true);
    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        const ourRequest = Axios.CancelToken.source()

        async function fetchFollowers() {
            try {
                const response = await Axios.get(`/profile/${username}/followers`, {cancelToken: ourRequest.token});
                setFollowers(response.data);
                setIsLoading(false);
            } catch (error) {
                console.log("There was a problem");
            }
        }   
        fetchFollowers()
        return () => {
            ourRequest.cancel()
        }
    }, [username])

    if (isLoading) return <LoadingDotsIcon />

    return (
        <div className="list-group">
            {followers.map((follower, index) => {
                return(
                    <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
                    </Link>
                )
            })}
        </div>
    )
}

export default ProfileFollowers