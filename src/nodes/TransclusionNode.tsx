import {
  DecoratorNode,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import { ReactElement, ReactNode } from "react";


export class TransclusionNode extends DecoratorNode<ReactNode> {
  static getType(): string {
    return "transclusion";
  }

  static clone(node: TransclusionNode): TransclusionNode {
    return new TransclusionNode(
      node.__link,
      node.__getTransclusionContent,
      node.__key,
    );
  }

  __link: string;

  constructor(
    link: string,
    getTransclusionContent: (id: string) => ReactElement,
    key?: NodeKey,
  ) {
    super(key);
    this.__link = link;
    this.__getTransclusionContent = getTransclusionContent;
  }

  decorate(): ReactNode {
    const transclusionId = this.__link.substring(1);
    return <div data-transclusion-id={transclusionId}>
      {this.__getTransclusionContent(transclusionId)}
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

export function $createTransclusionNode(
  link: string,
  getTransclusionContent: (id: string) => ReactElement,
): TransclusionNode {
  return new TransclusionNode(link, getTransclusionContent);
}

export function $isTransclusionNode(
  node: LexicalNode | null | undefined,
): node is TransclusionNode {
  return node instanceof TransclusionNode;
}
