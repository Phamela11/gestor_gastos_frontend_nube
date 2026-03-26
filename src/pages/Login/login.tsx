import login2 from "../../assets/images/login2.jpg";
import { useLogin } from "./useLogin";

const Login = () => {
  const {
    modoRegistro,
    nombre,
    correo,
    contrasena,
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
  } = useLogin();

  return (
    <div className="h-screen flex bg-black">
      {/* Modal de Registro Exitoso */}
      {mostrarModalExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-12 rounded-2xl w-[400px] text-center text-white">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-300 mb-8">
              Tu cuenta ha sido creada correctamente. Por favor, inicia sesión con tus credenciales.
            </p>
            <button
              onClick={cerrarModalYVolverALogin}
              className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-500 transition-colors font-semibold"
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        </div>
      )}

      {/* Modal de Error */}
      {mostrarModalError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-12 rounded-2xl w-[400px] text-center text-white">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Error</h2>
            <p className="text-gray-300 mb-8">
              {mensajeError}
            </p>
            <button
              onClick={cerrarModalError}
              className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-500 transition-colors font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Sección izquierda - Login / Registro */}
      <div className="w-[45%] flex items-center justify-center p-8">
        <div className="flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 rounded-2xl w-[500px] gap-3 text-white">
          <div className="text-2xl font-bold text-center mb-6">
            {modoRegistro ? "Crear cuenta" : "Iniciar sesión"}
          </div>

          {modoRegistro && (
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full mb-6 p-2 border-b border-pink-400 bg-transparent outline-none focus:border-pink-700 text-white placeholder-gray-300 rounded-lg"
            />
          )}

          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full mb-6 p-2 border-b border-pink-400 bg-transparent outline-none focus:border-pink-700 text-white placeholder-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="w-full mb-6 p-2 border-b border-pink-400 bg-transparent outline-none focus:border-pink-700 text-white placeholder-gray-300 rounded-lg"
          />

          <button
            onClick={modoRegistro ? handleRegister : handleLogin}
            className="w-full bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-400"
          >
            {modoRegistro ? "Registrarse" : "Entrar"}
          </button>

          <button
            onClick={toggleModo}
            className="mt-3 text-sm text-pink-300 hover:text-pink-100"
          >
            {modoRegistro
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>

        {/* Sección derecha */}
        <div className="w-[55%] h-screen relative overflow-hidden">
          <img 
            src={login2} 
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
            loading="eager"
          />
          <div className="relative z-10 w-full h-full flex flex-col items-end justify-end p-12">
            <div className="w-full h-full flex flex-col items-end justify-end">
                <div className="flex flex-col items-end mb-auto mt-[40%]">
                    <div className="text-7xl font-bold text-slate-200 mb-4 text-right">¡Hola, Bienvenido!</div>
                    <div className="text-2xl text-slate-300 text-right">
                        Inicia sesión para continuar
                    </div>
                </div>
                <div className="w-full text-lg text-slate-200 text-right">
                    Una herramienta diseñada para ayudarte a tomar el control de tus finanzas, 
                    registrar tus ingresos y egresos, analizar tus hábitos de consumo.
                </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Login;