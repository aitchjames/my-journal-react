import React, { useEffect, useState } from "react"
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfileFollowing(props) {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true);
    const [followering, setFollowering] = useState([]);

    useEffect(() => {
        const ourRequest = Axios.CancelToken.source()

        async function fetchFollowering() {
            try {
                const response = await Axios.get(`/profile/${username}/following`, {cancelToken: ourRequest.token});
                setFollowering(response.data);
                setIsLoading(false);
            } catch (error) {
                console.log("There was a problem");
            }
        }   
        fetchFollowering()
        return () => {
            ourRequest.cancel()
        }
    }, [username])

    if (isLoading) return <LoadingDotsIcon />

    return (
        <div className="list-group">
            {followering.map((follower, index) => {
                return(
                    <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
                    </Link>
                )
            })}
        </div>
    )
}

export default ProfileFollowing