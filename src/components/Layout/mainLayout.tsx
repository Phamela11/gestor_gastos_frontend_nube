import { ReactNode } from "react";
import Sidebar from "../Sidebar/sidebar";
import Header from "../Header/header";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-col w-full h-screen">
        <Header title={title} />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

