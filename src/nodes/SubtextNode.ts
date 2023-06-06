import { EditorConfig, ParagraphNode } from "lexical";

export default class SubtextNode extends ParagraphNode {
  static getType(): string {
    return "subtext";
  }

  static clone(): SubtextNode {
    return new SubtextNode();
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.classList.add(config.theme.subtext);
    return element;
  }
}

export function $createSubtextNode(): SubtextNode {
  return new SubtextNode();
}

export function $isSubtextNode(
  node: SubtextNode | null | undefined,
): node is SubtextNode {
  return node instanceof SubtextNode;
}