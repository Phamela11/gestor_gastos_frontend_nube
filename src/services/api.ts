export const obtenerMensaje = async () => {
    const response = await fetch("http://localhost:3000");
    
    if (!response.ok) {
      throw new Error("Error al conectar con el backend");
    }
  
    return response.json();
  };
  