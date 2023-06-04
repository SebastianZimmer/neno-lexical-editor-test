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
  SerializedTextNode,
} from 'lexical';

import {addClassNamesToElement} from '@lexical/utils';
import {$applyNodeReplacement, TextNode} from 'lexical';

export class WikiLinkContentNode extends TextNode {
  static getType(): string {
    return 'wikiLinkContent';
  }

  static clone(node: WikiLinkContentNode): WikiLinkContentNode {
    return new WikiLinkContentNode(node.__text);
  }

  constructor(text: string) {
    super(text);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.wikiLinkContent);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): WikiLinkContentNode {
    const node = $createWikiLinkContentNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }

  isInline(): boolean {
    return true;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'wikiLinkContent',
    };
  }
}

/**
 * Generates a WikiLinkContentNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the WikiLinkContentNode.
 * @returns - The WikiLinkContentNode with the embedded text.
 */
export function $createWikiLinkContentNode(text = ''): WikiLinkContentNode {
  return $applyNodeReplacement(new WikiLinkContentNode(text));
}

/**
 * Determines if node is a WikiLinkContentNode.
 * @param node - The node to be checked.
 * @returns true if node is a WikiLinkContentNode, false otherwise.
 */
export function $isWikiLinkContentNode(
  node: LexicalNode | null | undefined,
): node is WikiLinkContentNode {
  return node instanceof WikiLinkContentNode;
}