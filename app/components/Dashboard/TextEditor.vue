<script setup lang="ts">
import {
  Bold,
  Italic,
  Strikethrough,
  ListOrdered,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline as UnderlineIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Table as TableIcon,
  Link as LinkIcon,
  Palette,
  Video,
  FileText,
} from "lucide-vue-next";

import { Editor, EditorContent } from "@tiptap/vue-3";

import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Dropcursor from "@tiptap/extension-dropcursor";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
// import TableResize from "@tiptap/extension-table-resize";
import { Link } from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Youtube } from "@tiptap/extension-youtube";
// import Gapcursor from "@tiptap/extension-gapcursor";
// import Document from "@tiptap/extension-document";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | undefined): void;
}>();

const editor = ref<Editor | undefined>();

const addImage = () => {
  const url = window.prompt("Image URL");

  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run();
  }
};

const addLink = () => {
  const url = window.prompt("Link URL");

  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run();
  }
};

const addYoutubeVideo = () => {
  const url = window.prompt("YouTube Video URL");

  if (url) {
    editor.value?.chain().focus().setYoutubeVideo({ src: url }).run();
  }
};

const addTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
};

const setColor = () => {
  const color = window.prompt("Color (hex, rgb, or color name)", "#ff0000");

  if (color) {
    editor.value?.chain().focus().setColor(color).run();
  }
};

const insertProductTemplate = () => {
  const template = `<h2>Product Specifications</h2><div class="border rounded-md"><table><tr><th>Feature</th><th>Specification</th></tr><tr><td>Brand</td><td>&nbsp;</td></tr><tr><td>Model</td><td>&nbsp;</td></tr><tr><td>Dimensions</td><td>&nbsp;</td></tr><tr><td>Weight</td><td>&nbsp;</td></tr></table></div>`;

  editor.value?.chain().focus().insertContent(template).run();
};

// Table management functions
const addColumnBefore = () => {
  editor.value?.chain().focus().addColumnBefore().run();
};

const addColumnAfter = () => {
  editor.value?.chain().focus().addColumnAfter().run();
};

const deleteColumn = () => {
  editor.value?.chain().focus().deleteColumn().run();
};

const addRowBefore = () => {
  editor.value?.chain().focus().addRowBefore().run();
};

const addRowAfter = () => {
  editor.value?.chain().focus().addRowAfter().run();
};

const deleteRow = () => {
  editor.value?.chain().focus().deleteRow().run();
};

const mergeCells = () => {
  editor.value?.chain().focus().mergeCells().run();
};

const splitCell = () => {
  editor.value?.chain().focus().splitCell().run();
};

const deleteTable = () => {
  editor.value?.chain().focus().deleteTable().run();
};

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      // Document,
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Image,
      Dropcursor,
      // Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // TableResize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      TextStyle,
      Color,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    onUpdate: () => {
      emits("update:modelValue", editor.value?.getHTML());
    },
    editorProps: {
      attributes: {
        placeholder: props.placeholder || "Write your product description here...",
      },
    },
  });
});
</script>

