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
export class BoldNode extends TextNode {
  static getType(): string {
    return 'bold';
  }

  static clone(node: BoldNode): BoldNode {
    return new BoldNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.bold);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): BoldNode {
    const node = $createBoldNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'bold',
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
 * Generates a BoldNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the BoldNode.
 * @returns - The BoldNode with the embedded text.
 */
export function $createBoldNode(text = ''): BoldNode {
  return $applyNodeReplacement(new BoldNode(text));
}

/**
 * Determines if node is a BoldNode.
 * @param node - The node to be checked.
 * @returns true if node is a BoldNode, false otherwise.
 */
export function $isBoldNode(
  node: LexicalNode | null | undefined,
): node is BoldNode {
  return node instanceof BoldNode;
}