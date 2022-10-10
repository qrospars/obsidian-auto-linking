import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	ViewUpdate,
	PluginSpec,
	PluginValue,
	EditorView,
	ViewPlugin,
	WidgetType,
} from "@codemirror/view";

export class EmojiWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("span");

		div.innerText = "👉";

		return div;
	}
}

class HighlightPlugin implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
					console.log(node.from, node.to);
					if (node.type.name.startsWith("list")) {
						// Position of the '-' or the '*'.
						const listCharFrom = node.from - 2;
						builder.add(
							listCharFrom,
							listCharFrom + 5,
							// Decoration.replace({
							// 	widget: new EmojiWidget(),
							// }),
							Decoration.mark({
								class: "highlighted",
								tagName: "mark",
								attributes: {
									onClick: "clickedHighlighted()",
								},
							})
						);
					}
				},
			});
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<HighlightPlugin> = {
	decorations: (value: HighlightPlugin) => value.decorations,
};

export const highlightPlugin = ViewPlugin.fromClass(
	HighlightPlugin,
	pluginSpec
);
