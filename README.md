# Gestor de Gastos - Frontend

Proyecto frontend básico para un Gestor de Gastos construido con React, TypeScript y Vite.

## Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **React Router DOM** - Enrutamiento

## Estructura del Proyecto

```
src/
├── assets/
│   └── images/       # Imágenes del proyecto
├── components/       # Componentes reutilizables
├── pages/           # Páginas de la aplicación
│   └── bienvenida.tsx
├── services/         # Servicios (vacía por ahora)
├── App.tsx          # Componente principal con rutas
├── main.tsx         # Punto de entrada
└── index.css        # Estilos globales con Tailwind
```

## Instalación

1. Instala las dependencias:
```bash
npm install
```

## Desarrollo

Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

Para crear una build de producción:
```bash
npm run build
```

## Próximos Pasos

Esta es una base limpia y mínima. Puedes comenzar a agregar:
- Más páginas en `src/pages/`
- Componentes reutilizables en `src/components/`
- Servicios para conectar con el backend en `src/services/`

