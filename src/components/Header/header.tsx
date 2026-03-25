import { useEffect, useState } from "react";

interface HeaderProps {
  title?: string;
}

interface Usuario {
  nombre?: string;
  id_usuario?: number;
  correo?: string;
}

const Header = ({ title = "Dashboard" }: HeaderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
      } catch (error) {
        console.error("Error parsing usuario from localStorage:", error);
      }
    }
  }, []);

  return (
    <div className="w-full h-16 bg-black border-b border-gray-800 flex items-center justify-between px-8 text-white">
      <div className="text-lg font-semibold">
        {title}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-300">
          {usuario?.nombre || "Usuario"}
        </span>
      </div>
    </div>
  );
};

export default Header;