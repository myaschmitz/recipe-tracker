import React, { useEffect } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import Placeholder from "@tiptap/extension-placeholder";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

interface MenuBarProps {
  editor: Editor | null;
}

interface RichTextEditorProps {
  id?: string;
  onChange: (value: string) => void;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}

const RichTextEditorMenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 mb-2">
      <Toggle
        onClick={() => editor.chain().focus().toggleBold().run()}
        pressed={editor.isActive("bold")}
        size="sm"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        onClick={() => editor.chain().focus().toggleItalic().run()}
        pressed={editor.isActive("italic")}
        size="sm"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        pressed={editor.isActive("underline")}
        size="sm"
      >
        <span className="underline">U</span>
      </Toggle>
      <Toggle
        onClick={() => editor.chain().focus().toggleStrike().run()}
        pressed={editor.isActive("strike")}
        size="sm"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="w-[1px] h-8" />
      <Toggle
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList") ? "bg-slate-200 text-slate-900" : ""
        }
        size="sm"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        pressed={editor.isActive("orderedList")}
        size="sm"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        size="sm"
        variant="ghost"
        className="px-2 hover:text-muted-foreground"
      >
        <Undo />
      </Button>
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        size="sm"
        variant="ghost"
        className="px-2 hover:text-muted-foreground"
      >
        <Redo />
      </Button>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  onChange, 
  defaultValue = "", 
  placeholder = "Add instructions here" 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
    ],
    content: defaultValue,
    immediatelyRender: false, // Fix SSR hydration warning
    editorProps: {
      attributes: {
        class:
          "min-h-[50px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const updateContent = () => {
        onChange(editor.getHTML()); // Pass the editor's HTML content to the parent component
      };

      editor.on("update", updateContent);

      return () => {
        editor.off("update", updateContent); // Cleanup listener on unmount
      };
    }
  }, [editor, onChange]);

  // Update editor content when defaultValue changes
  useEffect(() => {
    if (editor && defaultValue !== editor.getHTML()) {
      editor.commands.setContent(defaultValue);
    }
  }, [editor, defaultValue]);

  if (!editor) {
    return null;
  }

  return (
    <div>
      <RichTextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
