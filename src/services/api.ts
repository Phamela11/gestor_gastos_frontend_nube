import { API } from "../config/apiConfig";

export const obtenerMensaje = async () => {
    const response = await fetch(API);
    
    if (!response.ok) {
      throw new Error("Error al conectar con el backend");
    }
  
    return response.json();
  };
  