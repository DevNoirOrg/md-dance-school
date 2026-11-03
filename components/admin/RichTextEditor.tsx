"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { mediaUrl } from "@/lib/format";
import { uploadMedia } from "./MediaField";

/*
  Word-szerű szövegszerkesztő a hírekhez (Tiptap). Tud: félkövér, dőlt,
  aláhúzott, áthúzott, alcímek, felsorolás, számozott lista, idézet, link,
  kép beszúrása (feltöltés), visszavonás. Wordből / weboldalról bemásolt
  szövegnél a formázás nagy része megmarad, a felesleges stílusok nem.
  A HTML-t mentéskor a szerver is megtisztítja (lib/news-html.ts).
*/

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold transition-colors disabled:opacity-30 ${
        active ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />;

function Toolbar({ editor, onImage, uploading }: { editor: Editor; onImage: () => void; uploading: boolean }) {
  const st = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Link címe (pl. https://… vagy /#orarend). Üresen hagyva a link törlődik:", prev);
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url.trim() === "") chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-white/95 p-1.5 backdrop-blur">
      <ToolButton label="Félkövér (Ctrl+B)" active={st.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </ToolButton>
      <ToolButton label="Dőlt (Ctrl+I)" active={st.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolButton>
      <ToolButton label="Aláhúzott (Ctrl+U)" active={st.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolButton>
      <ToolButton label="Áthúzott" active={st.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolButton>
      <Sep />
      <ToolButton label="Alcím" active={st.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolButton>
      <ToolButton label="Kisebb alcím" active={st.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolButton>
      <Sep />
      <ToolButton label="Felsorolás" active={st.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • ≡
      </ToolButton>
      <ToolButton label="Számozott lista" active={st.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. ≡
      </ToolButton>
      <ToolButton label="Idézet" active={st.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </ToolButton>
      <Sep />
      <ToolButton label="Link" active={st.link} onClick={setLink}>
        🔗
      </ToolButton>
      <ToolButton label="Kép beszúrása" disabled={uploading} onClick={onImage}>
        {uploading ? "…" : "🖼"}
      </ToolButton>
      <Sep />
      <ToolButton label="Formázás törlése" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        ⌫
      </ToolButton>
      <ToolButton label="Visszavonás (Ctrl+Z)" disabled={!st.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolButton>
      <ToolButton label="Újra (Ctrl+Y)" disabled={!st.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolButton>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (html: string) => void;
  id?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    // Next.js SSR: csak a böngészőben rendereljük
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: "doc news-body min-h-[260px] px-5 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  async function insertImage(file: File) {
    if (!editor) return;
    setError(null);
    setUploading(true);
    try {
      const path = await uploadMedia("image", file);
      editor.chain().focus().setImage({ src: mediaUrl(path), alt: "" }).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba a kép feltöltésekor.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white focus-within:border-uc/50">
        {editor ? (
          <>
            <Toolbar editor={editor} uploading={uploading} onImage={() => fileRef.current?.click()} />
            <EditorContent editor={editor} />
          </>
        ) : (
          <div className="min-h-[300px] animate-pulse bg-slate-50" />
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void insertImage(f);
        }}
      />
      {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
