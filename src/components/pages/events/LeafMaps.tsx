"use client";
import Script from "next/script";

declare const L: {
  map: (
    el: string,
    opt?: { center?: [number, number]; zoom?: number },
  ) => { setView: (view: [number, number], zoom: number) => void };
  tileLayer: (
    url: string,
    opt?: { maxZoom?: number; attribution?: string },
  ) => { addTo: (map: object) => void };
  marker: (lat: [number, number]) => { addTo: (map: object) => void };
};

const LeafMaps: React.FC<{
  location: { latitude: number; longitude: number };
}> = ({ location }) => {
  return (
    <>
      <div id="map" className="h-80"></div>
      <Script
        crossOrigin=""
        strategy="lazyOnload"
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        onReady={() => {
          const leaflet = document.head.querySelector('[id="leaflet"]');

          if (!leaflet) {
            const style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("crossOrigin", "");
            style.setAttribute("id", "leaflet");
            style.setAttribute(
              "href",
              "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
            );
            style.setAttribute(
              "integrity",
              "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
            );
            document.head.appendChild(style);
          }

          const cord: [number, number] = [
            location.latitude,
            location.longitude,
          ];
          const map = L.map("map", {
            center: cord,
            zoom: 15,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }).addTo(map);
          L.marker(cord).addTo(map);
        }}
      ></Script>
    </>
  );
};

export default LeafMaps;
