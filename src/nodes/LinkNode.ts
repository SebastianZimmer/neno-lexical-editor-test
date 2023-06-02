/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
} from 'lexical';

import {addClassNamesToElement} from '@lexical/utils';
import {$applyNodeReplacement, TextNode} from 'lexical';

/** @noInheritDoc */
export class LinkNode extends TextNode {
  static getType(): string {
    return 'link';
  }

  static clone(node: LinkNode): LinkNode {
    return new LinkNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  // createDOM(config: EditorConfig): HTMLElement {
  //   const element = super.createDOM(config);
  //   addClassNamesToElement(element, config.theme.link);
  //   return element;
  // }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    const link = document.createElement("a");
    link.appendChild(element);
    // link.href = "http://de.wikipedia.org";
    addClassNamesToElement(element, config.theme.link);
    return link;
  }

  static importJSON(serializedNode: SerializedTextNode): LinkNode {
    const node = $createLinkNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'link',
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

/**
 * Generates a LinkNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the LinkNode.
 * @returns - The LinkNode with the embedded text.
 */
export function $createLinkNode(text = ''): LinkNode {
  return $applyNodeReplacement(new LinkNode(text));
}

/**
 * Determines if node is a LinkNode.
 * @param node - The node to be checked.
 * @returns true if node is a LinkNode, false otherwise.
 */
export function $isLinkNode(
  node: LexicalNode | null | undefined,
): node is LinkNode {
  return node instanceof LinkNode;
}