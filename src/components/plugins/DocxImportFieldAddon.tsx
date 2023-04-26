import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import { useRef, useState } from "react";
import type { Text } from "slate";

type NewLine = "\n";

const DocxImportFieldAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({
  ctx,
}) => {
  const inputFile = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  return (
    <Canvas ctx={ctx}>
      <input
        onChange={async () => {
          try {
            ctx.notice("Importing Document").catch((e) => console.error(e));
            setLoading(true);
            if (!inputFile.current || !inputFile.current.files) return;
            const file = inputFile.current.files.item(0);
            if (!file) return;
            const [{ default: mammonth }, { jsx }] = await Promise.all([
              import("mammoth/mammoth.browser.min"),
              import("slate-hyperscript"),
            ]);

            const deserialize = (
              el: HTMLElement | ChildNode,
              markAttributes = {}
            ):
              | null
              | Text
              | NonTextNode
              | NewLine
              | (Text | NonTextNode | NewLine | null)[] => {
              if (el.nodeType === Node.TEXT_NODE) {
                return jsx("text", markAttributes, el.textContent);
              } else if (el.nodeType !== Node.ELEMENT_NODE) {
                return null;
              }

              const nodeAttributes: {
                highlight?: boolean;
                strikethrough?: boolean;
                underline?: boolean;
                strong?: boolean;
                code?: boolean;
                emphasis?: boolean;
              } = { ...markAttributes };

              // define attributes for text nodes
              switch (el.nodeName) {
                case "STRONG":
                  nodeAttributes.strong = true;
                  break;
                case "CODE":
                  nodeAttributes.code = true;
                  break;
                case "EM":
                  nodeAttributes.emphasis = true;
                  break;
                case "U":
                  nodeAttributes.underline = true;
                  break;
                case "S":
                  nodeAttributes.strikethrough = true;
                  break;
                case "MARK":
                  nodeAttributes.highlight = true;
                  break;
              }

              const children = Array.from(el.childNodes)
                .map((node) => deserialize(node, nodeAttributes))
                .flat();

              if (children.length === 0) {
                children.push(jsx("text", nodeAttributes, ""));
              }

              switch (el.nodeName) {
                case "BODY":
                  return jsx("fragment", {}, children);
                case "H1":
                  return jsx(
                    "element",
                    { type: "heading", level: 1 },
                    children
                  );
                case "H2":
                  return jsx(
                    "element",
                    { type: "heading", level: 2 },
                    children
                  );
                case "H3":
                  return jsx(
                    "element",
                    { type: "heading", level: 3 },
                    children
                  );
                case "H4":
                  return jsx(
                    "element",
                    { type: "heading", level: 4 },
                    children
                  );
                case "H5":
                  return jsx(
                    "element",
                    { type: "heading", level: 5 },
                    children
                  );
                case "H6":
                  return jsx(
                    "element",
                    { type: "heading", level: 6 },
                    children
                  );
                case "OL":
                  return jsx(
                    "element",
                    { type: "list", style: "numbered" },
                    children
                  );
                case "UL":
                  return jsx(
                    "element",
                    { type: "list", style: "bulleted" },
                    children
                  );
                case "LI":
                  return jsx(
                    "element",
                    { type: "listItem" },
                    children.map((value) => {
                      if ((value as NonTextNode)?.type === "list") return value;
                      return jsx("element", { type: "paragraph" }, value);
                    })
                  );
                case "BR":
                  return "\n";
                case "BLOCKQUOTE":
                  return jsx("element", { type: "quote" }, children);
                case "P":
                  return jsx("element", { type: "paragraph" }, children);
                case "A":
                  return jsx(
                    "element",
                    {
                      type: "link",
                      url: (el as HTMLElement).getAttribute("href"),
                    },
                    children
                  );
                default:
                  return children;
              }
            };

            const output = await mammonth.convertToHtml(
              {
                arrayBuffer: await file.arrayBuffer(),
              },
              {
                styleMap: ["u => u"],
              }
            );

            const document = new DOMParser().parseFromString(
              output.value,
              "text/html"
            );
            const content = deserialize(document.body);
            await ctx.setFieldValue(ctx.fieldPath, content);
            ctx.notice("Document Imported!").catch((e) => console.error(e));
          } catch (error) {
            console.error(error);
            ctx
              .alert((error as Error)?.message ?? "Failed to parse document")
              .catch((e) => console.error(e));
          } finally {
            setLoading(false);
          }
        }}
        type="file"
        ref={inputFile}
        className="hidden"
        accept=".doc,.docx,application/msword"
      />
      <button
        className="underline disabled:text-dato-primary"
        disabled={loading}
        type="button"
        onClick={() => inputFile.current?.click()}
      >
        {loading ? "Loading...." : "Import From Text Document"}
      </button>
    </Canvas>
  );
};

export default DocxImportFieldAddon;
