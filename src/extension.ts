import * as vscode from "vscode";

let previousPositions: vscode.Position[] = [];
let decorationType: vscode.TextEditorDecorationType | undefined;
let minimapDecorationType: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {
  if (vscode.window.activeTextEditor) {
    setupListeners(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        setupListeners(editor);
      }
    })
  );

  let disposable = vscode.commands.registerCommand(
    "last-pointer.highlightPreviousPosition",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        if (previousPositions.length > 0) {
          const previousPosition =
            previousPositions[previousPositions.length - 1];
          const line = editor.document.lineAt(previousPosition.line);
          editor.revealRange(line.range, vscode.TextEditorRevealType.InCenter);
          vscode.window.showTextDocument(editor.document);
          highlightLine(editor, line);
        }
      }
    }
  );

  const onDidChangeTextEditorSelectionDisposable =
    vscode.window.onDidChangeTextEditorSelection((event) => {
      highlighter(event.textEditor, event);
    });

  context.subscriptions.push(
    disposable,
    onDidChangeTextEditorSelectionDisposable
  );
}

export const highlighter = (
  editor: vscode.TextEditor,
  event: vscode.TextEditorSelectionChangeEvent
) => {
  if (event.textEditor === editor && event.selections.length > 0) {
    const currentPosition = event.selections[0].active;
    if (
      currentPosition &&
      previousPositions.length > 0 &&
      !currentPosition.isEqual(previousPositions[previousPositions.length - 1])
    ) {
      const previousPosition = previousPositions[previousPositions.length - 1];
      const line = editor.document.lineAt(previousPosition.line);
      highlightLine(editor, line);
      previousPositions.push(currentPosition);
    } else {
      previousPositions = [currentPosition];
    }
  }
};

const setupListeners = (editor: vscode.TextEditor) => {
  vscode.window.onDidChangeTextEditorSelection((event) => {
    highlighter(editor, event);
  });
};

const highlightLine = (editor: vscode.TextEditor, line: vscode.TextLine) => {
  if (decorationType) {
    editor.setDecorations(decorationType, []);
  }

  if (minimapDecorationType) {
    editor.setDecorations(minimapDecorationType, []);
  }

  decorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: "blue",
  });

  minimapDecorationType = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: "blue",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  const range = line.range;

  editor.setDecorations(decorationType, [range]);
  editor.setDecorations(minimapDecorationType, [range]);
};

export function deactivate() {}
