"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, FileText, Folder, FolderPlus, HardDrive, Image as ImageIcon, LayoutGrid, List, PanelRight, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { files as seedFiles, type FileNode } from "@/lib/studio-data";
import Sheet from "./Sheet";

type Place = "all" | "recent" | "images" | "documents" | "ai" | "stock" | "trash";

const places: { id: Place; label: string; icon: typeof Folder }[] = [
  { id: "all", label: "All files", icon: HardDrive },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "ai", label: "Made by AI", icon: Sparkles },
  { id: "stock", label: "Stock photos", icon: ImageIcon },
  { id: "trash", label: "Trash", icon: Trash2 },
];

const kindLabel: Record<FileNode["kind"], string> = { folder: "Folder", image: "Image", pdf: "PDF document", doc: "Word document" };

function FolderGlyph() {
  return (
    <svg viewBox="0 0 64 52" className="s-folder" aria-hidden="true">
      <path className="s-folder-back" d="M4 8a6 6 0 0 1 6-6h14l7 7h23a6 6 0 0 1 6 6v29a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" />
      <path className="s-folder-front" d="M4 20a6 6 0 0 1 6-6h44a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" />
    </svg>
  );
}

function Thumb({ node }: { node: FileNode }) {
  if (node.kind === "folder") return <FolderGlyph />;
  if (node.kind === "image") {
    const h = node.hue ?? 220;
    return <span className="s-thumb-img" style={{ background: `linear-gradient(140deg, hsl(${h} 46% 74%), hsl(${(h + 38) % 360} 48% 52%))` }} aria-hidden="true" />;
  }
  return (
    <span className={`s-thumb-doc is-${node.kind}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <b>{node.kind === "pdf" ? "PDF" : "DOC"}</b>
    </span>
  );
}

function inPlace(files: FileNode[], place: Place, folder: string | null): FileNode[] {
  switch (place) {
    case "all":
      return files.filter((f) => f.parent === folder);
    case "recent":
      return files.filter((f) => f.kind !== "folder" && /Today|Yesterday|Just now/.test(f.modified));
    case "images":
      return files.filter((f) => f.kind === "image");
    case "documents":
      return files.filter((f) => f.kind === "pdf" || f.kind === "doc");
    case "ai":
      return files.filter((f) => f.source === "Made by AI");
    case "stock":
      return files.filter((f) => f.source === "Stock photo");
    case "trash":
      return [];
  }
}

function FileInfo({ node, open }: { node: FileNode; open: (n: FileNode) => void }) {
  return (
    <>
      <div className="s-info-preview">
        <Thumb node={node} />
      </div>
      <h2>{node.name}</h2>
      <p className="s-muted">
        {kindLabel[node.kind]}
        {node.size ? `, ${node.size}` : ""}
      </p>
      <dl>
        <div>
          <dt>Modified</dt>
          <dd>{node.modified}</dd>
        </div>
        {node.detail && (
          <div>
            <dt>{node.kind === "image" ? "Size in pixels" : "Length"}</dt>
            <dd>{node.detail}</dd>
          </div>
        )}
        {node.source && (
          <div>
            <dt>Came from</dt>
            <dd>{node.source}</dd>
          </div>
        )}
        {node.usedIn && (
          <div>
            <dt>Used in</dt>
            <dd>{node.usedIn}</dd>
          </div>
        )}
      </dl>
      {node.kind === "folder" ? (
        <button type="button" className="s-btn is-primary" onClick={() => open(node)}>
          Open folder
        </button>
      ) : (
        <div className="s-info-acts">
          <button type="button" className="s-btn is-primary">
            Use on the website
          </button>
          <button type="button" className="s-btn">
            Download
          </button>
          <button type="button" className="s-btn is-danger">
            Move to trash
          </button>
        </div>
      )}
    </>
  );
}

type Spot = { place: Place; folder: string | null };

export default function Files({
  mobile = false,
  extra = [],
  onUpload,
  onNewFolder,
}: {
  mobile?: boolean;
  /** Files and folders added from the upload and new folder forms. */
  extra?: FileNode[];
  onUpload?: () => void;
  onNewFolder?: () => void;
}) {
  const files = [...seedFiles, ...extra];
  const [trail, setTrail] = useState<Spot[]>([{ place: "all", folder: null }]);
  const [at, setAt] = useState(0);
  const [selectedId, setSelected] = useState<string | null>("f1");
  // A phone has no resting selection: a tap opens the item.
  const selected = mobile ? null : selectedId;
  const [grid, setGrid] = useState(true);
  const [info, setInfo] = useState(true);
  const [query, setQuery] = useState("");
  // On a phone a tap opens: folders navigate, files show their details in a drawer.
  const [sheetId, setSheetId] = useState<string | null>(null);

  const spot = trail[at];
  const folder = files.find((f) => f.id === spot.folder) ?? null;
  const q = query.trim().toLowerCase();
  const items = (q ? files.filter((f) => f.name.toLowerCase().includes(q)) : inPlace(files, spot.place, spot.folder)).sort((a, b) =>
    a.kind === "folder" && b.kind !== "folder" ? -1 : b.kind === "folder" && a.kind !== "folder" ? 1 : a.name.localeCompare(b.name),
  );
  const picked = files.find((f) => f.id === selected) ?? null;
  const placeLabel = places.find((p) => p.id === spot.place)?.label ?? "";

  function visit(next: Spot) {
    setTrail([...trail.slice(0, at + 1), next]);
    setAt(at + 1);
    setSelected(null);
    setQuery("");
  }

  function open(node: FileNode) {
    if (node.kind === "folder") visit({ place: "all", folder: node.id });
  }

  function tap(node: FileNode) {
    setSelected(node.id);
    if (!mobile) return;
    if (node.kind === "folder") open(node);
    else setSheetId(node.id);
  }

  return (
    <div className={`s-files ${info && !mobile ? "has-info" : ""}`}>
      <nav className="s-files-side" aria-label="Places">
        <p className="s-label">Places</p>
        {places.map((p) => (
          <button key={p.id} type="button" aria-current={spot.place === p.id && !q} onClick={() => visit({ place: p.id, folder: null })}>
            <p.icon size={16} aria-hidden="true" />
            {p.label}
          </button>
        ))}
        <div className="s-storage">
          <p>
            <strong>3.2 GB</strong> of 10 GB used
          </p>
          <span className="s-meter" role="img" aria-label="32% of storage used">
            <span style={{ width: "32%" }} />
          </span>
        </div>
      </nav>

      <div className="s-files-main">
        <div className="s-files-bar">
          <div className="s-stepper">
            <button type="button" aria-label="Back" disabled={at === 0} onClick={() => setAt(at - 1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" aria-label="Forward" disabled={at >= trail.length - 1} onClick={() => setAt(at + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="s-crumbs" aria-label="Location">
            {q ? (
              <strong>Search results</strong>
            ) : (
              <>
                {folder ? (
                  <button type="button" onClick={() => visit({ place: spot.place, folder: null })}>
                    {placeLabel}
                  </button>
                ) : (
                  <strong>{placeLabel}</strong>
                )}
                {folder && (
                  <>
                    <ChevronRight size={14} aria-hidden="true" />
                    <strong>{folder.name}</strong>
                  </>
                )}
              </>
            )}
          </div>
          <label className="s-search">
            <Search size={15} aria-hidden="true" />
            <input type="search" placeholder="Search files" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search files" />
          </label>
          <div className="s-seg" role="group" aria-label="View">
            <button type="button" aria-pressed={grid} onClick={() => setGrid(true)} aria-label="Icons">
              <LayoutGrid size={15} />
            </button>
            <button type="button" aria-pressed={!grid} onClick={() => setGrid(false)} aria-label="List">
              <List size={15} />
            </button>
          </div>
          <button type="button" className="s-icon-btn" aria-pressed={info} onClick={() => setInfo(!info)} aria-label="Show or hide details">
            <PanelRight size={16} />
          </button>
          <button type="button" className="s-icon-btn" aria-label="New folder" onClick={onNewFolder}>
            <FolderPlus size={16} />
          </button>
          <button type="button" className="s-btn is-primary" onClick={onUpload}>
            <Upload size={15} aria-hidden="true" />
            Upload
          </button>
        </div>

        <div className="s-files-body" onClick={() => setSelected(null)}>
          {items.length === 0 ? (
            <p className="s-empty">{spot.place === "trash" ? "Trash is empty." : "Nothing here yet. Drop files in to upload them."}</p>
          ) : grid ? (
            <ul className="s-icons">
              {items.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    aria-pressed={selected === f.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      tap(f);
                    }}
                    onDoubleClick={() => open(f)}
                    onKeyDown={(e) => e.key === "Enter" && open(f)}
                  >
                    <Thumb node={f} />
                    <span>{f.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <table className="s-file-list">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Modified</th>
                  <th scope="col">Size</th>
                  <th scope="col">Kind</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr
                    key={f.id}
                    aria-selected={selected === f.id}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      tap(f);
                    }}
                    onDoubleClick={() => open(f)}
                    onKeyDown={(e) => e.key === "Enter" && (selected === f.id ? open(f) : setSelected(f.id))}
                  >
                    <td>
                      <span className="s-file-name">
                        <Thumb node={f} />
                        {f.name}
                      </span>
                    </td>
                    <td>{f.modified}</td>
                    <td>{f.size ?? "--"}</td>
                    <td>{kindLabel[f.kind]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="s-files-status">
          {items.length} item{items.length === 1 ? "" : "s"}
          {picked ? `, “${picked.name}” selected` : ""}
          <span>{mobile ? "Tap a file for details" : "Double-click a folder to open it"}</span>
        </p>
      </div>

      {info && !mobile && (
        <aside className="s-files-info" aria-label="Details">
          {picked ? (
            <FileInfo node={picked} open={open} />
          ) : (
            <p className="s-empty">Select a file to see where it is used.</p>
          )}
        </aside>
      )}

      {mobile && sheetId && files.some((f) => f.id === sheetId) && (
        <Sheet title="File details" onClose={() => setSheetId(null)}>
          <div className="m-file-info">
            <FileInfo node={files.find((f) => f.id === sheetId)!} open={open} />
          </div>
        </Sheet>
      )}
    </div>
  );
}
