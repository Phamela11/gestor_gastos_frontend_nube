import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col p-6 gap-6">
      <h1 className="text-2xl font-bold text-pink-500">
        Gestor
      </h1>

      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="hover:text-pink-400">
          Dashboard
        </Link>

        <Link to="/transacciones" className="hover:text-pink-400">
          Transacciones
        </Link>

        <Link to="/categorias" className="hover:text-pink-400">
          Categorías
        </Link>

        <Link to="/notas" className="hover:text-pink-400">
          Notas
        </Link>

        <Link to="/presupuestos" className="hover:text-pink-400">
          Presupuestos
        </Link>

        <Link to="/reportes" className="hover:text-pink-400">
          Reportes
        </Link>
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;