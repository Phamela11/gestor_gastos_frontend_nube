interface HeaderProps {
  title?: string;
}

const Header = ({ title = "Dashboard" }: HeaderProps) => {
  return (
    <div className="w-full h-16 bg-black border-b border-gray-800 flex items-center justify-between px-8 text-white">
      <div className="text-lg font-semibold">
        {title}
      </div>

      <div>
        Usuario
      </div>
    </div>
  );
};

export default Header;