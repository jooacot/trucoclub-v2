import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Registro from "./components/Register";
import Juego from "./components/Game"; // <-- Importamos el juego limpio

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* URL base (http://localhost:5173/) -> Iniciar Sesión */}
        <Route path="/" element={<Login />} />

        {/* URL Registro (http://localhost:5173/registro) -> Crear Cuenta */}
        <Route path="/registro" element={<Registro />} />

        {/* URL Juego (http://localhost:5173/juego) -> El tablero del Truco */}
        <Route path="/juego" element={<Juego />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
