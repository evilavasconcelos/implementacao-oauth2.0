// src/utils/auth.js

// Gera uma string aleatória para o code_verifier e state
// Requisito: Gerar segredo criptograficamente aleatório [cite: 19]
export function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Gera o code_challenge (Hash SHA-256 do verifier)
// Requisito: code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier))) [cite: 19]
export async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    
    return base64UrlEncode(digest);
}

// Função auxiliar para Base64 URL Safe (substitui caracteres não permitidos na URL)
function base64UrlEncode(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    let binary = '';
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Função principal de Login
export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateRandomString(128); // Gera o segredo local
    const challenge = await generateCodeChallenge(verifier); // Cria a "chave pública" dele
    const state = generateRandomString(16); // Proteção contra CSRF [cite: 37]

    // Requisito: Armazenar code_verifier e state no sessionStorage [cite: 20]
    window.sessionStorage.setItem("verifier", verifier);
    window.sessionStorage.setItem("state", state);

    // Monta a URL de autorização do Spotify
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", import.meta.env.VITE_REDIRECT_URI);
    // Escopos: Leitura e Modificação (Manager) [cite: 9]
    params.append("scope", "user-read-playback-state user-modify-playback-state");
    params.append("code_challenge_method", "S256"); // Requisito: Método S256 [cite: 22]
    params.append("code_challenge", challenge);
    params.append("state", state);

    // Redireciona o navegador
    document.location = `${import.meta.env.VITE_AUTH_ENDPOINT}?${params.toString()}`;
}