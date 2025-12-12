// src/services/spotify.js

const BASE_URL = "https://api.spotify.com/v1"; // URL oficial da API

const getHeaders = (token) => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
});

export async function getToken(code, verifier) {
    const params = new URLSearchParams();
    params.append("client_id", import.meta.env.VITE_CLIENT_ID);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", import.meta.env.VITE_REDIRECT_URI);
    params.append("code_verifier", verifier);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    return response.json();
}

export async function getPlaybackState(token) {
    const response = await fetch(`${BASE_URL}/me/player/currently-playing`, {
        headers: getHeaders(token)
    });
    if (response.status === 204) return null;
    return response.json();
}

export async function skipTrack(token) {
    await fetch(`${BASE_URL}/me/player/next`, {
        method: "POST",
        headers: getHeaders(token)
    });
}

export async function previousTrack(token) {
    await fetch(`${BASE_URL}/me/player/previous`, {
        method: "POST",
        headers: getHeaders(token)
    });
}

export async function pauseTrack(token) {
    await fetch(`${BASE_URL}/me/player/pause`, {
        method: "PUT",
        headers: getHeaders(token)
    });
}

export async function playTrack(token) {
    await fetch(`${BASE_URL}/me/player/play`, {
        method: "PUT",
        headers: getHeaders(token)
    });
}