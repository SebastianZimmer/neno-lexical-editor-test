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

export class WikiLinkPunctuationNode extends TextNode {
  static getType(): string {
    return 'wikiLinkPunctuation';
  }

  static clone(node: WikiLinkPunctuationNode): WikiLinkPunctuationNode {
    return new WikiLinkPunctuationNode(node.__text);
  }

  constructor(text: string) {
    super(text);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.wikiLinkPunctuation);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): WikiLinkPunctuationNode {
    const node = $createWikiLinkPunctuationNode(serializedNode.text);
    //node.setFormat(serializedNode.format);
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
}

/**
 * Generates a WikiLinkPunctuationNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the WikiLinkPunctuationNode.
 * @returns - The WikiLinkPunctuationNode with the embedded text.
 */
export function $createWikiLinkPunctuationNode(text = ''): WikiLinkPunctuationNode {
  return $applyNodeReplacement(new WikiLinkPunctuationNode(text));
}

/**
 * Determines if node is a WikiLinkPunctuationNode.
 * @param node - The node to be checked.
 * @returns true if node is a WikiLinkPunctuationNode, false otherwise.
 */
export function $isWikiLinkPunctuationNode(
  node: LexicalNode | null | undefined,
): node is WikiLinkPunctuationNode {
  return node instanceof WikiLinkPunctuationNode;
}