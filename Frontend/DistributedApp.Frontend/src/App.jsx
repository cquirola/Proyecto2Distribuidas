import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner"; // (Opcional) Si luego ponemos notificaciones

function App() {
  return (
    <BrowserRouter>
      {/* AppRoutes maneja la lógica de qué pantalla mostrar */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;