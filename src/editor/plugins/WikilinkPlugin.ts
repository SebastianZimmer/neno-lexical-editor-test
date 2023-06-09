/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createTextNode,
  $getSelection,
  $isTextNode,
  LexicalEditor,
  TextNode,
} from "lexical";
import { EntityMatch } from "@lexical/text";
import {
  $createWikiLinkContentNode,
  $isWikiLinkContentNode,
  WikiLinkContentNode,
} from "../nodes/WikiLinkContentNode";
import {
  useLexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { mergeRegister } from "@lexical/utils";
import {
  $createWikiLinkPunctuationNode,
  $isWikiLinkPunctuationNode,
  WikiLinkPunctuationNode,
} from "../nodes/WikiLinkPunctuationNode";


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


    while (true) {
      match = getWikiLinkMatch(text);
      const nextText = match === null ? "" : text.slice(match.end);
      text = nextText;

      if (nextText !== "") {
        const nextMatch = getWikiLinkMatch(nextText);

        if (nextMatch !== null && nextMatch.start === 0) {
          return;
        }
      }

      if (match === null) {
        return;
      }

      if (
        match.start === 0
        && $isTextNode(prevSibling)
        && prevSibling.isTextEntity()
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
      const replacementNode1 = $createWikiLinkPunctuationNode(false);
      const replacementNode2 = $createWikiLinkContentNode(wikilinkTextContent);
      const replacementNode3 = $createWikiLinkPunctuationNode(true);

      nodeToReplace.insertAfter(replacementNode1);
      replacementNode1.insertAfter(replacementNode2);
      replacementNode2.insertAfter(replacementNode3);

      // restore selection in new nodes
      const selection = $getSelection();
      let selectionOffset = NaN;
      // check if original selection was inside node to be removed
      if (
        selection
        && "focus" in selection
        && selection.focus.key === nodeToReplace.getKey()
      ) {
        selectionOffset = selection.focus.offset;
      }
      nodeToReplace.remove();

      // if selection was in old node that was removed, restore selection
      // in new nodes
      if (!isNaN(selectionOffset)) {
        if (selectionOffset < 3) {
          replacementNode1.select(selectionOffset, selectionOffset);
        } else if (
          selectionOffset > nodeToReplace.getTextContent().length - 2
        ) {
          const newNodeOffset
            = selectionOffset - replacementNode2.getTextContent().length - 2;
          replacementNode3.select(newNodeOffset, newNodeOffset);
        } else {
          const newNodeOffset
            = selectionOffset - 2;
          replacementNode2.select(newNodeOffset, newNodeOffset);
        }
      }
    }
  };

  const reverseWikilinkContentNodeTransform = (
    node: WikiLinkContentNode,
  ) => {
    if (!node.getParent()) return;
    // check if punctuation and content is still intact
    // if not: transform all three into simple text nodes
    const prevSibling = node.getPreviousSibling();
    const nextSibling = node.getNextSibling();

    if (!prevSibling?.getParent()) return;
    if (!nextSibling?.getParent()) return;

    if (
      !$isWikiLinkPunctuationNode(prevSibling)
      || !$isWikiLinkPunctuationNode(nextSibling)
      || !node.isValid()
      || !prevSibling.isValid()
      || !nextSibling.isValid()
    ) {
      replaceWithSimpleText(node);

      $isWikiLinkPunctuationNode(prevSibling)
        && replaceWithSimpleText(prevSibling);

      $isWikiLinkPunctuationNode(nextSibling)
        && replaceWithSimpleText(nextSibling);
    }
  };


  const reverseWikilinkPunctuationNodeTransform = (
    node: WikiLinkPunctuationNode,
  ) => {
    // check if punctuation and content is still intact
    // if not: transform back to simple text node
    if (!node.getParent()) return;

    const hasAccompanyingContentNode = node.__isClosing
      ? $isWikiLinkContentNode(node.getPreviousSibling())
      : $isWikiLinkContentNode(node.getNextSibling());

    if (!node.isValid() || (!hasAccompanyingContentNode)) {
      replaceWithSimpleText(node);
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


const REGEX = /\[\[[^[\]]+\]\]/;

export function WikiLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([WikiLinkContentNode, WikiLinkPunctuationNode])) {
      throw new Error("WikiLinkPlugin: WikiLinkNodes not registered on editor");
    }

    return mergeRegister(
      ...registerWikilinkTransforms(
        editor,
      ),
    );
  }, [editor]);

  return null;
}
