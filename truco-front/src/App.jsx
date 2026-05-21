import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function App() {
  const [mesaId, setMesaId] = useState(null);
  const [inputMesaId, setInputMesaId] = useState("");
  const [partida, setPartida] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [jugadorAsignado, setJugadorAsignado] = useState(null);

  useEffect(() => {
    if (!mesaId) return;

    const traerEstadoInicial = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/truco/estado/${mesaId}`,
        );
        if (res.ok) {
          const data = await res.json();
          setPartida(data);
        }
      } catch (err) {
        console.error("Error al traer estado inicial:", err);
      }
    };

    traerEstadoInicial();

    const socket = new SockJS("http://localhost:8080/ws-truco");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("¡Conectado a los WebSockets del Truco!");
        client.subscribe(`/topic/partida/${mesaId}`, (message) => {
          const partidaActualizada = JSON.parse(message.body);
          setPartida(partidaActualizada);
        });
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [mesaId]);

  const crearMesa = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/truco/nueva?j1=Nacho&j2=IA&puntos=30",
        { method: "POST" },
      );
      const id = await res.text();
      setMesaId(id);
      setJugadorAsignado("Nacho");
    } catch (err) {
      alert("Error: ¿Está el server de Java prendido?");
    }
  };

  const unirseMesa = () => {
    if (inputMesaId.trim() !== "") {
      setMesaId(inputMesaId);
    } else {
      alert("Por favor, ingresá un ID de mesa válido.");
    }
  };

  const tirarCarta = async (nombreJugador, indice) => {
    if (nombreJugador !== jugadorAsignado) {
      alert(
        `¡No podés jugar las cartas de ${nombreJugador}! Estás jugando como ${jugadorAsignado}.`,
      );
      return;
    }

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/jugar`,
        body: JSON.stringify({
          mesaId: mesaId,
          jugador: nombreJugador,
          cartaIndice: indice,
        }),
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8 text-center font-sans">
      <h1 className="text-4xl font-black text-green-500 mb-8 tracking-wider">
        Truco Club - MESA ONLINE 🃏
      </h1>

      {!mesaId ? (
        <div className="max-w-md mx-auto space-y-8">
          <button
            onClick={crearMesa}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors text-lg"
          >
            Crear Nueva Mesa
          </button>

          <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-xl">
            <p className="mb-4 text-neutral-300 font-medium">
              ¿Ya tenés el ID de una mesa?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: mesa-123"
                value={inputMesaId}
                onChange={(e) => setInputMesaId(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={unirseMesa}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Unirse
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="bg-neutral-800 px-6 py-2 rounded-full mb-6 border border-neutral-700">
            Mesa ID:{" "}
            <span className="text-yellow-400 font-mono font-bold select-all">
              {mesaId}
            </span>
          </div>

          {/* Selector de jugador para la pestaña actual */}
          {partida && !jugadorAsignado && (
            <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 shadow-2xl max-w-sm w-full my-10">
              <h3 className="text-xl font-bold mb-6">
                ¿Quién sos en esta pestaña?
              </h3>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setJugadorAsignado(partida.jugador1.nombre)}
                  className="bg-green-600 hover:bg-green-500 font-bold py-3 rounded-lg transition-colors"
                >
                  {partida.jugador1.nombre}
                </button>
                <button
                  onClick={() => setJugadorAsignado(partida.jugador2.nombre)}
                  className="bg-red-600 hover:bg-red-500 font-bold py-3 rounded-lg transition-colors"
                >
                  {partida.jugador2.nombre}
                </button>
              </div>
            </div>
          )}

          {partida && jugadorAsignado && (
            <div className="w-full flex flex-col items-center">
              <div className="mb-8 px-4 py-1 bg-neutral-800 rounded-full border border-neutral-700 text-sm text-neutral-400">
                Jugando como:{" "}
                <span className="text-yellow-400 font-bold">
                  {jugadorAsignado}
                </span>
              </div>

              {/* MANO DEL OPONENTE (Oculta) */}
              <div className="w-full mb-8">
                <div className="flex justify-center gap-4">
                  {getManoOponente(partida, jugadorAsignado).map(
                    (carta, index) => (
                      <div
                        key={index}
                        className="w-20 h-28 bg-neutral-700 border-2 border-neutral-600 rounded-xl flex items-center justify-center shadow-md"
                      >
                        <span className="text-3xl opacity-50">🃏</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* CENTRO DE LA MESA (El paño verde) */}
              <div className="w-full max-w-2xl h-64 bg-green-800 border-8 border-green-950 rounded-full flex flex-col items-center justify-center shadow-2xl mb-8 relative">
                <h4 className="absolute top-4 text-green-950 font-black opacity-30 text-xl tracking-widest uppercase">
                  Mesa
                </h4>
                <div className="flex gap-6 items-center justify-center">
                  {partida.cartasEnMesa &&
                    partida.cartasEnMesa.map((c, i) => (
                      <div
                        key={i}
                        className="w-20 h-28 bg-white text-slate-800 rounded-lg flex flex-col items-center justify-center shadow-xl border border-gray-300 font-bold text-lg rotate-[-5deg] first:rotate-[5deg]"
                      >
                        <span>{c.numero}</span>
                        <span className="text-sm">{c.palo}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* MANO DEL JUGADOR ACTUAL */}
              <div className="w-full mt-4">
                <h3 className="text-neutral-400 font-medium mb-4 uppercase tracking-widest text-sm">
                  Tu Mano
                </h3>
                <div className="flex justify-center gap-4">
                  {getManoJugadorActual(partida, jugadorAsignado).map(
                    (carta, index) => (
                      <div
                        key={index}
                        onClick={() => tirarCarta(jugadorAsignado, index)}
                        className="w-24 h-36 bg-white text-slate-900 border-2 border-transparent hover:border-green-500 rounded-xl flex flex-col items-center justify-center shadow-lg cursor-pointer hover:-translate-y-4 transition-all duration-200"
                      >
                        <span className="text-3xl font-black">
                          {carta.numero}
                        </span>
                        <span className="text-md font-bold uppercase">
                          {carta.palo}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 📌 Funciones auxiliares para separar la mano
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

export default App;
