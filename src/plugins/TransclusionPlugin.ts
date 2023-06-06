import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { TransclusionNode } from "../nodes/TransclusionNode";
import SubtextNode from "../nodes/SubtextNode";
import { COMMAND_PRIORITY_EDITOR, INSERT_PARAGRAPH_COMMAND, LexicalEditor } from "lexical";

const registerSubtextNodeTransform = (editor: LexicalEditor) => { console.log("register")
  editor.registerNodeTransform(SubtextNode, (node: SubtextNode) => {
    console.log("subtext node transform", node.getChildren());
  });
};

export default function TransclusionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TransclusionNode, SubtextNode])) {
      throw new Error('Transclusion plugin is missing required nodes');
    }

    return registerSubtextNodeTransform(
      editor,
    );
  }, [editor]);

  useEffect(() => {
    editor.registerNodeTransform(SubtextNode, (node: SubtextNode) => {
      console.log("subtext node transform", node.getChildren());
    });
  }, [editor]);

  
  useEffect(() => {
    return editor.registerCommand(
       INSERT_PARAGRAPH_COMMAND, 
       () => { console.log("inserting paragraph")
           return true;
       },
       COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  

  return null;
}

