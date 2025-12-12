import { useEffect, useState, useRef } from 'react'; // Adicionado useRef
import { redirectToAuthCodeFlow } from './utils/auth';
import { getToken } from './services/spotify';
import { Dashboard } from './components/Dashboard';

function App() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  
  // Trava para evitar que o React rode o login 2 vezes (Strict Mode)
  const loginAttempted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    // Se tiver código na URL e ainda não tentamos logar
    if (code && state && !loginAttempted.current) {
      loginAttempted.current = true; // Marca que já estamos processando
      processLogin(code, state);
    } else {
      // Recupera token se não estivermos num processo de login
      const sessionToken = window.sessionStorage.getItem("access_token");
      if (sessionToken) setToken(sessionToken);
    }
  }, []);

  async function processLogin(code, returnedState) {
    const storedState = window.sessionStorage.getItem("state");
    const verifier = window.sessionStorage.getItem("verifier");

    // Validação CSRF
    if (!storedState || returnedState !== storedState) {
      setError("Erro Crítico: State inválido ou sessão perdida. Acesse sempre via 127.0.0.1");
      return;
    }

    try {
      const data = await getToken(code, verifier);
      if (data.access_token) {
        window.sessionStorage.setItem("access_token", data.access_token);
        setToken(data.access_token);
        // Limpa a URL para ficar bonita
        window.history.pushState({}, null, "/");
      } else {
        // Só mostra erro se não tivermos sucesso anterior
        setError("Falha ao obter token (Código expirado ou inválido).");
      }
    } catch (err) {
      setError("Erro de conexão.");
    }
  }

  function handleLogin() {
    // Garante que o usuário comece o fluxo pelo IP numérico para evitar erro de State
    if (window.location.hostname === 'localhost') {
        window.location.href = `http://127.0.0.1:5173`;
        return;
    }
    redirectToAuthCodeFlow(import.meta.env.VITE_CLIENT_ID);
  }

function handleLogout() {
    window.sessionStorage.clear();
    setToken(null);
    window.location.reload();
  }

  return (
    <div className="App">
      {/* Mostra erro apenas se NÃO estiver logado, para evitar confusão visual */}
      {!token && error && <div style={{backgroundColor: '#ffcccc', padding: '10px', color: 'red', textAlign:'center'}}>{error}</div>}

      {!token ? (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
          <h1>Login Seguro (OAuth 2.0 + PKCE)</h1>
          <p>Trabalho de Segurança - Cenário Spotify</p>
          <button onClick={handleLogin} style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer' }}>
            Entrar com Spotify
          </button>
        </div>
      ) : (
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;