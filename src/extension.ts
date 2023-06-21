import * as vscode from "vscode";

let previousPositions: vscode.Position[] = [];
let decorationType: vscode.TextEditorDecorationType | undefined;
let minimapDecorationType: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {
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
      const editor = event.textEditor;
      if (editor && event.selections.length > 0) {
        const currentPosition = event.selections[0].active;
        if (
          currentPosition &&
          previousPositions.length > 0 &&
          !currentPosition.isEqual(
            previousPositions[previousPositions.length - 1]
          )
        ) {
          const previousPosition =
            previousPositions[previousPositions.length - 1];
          const line = editor.document.lineAt(previousPosition.line);
          highlightLine(editor, line);
          previousPositions.push(currentPosition);
        } else {
          previousPositions = [currentPosition];
        }
      }
    });

  context.subscriptions.push(
    disposable,
    onDidChangeTextEditorSelectionDisposable
  );
}

function highlightLine(editor: vscode.TextEditor, line: vscode.TextLine) {
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
}

export function deactivate() {}
