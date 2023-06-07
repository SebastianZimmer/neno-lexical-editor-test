import {
  $createTransclusionNode,
  $isTransclusionNode,
  TransclusionNode,
} from "../nodes/TransclusionNode";
import { LexicalNode, ParagraphNode } from "lexical";
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


export default (node: ParagraphNode) => {
  const slashlinks = node.getChildren()
    .filter((child): child is AutoLinkNode => {
      return $isAutoLinkNode(child)
        && (
          child.getTextContent().startsWith("/")
          || child.getTextContent().startsWith("@")
        );
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
};
