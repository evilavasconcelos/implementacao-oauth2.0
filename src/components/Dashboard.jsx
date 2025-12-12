// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { getPlaybackState, skipTrack, previousTrack, pauseTrack, playTrack } from '../services/spotify';

export function Dashboard({ token, onLogout }) {
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false); // Estado para controlar Play/Pause

    useEffect(() => {
        handleRefresh();
        // Atualiza a cada 5 segundos automaticamente
        const interval = setInterval(handleRefresh, 5000);
        return () => clearInterval(interval);
    }, []);

    async function handleRefresh() {
        // Não ativa loading no refresh automático para não piscar a tela
        try {
            const data = await getPlaybackState(token);
            setTrack(data);
            if (data) {
                setIsPlaying(data.is_playing);
            }
        } catch (error) {
            console.error("Erro ao buscar música:", error);
        }
    }

    // Função genérica para executar comandos e atualizar a tela
    async function handleAction(actionFunction) {
        await actionFunction(token);
        setTimeout(handleRefresh, 500); // Espera um pouco para a API atualizar
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h1>Dashboard do Gerente (Manager)</h1>
            <p style={{ fontSize: '12px', color: '#666' }}>Token ativo</p>

            <div style={{ 
                border: '1px solid #ccc', 
                padding: '30px', 
                borderRadius: '12px', 
                maxWidth: '350px', 
                margin: '20px auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                {track ? (
                    <>
                        <img 
                            src={track.item.album.images[0].url} 
                            alt="Capa" 
                            width={250} 
                            style={{borderRadius: '8px', marginBottom: '15px'}} 
                        />
                        <h2 style={{margin: '10px 0 5px', fontSize: '18px'}}>{track.item.name}</h2>
                        <p style={{margin: '0', color: '#555'}}>{track.item.artists[0].name}</p>
                        
                        {/* Controles do Player */}
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            
                            {/* Botão VOLTAR */}
                            <button 
                                onClick={() => handleAction(previousTrack)} 
                                style={btnStyle}
                                title="Voltar"
                            >
                                ⏮
                            </button>

                            {/* Botão PLAY / PAUSE (Alterna dependendo do estado) */}
                            {isPlaying ? (
                                <button 
                                    onClick={() => handleAction(pauseTrack)} 
                                    style={{...btnStyle, fontSize: '24px'}}
                                    title="Pausar"
                                >
                                    ⏸
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleAction(playTrack)} 
                                    style={{...btnStyle, fontSize: '24px'}}
                                    title="Dar Play"
                                >
                                    ▶
                                </button>
                            )}

                            {/* Botão PULAR */}
                            <button 
                                onClick={() => handleAction(skipTrack)} 
                                style={btnStyle}
                                title="Próxima"
                            >
                                ⏭
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <p>Nenhuma música detectada.</p>
                        <p style={{fontSize: '14px', color: '#888'}}>Abra o Spotify no seu celular ou PC e dê play.</p>
                        <button onClick={handleRefresh} style={{marginTop: '10px'}}>Verificar de novo</button>
                    </div>
                )}
            </div>

            <button onClick={onLogout} style={{ marginTop: '30px', backgroundColor: '#e91e63', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                Sair (Logout Seguro)
            </button>
        </div>
    );
}

// Estilo simples para os botões do player
const btnStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
};