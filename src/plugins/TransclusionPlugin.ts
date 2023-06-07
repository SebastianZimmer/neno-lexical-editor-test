import {
  useLexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $createTransclusionNode,
  $isTransclusionNode,
  TransclusionNode,
} from "../nodes/TransclusionNode";
import { LexicalEditor, LexicalNode, ParagraphNode } from "lexical";
import { $isAutoLinkNode, AutoLinkNode } from "@lexical/link";


const transclusionsMatchSlashlinks = (
  slashlinks: AutoLinkNode[],
  transclusions: TransclusionNode[],
): boolean => {
  if (slashlinks.length !== transclusions.length) return false;

  for (let i = 0; i < slashlinks.length; i++) {
    if (slashlinks[i].getTextContent() !== transclusions[i].__link) {
      return false;
    }
  }

  return true;
};

const registerBlockNodeTransform = (editor: LexicalEditor) => {
  editor.registerNodeTransform(ParagraphNode, (node: ParagraphNode) => {
    const slashlinks = node.getChildren()
      .filter((child): child is AutoLinkNode => {
        return $isAutoLinkNode(child)
          && child.getTextContent().startsWith("/");
      });

    const transclusions: TransclusionNode[] = node.getChildren()
      .filter(
        (child: LexicalNode): child is TransclusionNode => {
          return $isTransclusionNode(child);
        });

    if (transclusionsMatchSlashlinks(slashlinks, transclusions)) {
      return;
    }

    // remove transclusions at end of block
    while ($isTransclusionNode(node.getLastChild())) {
      node.getLastChild()?.remove();
    }

    slashlinks.forEach((slashlinkNode) => {
      const transclusionNode = $createTransclusionNode(
        slashlinkNode.getTextContent(),
      );
      node.append(transclusionNode);
    });
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

