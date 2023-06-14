/* eslint-disable max-len */
import { useState } from "react";

import "./App.css";
import "./ibm-plex-sans.css";
import "./ibm-plex-mono.css";

import { Editor } from "./Editor";


export const App = () => {
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
      <Editor
        onChange={(text) => {
          setCurrentEditorText(text);
        }}
        text={text}
      />
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
