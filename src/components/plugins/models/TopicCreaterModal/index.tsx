import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import "../../../../styles/override.css";
import Editor from "./editor";

const TopicCreaterModal: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  return (
    <Canvas ctx={ctx}>
      <div className="[& > div]:h-full flex h-full w-full flex-col">
        <section
          className="relative flex flex-shrink justify-between border-b"
          data-id="toolbar-1"
        >
          <div className="flex w-full items-center justify-between px-9 py-3">
            <h1
              style={{
                fontSize: "var(--font-size-xl)",
                fontFamily:
                  "colfax-web,Roboto,Helvetica Neue,Helvetica,Roboto,Arial,sans-serif",
              }}
              className="mr-4 font-bold leading-4"
            >
              Topic Editor
            </h1>
          </div>
          <button
            className="flex w-16 min-w-[49px] items-center justify-center rounded-tr-md border-l hover:bg-[var(--light-bg-color)]"
            onClick={() => ctx.resolve(null)}
          >
            <svg
              className="text-xl"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              width="1em"
              height="1em"
            >
              <path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path>
            </svg>
          </button>
        </section>
        <main className="h-full flex-1">
          <Editor />
        </main>
      </div>
    </Canvas>
  );
};

export default TopicCreaterModal;
