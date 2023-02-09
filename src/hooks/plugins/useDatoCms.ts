import { connect } from "datocms-plugin-sdk";
import { useEffect, useState, useRef } from "react";
import type { PluginSettings, RenderPage } from "@type/plugin";

interface PluginState {
  page: RenderPage;
  ctx: any;
  id?: string;
}

const useOnce = (run: () => void) => {
  const loaded = useRef<boolean>(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    run();
  }, [run]);
};

export function useDatoCMS(settings: Partial<PluginSettings>) {
  const [data, setData] = useState<PluginState>({
    page: "none",
    ctx: undefined,
  });

  useOnce(async () => {
    const {
      renderConfigScreen,
      renderPage,
      renderModal,
      renderItemFormSidebarPanel,
      renderAssetSource,
      renderFieldExtension,
      renderItemFormOutlet,
      renderManualFieldExtensionConfigScreen,
      ...other
    } = settings;
    await connect({
      renderConfigScreen: renderConfigScreen
        ? (ctx) => {
            if (data.page !== "ConfigScreen")
              setData({ page: "ConfigScreen", ctx });
          }
        : undefined,
      renderPage: renderPage
        ? (id, ctx) => {
            if (data.page !== "Page" && data?.id !== id)
              setData({ page: "Page", ctx, id });
          }
        : undefined,
      renderModal: renderModal
        ? (id, ctx) => {
            if (data.page !== "Modal" && data?.id !== id)
              setData({ page: "Modal", id, ctx });
          }
        : undefined,
      renderItemFormSidebarPanel: renderItemFormSidebarPanel
        ? (id, ctx) => {
            if (data.page !== "ItemFormSidebarPanel" && data?.id !== id)
              setData({ page: "ItemFormSidebarPanel", ctx, id });
          }
        : undefined,
      renderItemFormOutlet: renderItemFormOutlet
        ? (id, ctx) => {
            if (data.page !== "ItemFormOutlet" && data?.id !== id)
              setData({ page: "ItemFormOutlet", ctx, id });
          }
        : undefined,
      renderAssetSource: renderAssetSource
        ? (id, ctx) => {
            if (data.page !== "AssetSource" && data?.id !== id)
              setData({ page: "AssetSource", ctx, id });
          }
        : undefined,
      renderFieldExtension: renderFieldExtension
        ? (id, ctx) => {
            if (data.page !== "FieldExtension" && data?.id !== id)
              setData({ page: "FieldExtension", ctx, id });
          }
        : undefined,
      renderManualFieldExtensionConfigScreen:
        renderManualFieldExtensionConfigScreen
          ? (id, ctx) => {
              if (
                data.page !== "ManualFieldExtensionConfigScreen" &&
                data?.id !== id
              )
                setData({ page: "ManualFieldExtensionConfigScreen", ctx, id });
            }
          : undefined,
      ...other,
    });
  });

  return data;
}
