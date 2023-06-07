import {
  useLexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  TransclusionNode,
} from "../nodes/TransclusionNode";
import { $isParagraphNode, LexicalEditor, ParagraphNode } from "lexical";
import refreshTransclusionsForBlock
  from "../utils/refreshTransclusionsForBlock";
import { AutoLinkNode } from "@lexical/link";


const registerBlockNodeTransform = (editor: LexicalEditor) => {
  editor.registerNodeTransform(ParagraphNode, (node: ParagraphNode) => {
    refreshTransclusionsForBlock(node);
  });

  editor.registerNodeTransform(AutoLinkNode, (node: AutoLinkNode) => {
    let block = node.getParent();
    while (!$isParagraphNode(block)) {
      block = block.getParent();
    }
    refreshTransclusionsForBlock(block);
  });
};

export default function TransclusionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TransclusionNode])) {
      throw new Error("Transclusion plugin is missing required nodes");
    }

    return registerBlockNodeTransform(
      editor,
    );
  }, [editor]);

  return null;
}

