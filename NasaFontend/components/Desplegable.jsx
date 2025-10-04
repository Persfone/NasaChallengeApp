import { useState } from "react";
import { Settings } from "lucide-react"; 

const MenuDerecho = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Valores de ancho para un look moderno
  const closedWidth = "w-16"; 
  const openWidth = "w-96"; 
  
  // Efecto Glassmorphism con OPACIDAD MUY BAJA
  const glassEffect = "bg-white/15 backdrop-blur-sm border border-white/40";
  const shadowStyle = "shadow-2xl shadow-gray-700/50"; 
  // Color ACENTO CELESTE (Cyan)
  const accentColor = "bg-[#012e46] hover:text-[#012e46]"; 
  const textColor = "text-[#012e46]"; 

  return (
    <div
      // Contenedor principal
      className={`fixed top-0 right-0 h-full z-[1000] 
                  transition-all duration-700 ease-in-out
                  ${isOpen ? openWidth : closedWidth}
                  ${shadowStyle}
                  ${glassEffect}
                  rounded-l-2xl`}
    >
      {/* Botón Flotante (Toggle) */}
      <button
        className={`absolute top-4 right-4 z-[1001]
                    w-10 h-10 rounded-full 
                    flex items-center justify-center 
                    text-white cursor-pointer 
                    transition-all duration-300 ease-in-out
                    ${accentColor}
                    ${isOpen ? "rotate-90" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Contenido del menú */}
      <div
        className={`h-full pt-16 p-8 
                    ${textColor} 
                    overflow-y-auto 
                    transition-opacity duration-300 ease-in
                    ${isOpen ? "opacity-100 delay-300" : "opacity-0 pointer-events-none"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default MenuDerecho;