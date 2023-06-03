import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  CLEAR_HISTORY_COMMAND,
  EditorState,
} from 'lexical';
import {useEffect, useState} from 'react';

import './App.css';
import './ibm-plex-mono.css';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {NodeEventPlugin} from '@lexical/react/LexicalNodeEventPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagNode } from './nodes/HashtagNode';
import { HeadingNode } from './nodes/HeadingNode';
import { HashtagPlugin } from './plugins/HashtagPlugin';
import { HeadingPlugin } from './plugins/HeadingPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import { AutoLinkNode } from '@lexical/link';
import { WikiLinkContentNode } from './nodes/WikiLinkContentNode';
import { WikiLinkPlugin } from './plugins/WikilinkPlugin';
import { WikiLinkPunctuationNode } from './nodes/WikiLinkPunctuationNode';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  hashtag: 'hashtag',
  link: 'link',
  s_heading: 's_heading', // heading seems to be a reserved word
}


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

const PlainTextStateExchangePlugin = ({text}: {text: string}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      // Get the RootNode from the EditorState
      const root = $getRoot();
      root.clear();
      // Create a new ParagraphNode
      const paragraphNode = $createParagraphNode();

      // Create a new TextNode
      const textNode = $createTextNode(text);

      // after setting the state, we need to mark the text node dirty, because
      // it is not transformed yet by the registered node transforms
      // https://lexical.dev/docs/concepts/transforms
      textNode.markDirty();

      // Append the text node to the paragraph
      paragraphNode.append(textNode);

      // Finally, append the paragraph to the root
      root.append(paragraphNode);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    });
  }, [editor, text]);

  return null;
}

export const App = () => {
  const initialConfig = {
    namespace: 'MyEditor', 
    theme,
    onError,
    nodes: [
      HashtagNode,
      AutoLinkNode,
      HeadingNode,
      WikiLinkContentNode,
      WikiLinkPunctuationNode,
    ],
  };

  const [notes, setNotes] = useState([
    `This is an example note.

# Heading
It contains a weblink to http://en.wikipedia.org
It also contains a /slashlink and a [[Wikilink]]. Clicks on those can be handled with custom event handlers.
There is also a #hashtag`,
"Note 2 text",
  ]);

  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [text, setText] = useState(notes[0]);
  const [currentEditorText, setCurrentEditorText] = useState(text);

  return (
    <>
      <h1>Subtext Web Editor PoC</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <PlainTextStateExchangePlugin text={text}/>
        <OnChangePlugin onChange={
          (editorState: EditorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const root = $getRoot();
              setCurrentEditorText(root.getTextContent());
            });
          }
        } />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
        <HashtagPlugin />
        <HeadingPlugin />
        <LinkPlugin />
        <WikiLinkPlugin />
        <NodeEventPlugin
          nodeType={AutoLinkNode}
          eventType='click'
          eventListener={(e: Event) => {
            const isSlashlink = (str: string) => {
              return str.startsWith("@") || str.startsWith("/");
            }
            const isWikilink = (str: string) => {
              return str.startsWith("[[") && str.endsWith("]]");
            }
            if (!(e && e.target)) return;
            const link = (e.target as HTMLElement).innerText;
            if (isSlashlink(link)) {
              console.log("Click on slashlink: " + link);
            } else if (isWikilink(link)) {
              console.log("Click on wikilink: " + link);
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
}