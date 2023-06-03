/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createTextNode,
  $isTextNode,
  LexicalEditor,
  TextNode,
} from 'lexical';
import { EntityMatch } from '@lexical/text';
import {
  $createWikiLinkContentNode,
  $isWikiLinkContentNode,
  WikiLinkContentNode,
} from '../nodes/WikiLinkContentNode';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';
import {mergeRegister} from '@lexical/utils';
import { $createWikiLinkPunctuationNode, $isWikiLinkPunctuationNode, WikiLinkPunctuationNode } from '../nodes/WikiLinkPunctuationNode';


const getWikiLinkMatch = (text: string): EntityMatch | null => {
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
};


function registerWikilinkTransforms(
  editor: LexicalEditor,
): Array<() => void> {
  const replaceWithSimpleText = (node: TextNode): void => {
    const textNode = $createTextNode(node.getTextContent());
    textNode.setFormat(node.getFormat());
    node.replace(textNode);
  };

  const textNodeTransform = (node: TextNode): void => {
    if (!node.isSimpleText()) {
      return;
    }

    const prevSibling = node.getPreviousSibling();
    let text = node.getTextContent();
    let currentNode = node;
    let match: EntityMatch | null;
/*
    if ($isTextNode(prevSibling)) { 
      const previousText = prevSibling.getTextContent();
      const combinedText = previousText + text;
      const prevMatch = getMatch(combinedText);

      if (
        $isWikiLinkPunctuationNode(prevSibling)
        && $isWikiLinkContentNode(prevSibling.getPreviousSibling())
        && $isWikiLinkPunctuationNode(prevSibling.getPreviousSibling()?.getPreviousSibling())
      ) {
        if (prevMatch === null || getMode(prevSibling) !== 0) {
          replaceWithSimpleText(prevSibling);
          replaceWithSimpleText(prevSibling.getPreviousSibling() as TextNode);
          replaceWithSimpleText(prevSibling.getPreviousSibling()?.getPreviousSibling() as TextNode);
          return;
        } else {
          const diff = prevMatch.end - previousText.length;

          if (diff > 0) { // entity got bigger
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
*/
    // eslint-disable-next-line no-constant-condition
    while (true) {
      match = getWikiLinkMatch(text);
      const nextText = match === null ? '' : text.slice(match.end);
      text = nextText;

      if (nextText !== '') {
        const nextMatch = getWikiLinkMatch(nextText);

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

      const wikilinkTextContent = nodeToReplace.getTextContent().slice(
        2,
        nodeToReplace.getTextContent().length - 2,
      );
      const replacementNode1 = $createWikiLinkPunctuationNode("[[");
      const replacementNode2 = $createWikiLinkContentNode(wikilinkTextContent);
      const replacementNode3 = $createWikiLinkPunctuationNode("]]");

      nodeToReplace.insertAfter(replacementNode1);
      replacementNode1.insertAfter(replacementNode2);
      replacementNode2.insertAfter(replacementNode3);
      nodeToReplace.remove();
    }
  };

  const reverseWikilinkContentNodeTransform = (
    node: WikiLinkContentNode
  ) => {
    // TODO: check if punctuation and content is still intact
    // if not: transform all three into simple text nodes
    const text = node.getTextContent();
    const prevSibling = node.getPreviousSibling();
    const nextSibling = node.getNextSibling();

    if (
      text.length === 0
      || !$isWikiLinkPunctuationNode(prevSibling)
      || prevSibling?.getTextContent() !== "[["
      || !$isWikiLinkPunctuationNode(nextSibling)
      || nextSibling?.getTextContent() !== "]]"
    ) { console.log("Reverse content node");
      replaceWithSimpleText(node);

      if ($isTextNode(prevSibling) && prevSibling.isTextEntity()) {
        replaceWithSimpleText(prevSibling);
      }

      if ($isTextNode(nextSibling) && nextSibling.isTextEntity()) {
        replaceWithSimpleText(nextSibling);
      }
    }
  };


  const reverseWikilinkPunctuationNodeTransform = (
    node: WikiLinkPunctuationNode
  ) => {
    // TODO: check if punctuation and content is still intact
    // if not: transform all three into simple text nodes

    const isOpeningNode = node.getTextContent() === "[[";
    const isClosingNode = node.getTextContent() === "]]";

    if (!(isOpeningNode || isClosingNode)) {
      replaceWithSimpleText(node);
      return;
    }

    let openingNode;
    let contentNode;
    let closingNode;

    if (isOpeningNode) {
      openingNode = node;
      contentNode = node.getNextSibling();
      closingNode = contentNode?.getNextSibling();
    } else if (isClosingNode) {
      closingNode = node;
      contentNode = node.getPreviousSibling();
      openingNode = contentNode?.getPreviousSibling();
    }

    if (
      openingNode?.getTextContent() !== "[["
      || closingNode?.getTextContent() !== "]]"
    ) {
      $isWikiLinkPunctuationNode(openingNode) && replaceWithSimpleText(openingNode);
      $isWikiLinkContentNode(contentNode) && replaceWithSimpleText(contentNode);
      $isWikiLinkPunctuationNode(closingNode) && replaceWithSimpleText(closingNode);
    }
  };

  const removePlainTextTransform = editor.registerNodeTransform(
    TextNode,
    textNodeTransform,
  );

  const removeReverseWikilinkContentNodeTransform
    = editor.registerNodeTransform<WikiLinkContentNode>(
      WikiLinkContentNode,
      reverseWikilinkContentNodeTransform,
    );
  const removeReverseWikilinkPunctuationNodeTransform
    = editor.registerNodeTransform<WikiLinkPunctuationNode>(
      WikiLinkPunctuationNode,
      reverseWikilinkPunctuationNodeTransform,
    );

  return [
    removePlainTextTransform,
    removeReverseWikilinkContentNodeTransform,
    removeReverseWikilinkPunctuationNodeTransform,
  ];
}



const REGEX = /\[\[.+\]\]/;

export function WikiLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([WikiLinkContentNode, WikiLinkPunctuationNode])) {
      throw new Error('WikiLinkPlugin: WikiLinkNodes not registered on editor');
    }

    return mergeRegister(
      ...registerWikilinkTransforms(
        editor,
      ),
    );
  }, [editor]);

  return null;
}