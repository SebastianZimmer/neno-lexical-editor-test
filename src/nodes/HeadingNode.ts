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
export class HeadingNode extends TextNode {
  static getType(): string {
    return 'heading';
  }

  static clone(node: HeadingNode): HeadingNode {
    return new HeadingNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.s_heading);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): HeadingNode {
    const node = $createHeadingNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'heading',
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
 * Generates a HeadingNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the HeadingNode.
 * @returns - The HeadingNode with the embedded text.
 */
export function $createHeadingNode(text = ''): HeadingNode {
  return $applyNodeReplacement(new HeadingNode(text));
}

/**
 * Determines if node is a HeadingNode.
 * @param node - The node to be checked.
 * @returns true if node is a HeadingNode, false otherwise.
 */
export function $isHeadingNode(
  node: LexicalNode | null | undefined,
): node is HeadingNode {
  return node instanceof HeadingNode;
}