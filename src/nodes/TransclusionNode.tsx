import {
  DecoratorNode,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import { ReactNode } from "react";
import transclusions from "../transclusions";


export class TransclusionNode extends DecoratorNode<ReactNode> {
  static getType(): string {
    return "transclusion";
  }

  static clone(node: TransclusionNode): TransclusionNode {
    return new TransclusionNode(node.__link, node.__key);
  }

  __link: string;

  constructor(link: string, key?: NodeKey) {
    super(key);
    this.__link = link;
  }

  decorate(): ReactNode {
    return <div>
      <p>{transclusions.get(this.__link.substring(1))}</p>
      <p className="slug">{this.__link}</p>
    </div>;
  }

  createDOM(): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add("transclusion");
    return div;
  }


  updateDOM(): false {
    return false;
  }

  importJSON() {
    return;
  }

  exportJSON(): SerializedLexicalNode {
    return super.exportJSON();
  }

  isInline(): boolean {
    return false;
  }
}

export function $createTransclusionNode(link: string): TransclusionNode {
  return new TransclusionNode(link);
}

export function $isTransclusionNode(
  node: LexicalNode | null | undefined,
): node is TransclusionNode {
  return node instanceof TransclusionNode;
}
