import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../config/apiConfig";

export const useLogin = () => {
  const navigate = useNavigate();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos");
      return;
    }

    try {
      const datosEnviados = {
        correo: correo.trim(),
        contrasena: contrasena.trim(),
      };

      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnviados),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Error en el servidor",
        }));
        alert(errorData.message || "Credenciales incorrectas");
        return;
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        navigate("/dashboard");
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Por favor, verifica que el servidor esté corriendo.");
    }
  };

  const handleRegister = async () => {
    if (!nombre || !correo || !contrasena) {
      setMensajeError("Por favor, completa todos los campos");
      setMostrarModalError(true);
      return;
    }

    // Validar que el correo contenga @
    if (!correo.includes('@')) {
      setMensajeError("El correo debe contener @");
      setMostrarModalError(true);
      return;
    }

    try {
      const datosEnviados = {
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasena: contrasena.trim(),
      };

      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnviados),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Error en el servidor",
        }));
        setMensajeError(errorData.message || "Error al registrar");
        setMostrarModalError(true);
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Mostrar modal de éxito sin hacer login automático
        setMostrarModalExito(true);
        // Limpiar los campos
        setNombre("");
        setCorreo("");
        setContrasena("");
      } else {
        setMensajeError(data.message || "Error al registrar");
        setMostrarModalError(true);
      }
    } catch (error) {
      console.error("Error de registro:", error);
      setMensajeError("Error de conexión. Por favor, verifica que el servidor esté corriendo.");
      setMostrarModalError(true);
    }
  };

  const cerrarModalYVolverALogin = () => {
    setMostrarModalExito(false);
    setModoRegistro(false);
  };

  const cerrarModalError = () => {
    setMostrarModalError(false);
  };

  const toggleModo = () => {
    setModoRegistro((prev) => !prev);
  };

  return {
    modoRegistro,
    nombre,
    correo,
    contrasena,
    setModoRegistro,
    setNombre,
    setCorreo,
    setContrasena,
    toggleModo,
    handleLogin,
    handleRegister,
    mostrarModalExito,
    cerrarModalYVolverALogin,
    mostrarModalError,
    mensajeError,
    cerrarModalError,
  };
};
