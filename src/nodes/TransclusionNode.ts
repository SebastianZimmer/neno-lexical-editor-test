import { DecoratorNode, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode } from "lexical";


export class TransclusionNode extends DecoratorNode<HTMLDivElement> {
  static getType(): string {
    return 'transclusion';
  }

  static clone(node: TransclusionNode): TransclusionNode {
    return new TransclusionNode(node.__link, node.__key);
  }

  __link: string;

  constructor(link: string, key?: NodeKey) {
    super(key);
    this.__link = link;
  }

  decorate() {
    const div = document.createElement("div");
    div.innerHTML = "Transclusion node for " + this.__link;
    return div;
  }

  // View
  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.innerHTML = "Transclusion node for " + this.__link;
    div.style.border = "1px solid lime";
    return div;
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

export function $isVideoNode(
  node: LexicalNode | null | undefined,
): node is TransclusionNode {
  return node instanceof TransclusionNode;
}