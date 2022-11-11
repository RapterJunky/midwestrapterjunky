import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

export default function render(component: React.ReactNode, htmlId?: string): void {
    const container = document.getElementById(htmlId ?? "__next");
    const root = createRoot(container as any);

    root.render(<StrictMode>{component}</StrictMode>);
}