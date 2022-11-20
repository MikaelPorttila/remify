import * as vscode from 'vscode';
import { replaceAll } from './helpers'; 

export function activate(context: vscode.ExtensionContext) {
	const supportedUnits = new Map([
		['px', { multiplier: 0.0625 }],
		['pt', { multiplier: 0.0833 }],
		['in', { multiplier: 6 }],
		['mm', { multiplier: 0.2362 }],
		['cm', { multiplier: 2.3622 }],
		['pc', { multiplier: 7.2890 }]
	]);

	let disposable = vscode.commands.registerCommand('remify.remify', () => {
		const editor = vscode.window.activeTextEditor;
		let selectedText = editor?.document.getText(editor.selection) as string;
		
		if (!selectedText) {
			vscode.window.showInformationMessage('Select text containing non-rem units.');
			return;
		}

		const initialText = selectedText;

		let replacements: any = [];
		const matches = selectedText.matchAll(/\d*\.?\d+(?:(px|pt|in|mm|cm|pc)|%)/g);
		let entriesCounter = 0;
		let batchCallCounter = 0;

		for (let hit of matches) {
			const text = hit[0];
			entriesCounter++;
			
			if (!replacements[text]) {
				let value = parseInt(text, 10);
				const unit = text.split(value + '')[1].toLocaleLowerCase();
				const unitFormat = supportedUnits.get(unit);

				if (unitFormat) {
					value = value * unitFormat.multiplier;
					replacements[text] = true;
					selectedText = replaceAll(selectedText, text, value + 'rem');
					batchCallCounter++;
				} else {
					console.log('Unsupported unit', unit);
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
