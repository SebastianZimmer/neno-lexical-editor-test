/* eslint-disable max-len */
import {
  $getRoot,
  CLEAR_HISTORY_COMMAND,
  EditorState,
} from "lexical";
import { useEffect, useState } from "react";

import "./App.css";
import "./ibm-plex-sans.css";
import "./ibm-plex-mono.css";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
  useLexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagNode } from "./nodes/HashtagNode";
import { HeadingNode } from "./nodes/HeadingNode";
import { HashtagPlugin } from "./plugins/HashtagPlugin";
import { HeadingPlugin } from "./plugins/HeadingPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import { AutoLinkNode } from "@lexical/link";
import { WikiLinkContentNode } from "./nodes/WikiLinkContentNode";
import { WikiLinkPlugin } from "./plugins/WikilinkPlugin";
import { WikiLinkPunctuationNode } from "./nodes/WikiLinkPunctuationNode";
import { BoldNode } from "./nodes/BoldNode";
import { BoldPlugin } from "./plugins/BoldPlugin";
import { TransclusionNode } from "./nodes/TransclusionNode";
import TransclusionPlugin from "./plugins/TransclusionPlugin";
import { SubtextPlugin } from "./plugins/SubtextPlugin";
import setSubtext from "./utils/setSubtext";
import getSubtextFromEditor from "./utils/getSubtextFromEditor";
import { InlineCodeNode } from "./nodes/InlineCodeNode";
import { InlineCodePlugin } from "./plugins/InlineCodePlugin";

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
  hashtag: "hashtag",
  link: "link",
  s_heading: "s_heading", // heading seems to be a reserved word
  wikiLinkPunctuation: "wikilink-punctuation",
  wikiLinkContent: "wikilink-content",
  bold: "bold",
  subtext: "subtext",
  inlineCode: "inline-code",
};


// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: unknown) {
  console.error(error);
}

/*
Convention:
Every subtext block is rendered as a normal editor ParagraphNode.
We cannot extend ParagraphNode to some BlockNode, because then we cannot make
use of RangeSelection.insertParagraph(). RangeSelection.insertNodes([blockNode])
works differently.
*/

const PlainTextStateExchangePlugin = ({ text }: { text: string }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      setSubtext(root, text);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      // go inside the first paragraph node (this prevents creating another
      // paragraph node when pressing enter immediately after load)
      root.getFirstChild()?.selectStart();
    });
  }, [editor, text]);

  return null;
};


export const App = () => {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [
      HashtagNode,
      AutoLinkNode,
      HeadingNode,
      WikiLinkContentNode,
      WikiLinkPunctuationNode,
      BoldNode,
      TransclusionNode,
      InlineCodeNode,
    ],
  };

  const [notes, setNotes] = useState([
    `This is an example note. Feel free to edit it.

# Gardening counterintuitive ideas
We should take special care of *counterintuitive ideas* when gardening them. Kenneth Stanley talks in https://overcast.fm/+OxebA5HTY about /counterintuitive-ideas
[[Ben Follington]] has an inspiring /guide-to-gardening-ideas 

#ideas`,
    "Note 2 text",
  ]);

  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [text, setText] = useState(notes[0]);
  const [currentEditorText, setCurrentEditorText] = useState(text);

  return (
    <>
      <h1>Subtext Web Editor PoC</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <SubtextPlugin
          placeholder={null}
          contentEditable={<ContentEditable />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <PlainTextStateExchangePlugin text={text}/>
        <OnChangePlugin onChange={
          (editorState: EditorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const root = $getRoot();
              setCurrentEditorText(getSubtextFromEditor(root));
            });
          }
        } />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
        <HashtagPlugin />
        <BoldPlugin />
        <HeadingPlugin />
        <InlineCodePlugin />
        <LinkPlugin />
        <WikiLinkPlugin />
        <TransclusionPlugin />
        <NodeEventPlugin
          nodeType={AutoLinkNode}
          eventType="click"
          eventListener={(e: Event) => {
            const isSlashlink = (str: string) => {
              return str.startsWith("@") || str.startsWith("/");
            };
            if (!(e && e.target)) return;
            const link = (e.target as HTMLElement).innerText;
            if (isSlashlink(link)) {
              // eslint-disable-next-line no-console
              console.log("Click on slashlink: " + link);
            } else {
              window.open(link);
            }
          }}
        />
      </LexicalComposer>
      <button
        onClick={() => {
          setText(notes[0]);
          setActiveNoteIndex(0);
        }}
      >Load Note 1</button>
      <button
        onClick={() => {
          setText(notes[1]);
          setActiveNoteIndex(1);
        }}
      >Load Note 2</button>
      <button
        onClick={() => {
          const newNotes = [...notes];
          newNotes[activeNoteIndex] = currentEditorText;
          setNotes(newNotes);
        }}
      >Save active note</button>
    </>
  );
};
