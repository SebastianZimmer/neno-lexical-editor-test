/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$createTextNode, $isTextNode, Klass, LexicalEditor, LexicalNode, TextNode} from 'lexical';

import { TextNode as TextNodeClass } from 'lexical';

import { EntityMatch } from '@lexical/text';

import {
  $createWikiLinkContentNode,
  WikiLinkContentNode,
  $createWikiLinkPunctuationNode,
  WikiLinkPunctuationNode,
} from '../nodes/WikiLinkContentNode';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useCallback, useEffect} from 'react';
import {mergeRegister} from '@lexical/utils';


/**
 * Returns a touple that can be rested (...) into mergeRegister to clean up
 * node transforms listeners that transforms text into another node, eg. a HashtagNode.
 * @example
 * ```ts
 *   useEffect(() => {
    return mergeRegister(
      ...registerLexicalTextEntity(editor, getMatch, targetNode, createNode),
    );
  }, [createNode, editor, getMatch, targetNode]);
 * ```
 * Where targetNode is the type of node containing the text you want to transform (like a text input),
 * then getMatch uses a regex to find a matching text and creates the proper node to include the matching text.
 * @param editor - The lexical editor.
 * @param getMatch - Finds a matching string that satisfies a regex expression.
 * @param targetNode - The node type that contains text to match with. eg. HashtagNode
 * @param createNode - A function that creates a new node to contain the matched text. eg createHashtagNode
 * @returns An array containing the plain text and reverse node transform listeners.
 */
  export function registerLexicalTextEntity<T extends TextNode>(
    editor: LexicalEditor,
    getMatch: (text: string) => null | EntityMatch,
    targetNode: Klass<T>,
    createNode: (textNode: TextNode) => T,
  ): Array<() => void> {
    const isTargetNode = (node: LexicalNode | null | undefined): node is T => {
      return node instanceof targetNode;
    };
  
    const replaceWithSimpleText = (node: TextNode): void => {
      const textNode = $createTextNode(node.getTextContent());
      textNode.setFormat(node.getFormat());
      node.replace(textNode);
    };
  
    const getMode = (node: TextNode): number => {
      return node.getLatest().__mode;
    };
  
    const textNodeTransform = (node: TextNode) => {
      if (!node.isSimpleText()) {
        return;
      }
  
      const prevSibling = node.getPreviousSibling();
      let text = node.getTextContent();
      let currentNode = node;
      let match;
  
      if ($isTextNode(prevSibling)) {
        const previousText = prevSibling.getTextContent();
        const combinedText = previousText + text;
        const prevMatch = getMatch(combinedText);
  
        if (isTargetNode(prevSibling)) {
          if (prevMatch === null || getMode(prevSibling) !== 0) {
            replaceWithSimpleText(prevSibling);
  
            return;
          } else {
            const diff = prevMatch.end - previousText.length;
  
            if (diff > 0) {
              const concatText = text.slice(0, diff);
              const newTextContent = previousText + concatText;
              prevSibling.select();
              prevSibling.setTextContent(newTextContent);
  
              if (diff === text.length) {
                node.remove();
              } else {
                const remainingText = text.slice(diff);
                node.setTextContent(remainingText);
              }
  
              return;
            }
          }
        } else if (prevMatch === null || prevMatch.start < previousText.length) {
          return;
        }
      }
  
      // eslint-disable-next-line no-constant-condition
      while (true) {
        match = getMatch(text);
        let nextText = match === null ? '' : text.slice(match.end);
        text = nextText;
  
        if (nextText === '') {
          const nextSibling = currentNode.getNextSibling();
  
          if ($isTextNode(nextSibling)) {
            nextText =
              currentNode.getTextContent() + nextSibling.getTextContent();
            const nextMatch = getMatch(nextText);
  
            if (nextMatch === null) {
              if (isTargetNode(nextSibling)) {
                replaceWithSimpleText(nextSibling);
              } else {
                nextSibling.markDirty();
              }
  
              return;
            } else if (nextMatch.start !== 0) {
              return;
            }
          }
        } else {
          const nextMatch = getMatch(nextText);
  
          if (nextMatch !== null && nextMatch.start === 0) {
            return;
          }
        }
  
        if (match === null) {
          return;
        }
  
        if (
          match.start === 0 &&
          $isTextNode(prevSibling) &&
          prevSibling.isTextEntity()
        ) {
          continue;
        }
  
        let nodeToReplace;
  
        if (match.start === 0) {
          [nodeToReplace, currentNode] = currentNode.splitText(match.end);
        } else {
          [, nodeToReplace, currentNode] = currentNode.splitText(
            match.start,
            match.end,
          );
        }
  
        const replacementNode = createNode(nodeToReplace);
        replacementNode.setFormat(nodeToReplace.getFormat());
        nodeToReplace.replace(replacementNode);
  
        if (currentNode == null) {
          return;
        }
      }
    };
  
    const reverseNodeTransform = (node: T) => {
      const text = node.getTextContent();
      const match = getMatch(text);
  
      if (match === null || match.start !== 0) {
        replaceWithSimpleText(node);
  
        return;
      }
  
      if (text.length > match.end) {
        // This will split out the rest of the text as simple text
        node.splitText(match.end);
  
        return;
      }
  
      const prevSibling = node.getPreviousSibling();
  
      if ($isTextNode(prevSibling) && prevSibling.isTextEntity()) {
        replaceWithSimpleText(prevSibling);
        replaceWithSimpleText(node);
      }
  
      const nextSibling = node.getNextSibling();
  
      if ($isTextNode(nextSibling) && nextSibling.isTextEntity()) {
        replaceWithSimpleText(nextSibling);
  
        // This may have already been converted in the previous block
        if (isTargetNode(node)) {
          replaceWithSimpleText(node);
        }
      }
    };
  
    const removePlainTextTransform = editor.registerNodeTransform(
      TextNode,
      textNodeTransform,
    );
    const removeReverseNodeTransform = editor.registerNodeTransform<T>(
      targetNode,
      reverseNodeTransform,
    );
  
    return [removePlainTextTransform, removeReverseNodeTransform];
  }



const REGEX = /\[\[.*\]\]/;

export function WikiLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([WikiLinkContentNode, WikiLinkPunctuationNode])) {
      throw new Error('WikiLinkPlugin: WikiLinkNodes not registered on editor');
    }

    editor.registerNodeTransform(TextNodeClass, textNode => {
      if (
        textNode.getTextContent().match(/\[\[[\w-\s]+\]\]/)
      ) {
        console.log("wikilink discovered");
      }
    })
  }, [editor]);

  const createWikiLinkContentNode = useCallback(
    (textNode: TextNode): WikiLinkContentNode => {
      return $createWikiLinkContentNode(textNode.getTextContent());
    },
    [],
  );

  const getWikiLinkMatch = useCallback((text: string): EntityMatch | null => {
    const matchArr = REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    const wikiLinkLength = matchArr[0].length;
    const startOffset = matchArr.index;
    const endOffset = startOffset + wikiLinkLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useEffect(() => {
    return mergeRegister(
      ...registerLexicalTextEntity(
        editor, getWikiLinkMatch, WikiLinkContentNode, createWikiLinkContentNode,
      ),
    );
  }, [createWikiLinkContentNode, editor, getWikiLinkMatch]);

  return null;
}