<template>
  <div class="ring ring-accented rounded-md flex flex-col">
    <div class="flex items-center p-1 w-full flex-1 flex-wrap border border-accented">
      <div class="flex items-center gap-x-1">
        <UButton
          type="button"
          square
          variant="ghost"
          @click.prevent="
            () => {
              editor?.chain().focus().toggleBold().run();
            }
          "
          :class="{
            'bg-accented': editor?.isActive('bold'),
          }">
          <Bold :size="16" />
        </UButton>
        <UButton
          type="button"
          square
          variant="ghost"
          @click.prevent="editor?.chain().focus().toggleItalic().run()"
          :class="{
            'bg-accented': editor?.isActive('italic'),
          }">
          <Italic :size="16" />
        </UButton>
        <UButton
          type="button"
          square
          variant="ghost"
          @click.prevent="editor?.chain().focus().toggleStrike().run()"
          :class="{
            'bg-accented': editor?.isActive('strike'),
          }">
          <Strikethrough :size="16" />
        </UButton>
        <UButton
          type="button"
          square
          variant="ghost"
          @click.prevent="editor?.chain().focus().toggleUnderline().run()"
          :class="{
            'bg-accented': editor?.isActive('underline'),
          }">
          <UnderlineIcon :size="16" />
        </UButton>
      </div>

      <USeparator class="mx-2 h-4" orientation="vertical" />

      <div class="flex items-center gap-x-1">
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().setTextAlign('left').run()">
          <AlignLeft :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().setTextAlign('center').run()">
          <AlignCenter :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().setTextAlign('right').run()">
          <AlignRight :size="16" />
        </UButton>
      </div>

      <USeparator class="mx-2 h-4" orientation="vertical" />

      <div class="flex items-center gap-x-1">
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().toggleOrderedList().run()">
          <ListOrdered :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().toggleBulletList().run()">
          <List :size="16" />
        </UButton>
      </div>

      <USeparator class="mx-2 h-4" orientation="vertical" />

      <div class="flex items-center gap-x-1">
        <UButton type="button" square variant="ghost" @click.prevent="addImage">
          <ImageIcon :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="addLink">
          <LinkIcon :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="addTable">
          <TableIcon :size="16" />
        </UButton>

        <!-- Table Management Buttons -->
        <USeparator class="mx-1 h-4" orientation="vertical" />

        <!-- Column Controls -->
        <UTooltip text="Add Column Before">
          <UButton
            type="button"
            square
            variant="ghost"
            @click.prevent="addColumnBefore"
            :disabled="!editor?.can().addColumnBefore()">
            <UIcon name="mdi:table-column-plus-before" :size="16" />
          </UButton>
        </UTooltip>
        <UTooltip text="Add Column After">
          <UButton
            type="button"
            square
            variant="ghost"
            @click.prevent="addColumnAfter"
            :disabled="!editor?.can().addColumnAfter()">
            <UIcon name="mdi:table-column-plus-after" :size="16" />
          </UButton>
        </UTooltip>
        <UTooltip text="Delete Column">
          <UButton type="button" square variant="ghost" @click.prevent="deleteColumn" :disabled="!editor?.can().deleteColumn()">
            <UIcon name="mdi:table-column-remove" :size="16" />
          </UButton>
        </UTooltip>

        <!-- Row Controls -->
        <UTooltip text="Add Row Before">
          <UButton type="button" square variant="ghost" @click.prevent="addRowBefore" :disabled="!editor?.can().addRowBefore()">
            <UIcon name="mdi:table-row-plus-before" :size="16" />
          </UButton>
        </UTooltip>
        <UTooltip text="Add Row After">
          <UButton type="button" square variant="ghost" @click.prevent="addRowAfter" :disabled="!editor?.can().addRowAfter()">
            <UIcon name="mdi:table-row-plus-after" :size="16" />
          </UButton>
        </UTooltip>
        <UTooltip text="Delete Row">
          <UButton type="button" square variant="ghost" @click.prevent="deleteRow" :disabled="!editor?.can().deleteRow()">
            <UIcon name="mdi:table-row-remove" :size="16" />
          </UButton>
        </UTooltip>

        <!-- Cell Controls -->
        <UTooltip text="Merge Cells">
          <UButton type="button" square variant="ghost" @click.prevent="mergeCells" :disabled="!editor?.can().mergeCells()">
            <UIcon name="mdi:table-merge-cells" :size="16" />
          </UButton>
        </UTooltip>
        <UTooltip text="Split Cell">
          <UButton type="button" square variant="ghost" @click.prevent="splitCell" :disabled="!editor?.can().splitCell()">
            <UIcon name="mdi:table-split-cell" :size="16" />
          </UButton>
        </UTooltip>
        <UTooltip text="Delete Table">
          <UButton type="button" square variant="ghost" @click.prevent="deleteTable" :disabled="!editor?.can().deleteTable()">
            <UIcon name="mdi:table-remove" :size="16" />
          </UButton>
        </UTooltip>
      </div>

      <USeparator class="mx-2 h-4" orientation="vertical" />

      <div class="flex items-center gap-x-1">
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().toggleHeading({ level: 1 }).run()">
          <Heading1 :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="editor?.chain().focus().toggleHeading({ level: 2 }).run()">
          <Heading2 :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="setColor">
          <Palette :size="16" />
        </UButton>
        <UButton type="button" square variant="ghost" @click.prevent="addYoutubeVideo">
          <Video :size="16" />
        </UButton>
      </div>
    </div>

    <EditorContent v-if="editor" class="min-h-[200px] w-full flex-1" :editor="editor" />
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

:deep([contenteditable="true"]) {
  @apply outline-none p-2 min-h-48 max-w-full prose prose-sm dark:prose-invert;
}

:deep([contenteditable="true"]:empty:before) {
  content: attr(placeholder);
  @apply text-gray-400 float-left h-0;
}

:deep([contenteditable="true"] table) {
  @apply w-full border border-gray-300 dark:border-neutral-700 rounded-md table-auto table text-sm;
}

:deep([contenteditable="true"] table *) {
  @apply !m-0;
}

:deep([contenteditable="true"] table th) {
  @apply !px-4 py-2 bg-gray-100 font-semibold text-left;
}

:deep([contenteditable="true"] table td) {
  @apply !px-4 py-2 border-t border-gray-200 dark:border-neutral-700;
}

:deep([contenteditable="true"] table td:not(:last-child)),
:deep([contenteditable="true"] table th:not(:last-child)) {
  @apply border-r border-gray-200 dark:border-neutral-700;
}

/* Table Resize Cursors */
:deep([contenteditable="true"] table) {
  cursor: default;
}

:deep([contenteditable="true"] table colgroup col) {
  cursor: default;
}

:deep([contenteditable="true"] table colgroup col:hover) {
  cursor: default;
}

:deep([contenteditable="true"] table tbody tr:hover) {
  cursor: default;
}

/* Resize handle styles */
:deep([contenteditable="true"] table .resize-handle) {
  cursor: col-resize;
  background-color: rgba(59, 130, 246, 0.1);
  border-right: 2px solid rgba(59, 130, 246, 0.3);
}

:deep([contenteditable="true"] table .resize-handle:hover) {
  background-color: rgba(59, 130, 246, 0.2);
  border-right: 2px solid rgba(59, 130, 246, 0.6);
}

/* Table border hover effects - only on right edge */
:deep([contenteditable="true"] table th),
:deep([contenteditable="true"] table td) {
  position: relative;
}

:deep([contenteditable="true"] table th:hover::after),
:deep([contenteditable="true"] table td:hover::after) {
  content: "";
  position: absolute;
  top: 0;
  right: -2px;
  bottom: 0;
  width: 4px;
  background-color: rgba(59, 130, 246, 0.3);
  cursor: col-resize;
  z-index: 10;
  pointer-events: auto;
}

/* Only show resize cursor when hovering over the right border */
:deep([contenteditable="true"] table th:not(:last-child):hover),
:deep([contenteditable="true"] table td:not(:last-child):hover) {
  cursor: default;
}

:deep([contenteditable="true"] table th:not(:last-child):hover::after),
:deep([contenteditable="true"] table td:not(:last-child):hover::after) {
  cursor: col-resize;
}

/* 
:deep([contenteditable="true"]) ul {
  @apply list-disc ps-7;
}

:deep([contenteditable="true"]) ol {
  @apply list-decimal ps-7;
} */
</style>
