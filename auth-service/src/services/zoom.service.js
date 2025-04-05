import axios from "axios";

export const updateUserZoomToken = async (userId, accessToken, refreshToken, expiresIn) => {
    try {
        const response = await axios.post("http://localhost:3003/users/update-zoom-token", {
            userId,
            zoomAccessToken: accessToken,
            zoomRefreshToken: refreshToken,
            zoomTokenExpiry: Date.now() + expiresIn * 1000,
        });

        return response.status === 200;
    } catch (error) {
        console.error("Failed to update Zoom token in User Service:", error);
        return false;
    }
};
