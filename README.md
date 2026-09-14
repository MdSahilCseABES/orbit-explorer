# ORBIT

A responsive, interactive solar-system explorer built with Three.js and Vite. All planet textures are generated locally.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Drag to orbit, scroll or use the buttons to zoom, and select a planet to explore. Use **Get a closer look** to follow a planet, **↺** to reset, and the playback controls to pause or change time speed.

## Production

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static host. A WebGL-capable browser is required for the 3D scene. Sizes, distances, and orbital speeds are artistically scaled.
