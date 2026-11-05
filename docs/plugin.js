// Código que roda dentro do Penpot (tem acesso ao objeto `penpot`).
// Endereço público da interface (GitHub Pages). Para testar localmente, troque por
// "http://localhost:4402/index.html".
const UI_URL = "https://studioreviofc-wq.github.io/penpot-webp-export/index.html";
penpot.ui.open("WebP Export", `${UI_URL}?theme=${penpot.theme}`, { width: 320, height: 600 });

function selectionInfo() {
  return penpot.selection.map((s) => ({
    id: s.id,
    name: s.name,
    width: Math.round(s.width),
    height: Math.round(s.height),
  }));
}

function findShape(id) {
  const fromSelection = penpot.selection.find((s) => s.id === id);
  if (fromSelection) return fromSelection;
  return penpot.currentPage ? penpot.currentPage.getShapeById(id) : null;
}

penpot.ui.onMessage(async (msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "ready" || msg.type === "get-selection") {
    penpot.ui.sendMessage({ type: "theme", theme: penpot.theme });
    penpot.ui.sendMessage({ type: "selection", shapes: selectionInfo() });
    return;
  }

  if (msg.type === "export") {
    const { reqId, shapeId, scale, format } = msg;
    try {
      const shape = findShape(shapeId);
      if (!shape) throw new Error("Camada não encontrada");
      const bytes = await shape.export({ type: format || "png", scale });
      penpot.ui.sendMessage({ type: "export-result", reqId, bytes });
    } catch (err) {
      penpot.ui.sendMessage({
        type: "export-error",
        reqId,
        error: String((err && err.message) || err),
      });
    }
  }
});

penpot.on("selectionchange", () => {
  penpot.ui.sendMessage({ type: "selection", shapes: selectionInfo() });
});

penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({ type: "theme", theme });
});
