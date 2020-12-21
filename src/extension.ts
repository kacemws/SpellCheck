// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fetch from "node-fetch";
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function createQuickPick(
  editor: vscode.TextEditor,
  errors: Array<any>,
  index: number,
  text: string
) {
  const quickPick = vscode.window.createQuickPick();
  quickPick.items = errors[index].suggestions.map((suggestion: String) => ({
    label: suggestion,
  }));

  quickPick.onDidChangeSelection(([item]) => {
    if (item) {
      let aux = text.replace(errors[index].word, item.label);
      vscode.window.showInformationMessage(item.label);
      quickPick.dispose();
      if (errors[index + 1]) {
        createQuickPick(editor, errors, index + 1, aux);
      } else {
        editor.edit((edit: vscode.TextEditorEdit) => {
          edit.replace(editor.selection, aux);
        });
        vscode.window.showInformationMessage(
          "Update done, keep up with the good work ! "
        );
      }
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, you activated "Spell Check" ');

  let disposable = vscode.commands.registerCommand(
    "spellcheck.check",
    async () => {
      const editor = vscode.window.activeTextEditor; // the text editor where we would choose a word
      if (!editor) {
        vscode.window.showInformationMessage("No editor detected");
        return;
      }

      const text = editor.document.getText(editor.selection);
      try {
        const response = await fetch(
          "https://jspell-checker.p.rapidapi.com/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-key":
                "469d83cbafmsh6316e64efac12d7p1dc6dajsn422edae87477",
              "x-rapidapi-host": "jspell-checker.p.rapidapi.com",
              useQueryString: "true",
            },
            body: JSON.stringify({
              language: "enUS",
              fieldvalues: text,
              config: {
                forceUpperCase: false,
                ignoreIrregularCaps: false,
                ignoreFirstCaps: true,
                ignoreNumbers: true,
                ignoreUpper: false,
                ignoreDouble: false,
                ignoreWordsWithNumbers: true,
              },
            }),
          }
        );
        const { spellingErrorCount, elements } = await response.json();
        if (spellingErrorCount == 0) {
          console.log("no errors found");
          vscode.window.showInformationMessage(
            "no errors found ! well done padwan"
          );
          return;
        } else {
          vscode.window.showInformationMessage(
            `Found ${spellingErrorCount} error(s) ! `
          );
          createQuickPick(editor, elements[0].errors, 0, text);
        }
      } catch (error) {
        console.log(error);
      }

      //   const quickPick = vscode.window.createQuickPick();

      //   quickPick.items = data.elements.map((x: any) => ({ label: x.word }));
      //   quickPick.onDidChangeSelection(([item]) => {
      //     if (item) {
      //       // vscode.window.showInformationMessage(item.label);
      //       editor.edit(edit => {
      //         edit.replace(editor.selection, item.label);
      //       });
      //       quickPick.dispose();
      //     }
      //   });
      //   quickPick.onDidHide(() => quickPick.dispose());
      //   quickPick.show();
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
