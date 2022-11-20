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

		if (!editor || !editor.selections || editor.selections.length === 0) {
			vscode.window.showInformationMessage('Select text containing non-rem units.');
			return;
		}

		const pattern = /\d*\.?\d+(?:(px|pt|in|mm|cm|pc)|%)/g;
		const entries = editor.selections
			.map((selection) => ({ selection, text: editor.document.getText(selection) as string}))
			.reduce((result, entry) => {
				if (entry.text) {
					let editText = entry.text;
					const handledEntries: any = [];

					const matches = entry.text.matchAll(pattern);
					for (const [text, unitName] of matches) {
						const unit = supportedUnits.get(unitName);

						if (!handledEntries[text] && unit) {
							handledEntries[text] = true;
							editText = replaceAll(editText, text, (parseInt(text, 10) * unit.multiplier) + 'rem');
						}
					}

					if (editText !== entry.text) {
						result.push({selection: entry.selection, editText});
					}
				}

				return result;
			}, [] as { selection: vscode.Selection, editText: string }[]);

		if (entries.length > 0) {
			editor.edit((edit) => {
				for (const editEntry of entries) {
					edit.replace(editEntry.selection, editEntry.editText);
				}
			});
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
