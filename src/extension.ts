import * as vscode from 'vscode';
import { replaceAll } from './helpers'; 

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remify.remify', () => {
		const editor = vscode.window.activeTextEditor;
		let selectedText = editor?.document.getText(editor.selection) as string;
		
		if (!selectedText) {
			return;
		}

		const initialText = selectedText;

		let replacements: any = [];
		const matches = selectedText.matchAll(/\d*\.?\d+(?:(px)|%)/g);
		let entriesCounter = 0;
		let batchCallCounter = 0;

		for (let hit of matches) {
			const text = hit[0];
			entriesCounter++;
			
			if (!replacements[text]) {
				let value = parseInt(text, 10);
				const unit = text.split(value + '')[1].toLocaleLowerCase();

				if (unit) {
					let supported = false;
					switch(unit) {
						case 'px':
							value = value * 0.0625;
							supported = true;
						break;
						default:
							console.log('Unsupported unit', unit);
						break;
					}

					if (supported) {
						replacements[text] = true;
						selectedText = replaceAll(selectedText, text, value + 'rem');
						batchCallCounter++;
					}
				}
			}
		}

		if (initialText !== selectedText) {
			editor?.edit((edit) => {
				edit.replace(editor.selection, selectedText);
			});
			console.log(`${batchCallCounter} batch edits, ${entriesCounter} entries updated.`);
		}
		else {
			console.log('No changes.');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
