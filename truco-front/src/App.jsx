import { useState, useEffect } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

function App() {
  const [mesaId, setMesaId] = useState(null);
  const [inputMesaId, setInputMesaId] = useState("");
  const [partida, setPartida] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [jugadorAsignado, setJugadorAsignado] = useState(null); // Nuevo estado: jugador de la pestaña

  // 1. Conexión al WebSocket y obtención de la partida
  useEffect(() => {
    if (!mesaId) return;

    const traerEstadoInicial = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/truco/estado/${mesaId}`);
        if (res.ok) {
          const data = await res.json();
          setPartida(data);
        }
      } catch (err) {
        console.error("Error al traer estado inicial:", err);
      }
    };

    traerEstadoInicial();

    const socket = new SockJS('http://localhost:8080/ws-truco');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('¡Conectado a los WebSockets del Truco!');
        client.subscribe(`/topic/partida/${mesaId}`, (message) => {
          const partidaActualizada = JSON.parse(message.body);
          setPartida(partidaActualizada);
        });
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [mesaId]);

  // 2. CREAR MESA
  const crearMesa = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/truco/nueva?j1=Nacho&j2=IA&puntos=30', { method: 'POST' });
      const id = await res.text();
      setMesaId(id);
      setJugadorAsignado("Nacho"); // Al crear la mesa, el dueño es Nacho por defecto
    } catch (err) {
      alert("Error: ¿Está el server de Java prendido?");
    }
  };

  // 3. UNIRSE A UNA MESA
  const unirseMesa = () => {
    if (inputMesaId.trim() !== "") {
      setMesaId(inputMesaId);
    } else {
      alert("Por favor, ingresá un ID de mesa válido.");
    }
  };

  // 4. TIRAR CARTA (Valida que sea tu turno y tus cartas)
  const tirarCarta = async (nombreJugador, indice) => {
    if (nombreJugador !== jugadorAsignado) {
      alert(`¡No podés jugar las cartas de ${nombreJugador}! Estás jugando como ${jugadorAsignado}.`);
      return;
    }

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/jugar`,
        body: JSON.stringify({
          mesaId: mesaId,
          jugador: nombreJugador,
          cartaIndice: indice
        })
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
      <h1 style={{ color: '#4CAF50' }}>Truco Club - MODO WEBSOCKETS 🃏</h1>
      
      {!mesaId ? (
        <div>
          <button onClick={crearMesa} style={btnStyle}>Crear Nueva Mesa</button>
          
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #444', display: 'inline-block', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 15px 0' }}>¿Ya tenés el ID de una mesa? Ingresalo acá:</p>
            <input 
              type="text" 
              placeholder="Ej: mesa-123" 
              value={inputMesaId}
              onChange={(e) => setInputMesaId(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #666', marginRight: '10px', backgroundColor: '#333', color: 'white' }}
            />
            <button onClick={unirseMesa} style={{...btnStyle, backgroundColor: '#2196F3', padding: '10px 20px'}}>Unirse</button>
          </div>
        </div>
      ) : (
        <div>
          <p>Mesa ID: <span style={{ color: '#ffeb3b' }}>{mesaId}</span></p>

          {/* Selector de jugador para la pestaña actual */}
          {partida && !jugadorAsignado && (
            <div style={{ margin: '30px auto', padding: '20px', backgroundColor: '#2b2b2b', borderRadius: '8px', maxWidth: '400px' }}>
              <h3 style={{ marginTop: 0 }}>¿Quién sos en esta pestaña?</h3>
              <button 
                onClick={() => setJugadorAsignado(partida.jugador1.nombre)} 
                style={{...btnStyle, backgroundColor: '#4CAF50', margin: '5px'}}>
                {partida.jugador1.nombre}
              </button>
              <button 
                onClick={() => setJugadorAsignado(partida.jugador2.nombre)} 
                style={{...btnStyle, backgroundColor: '#ff5252', margin: '5px'}}>
                {partida.jugador2.nombre}
              </button>
            </div>
          )}

          {partida && jugadorAsignado && (
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                Estás jugando como: <span style={{ color: '#ffeb3b' }}>{jugadorAsignado}</span>
              </p>

              {/* MANO DEL OPONENTE (Oculta) */}
              <div style={{ marginBottom: '40px', padding: '10px', border: '1px dashed #666' }}>
                <h3>Mano del Oponente</h3>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  {getManoOponente(partida, jugadorAsignado).map((carta, index) => (
                    <div key={index} style={{...cardStyle, backgroundColor: '#555', border: '2px solid #888', color: 'white', fontSize: '24px'}}>
                      <div>🃏</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CENTRO DE LA MESA */}
              <div style={{ margin: '30px auto', padding: '20px', backgroundColor: '#2d5a27', borderRadius: '50%', maxWidth: '500px' }}>
                <h4 style={{ color: 'white' }}>Mesa (Cartas Jugadas)</h4>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', minHeight: '100px', alignItems: 'center' }}>
                  {partida.cartasEnMesa && partida.cartasEnMesa.map((c, i) => (
                    <div key={i} style={{...cardStyle, width: '70px', height: '100px', fontSize: '14px', color: 'black'}}>
                      {c.numero} de {c.palo}
                    </div>
                  ))}
                </div>
              </div>

              {/* MANO DEL JUGADOR ACTUAL */}
              <div style={{ padding: '10px', border: '1px dashed #666' }}>
                <h3>Tu Mano</h3>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  {getManoJugadorActual(partida, jugadorAsignado).map((carta, index) => (
                    <div key={index} 
                         onClick={() => tirarCarta(jugadorAsignado, index)} 
                         style={{...cardStyle, border: '2px solid #4CAF50', cursor: 'pointer'}}>
                      <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{carta.numero}</span>
                      <span>{carta.palo}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 📌 Funciones auxiliares para separar la mano del jugador actual y la del oponente
function getManoJugadorActual(partida, jugadorAsignado) {
  if (partida.jugador1.nombre === jugadorAsignado) {
    return partida.jugador1.mano;
  }
  return partida.jugador2.mano;
}

function getManoOponente(partida, jugadorAsignado) {
  if (partida.jugador1.nombre === jugadorAsignado) {
    return partida.jugador2.mano;
  }
  return partida.jugador1.mano;
}

const btnStyle = { backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cardStyle = { backgroundColor: 'white', color: '#2c3e50', width: '100px', height: '140px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' };

export default App;