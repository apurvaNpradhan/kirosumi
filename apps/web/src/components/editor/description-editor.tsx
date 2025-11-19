import "./tiptap.css";
import type { Editor, JSONContent } from "@/components/editor";
import {
	EditorBubbleMenu,
	EditorCharacterCount,
	EditorClearFormatting,
	EditorFloatingMenu,
	EditorFormatBold,
	EditorFormatCode,
	EditorFormatItalic,
	EditorFormatStrike,
	EditorFormatSubscript,
	EditorFormatSuperscript,
	EditorFormatUnderline,
	EditorLinkSelector,
	EditorNodeBulletList,
	EditorNodeCode,
	EditorNodeHeading1,
	EditorNodeHeading2,
	EditorNodeHeading3,
	EditorNodeOrderedList,
	EditorNodeQuote,
	EditorNodeTable,
	EditorNodeTaskList,
	EditorNodeText,
	EditorProvider,
	EditorSelector,
	EditorTableColumnAfter,
	EditorTableColumnBefore,
	EditorTableColumnDelete,
	EditorTableColumnMenu,
	EditorTableDelete,
	EditorTableFix,
	EditorTableGlobalMenu,
	EditorTableHeaderColumnToggle,
	EditorTableHeaderRowToggle,
	EditorTableMenu,
	EditorTableMergeCells,
	EditorTableRowAfter,
	EditorTableRowBefore,
	EditorTableRowDelete,
	EditorTableRowMenu,
	EditorTableSplitCell,
} from "@/components/editor";

interface Props {
	content: JSONContent;
	onChange: (content: JSONContent) => void;
}

const DescriptionEditor = ({ content, onChange }: Props) => {
	const handleUpdate = ({ editor }: { editor: Editor }) => {
		const json = editor.getJSON();
		onChange(json);
		console.log(JSON.stringify(json));
	};

	return (
		<EditorProvider
			className="h-full w-full overflow-y-auto"
			content={content}
			onUpdate={handleUpdate}
			placeholder="Add a description..."
		>
			{/*<EditorFloatingMenu>
        <EditorNodeHeading1 hideName />
        <EditorNodeBulletList hideName />
        <EditorNodeQuote hideName />
        <EditorNodeCode hideName />
        <EditorNodeTable hideName />
      </EditorFloatingMenu>*/}
			<EditorBubbleMenu>
				<EditorSelector title="Text">
					<EditorNodeText />
					<EditorNodeHeading1 />
					<EditorNodeHeading2 />
					<EditorNodeHeading3 />
					<EditorNodeBulletList />
					<EditorNodeOrderedList />
					<EditorNodeTaskList />
					<EditorNodeQuote />
					<EditorNodeCode />
				</EditorSelector>
				<EditorSelector title="Format">
					<EditorFormatBold />
					<EditorFormatItalic />
					<EditorFormatUnderline />
					<EditorFormatStrike />
					<EditorFormatCode />
					<EditorFormatSuperscript />
					<EditorFormatSubscript />
				</EditorSelector>
				<EditorLinkSelector />
				<EditorClearFormatting />
			</EditorBubbleMenu>
			<EditorTableMenu>
				<EditorTableColumnMenu>
					<EditorTableColumnBefore />
					<EditorTableColumnAfter />
					<EditorTableColumnDelete />
				</EditorTableColumnMenu>
				<EditorTableRowMenu>
					<EditorTableRowBefore />
					<EditorTableRowAfter />
					<EditorTableRowDelete />
				</EditorTableRowMenu>
				<EditorTableGlobalMenu>
					<EditorTableHeaderColumnToggle />
					<EditorTableHeaderRowToggle />
					<EditorTableDelete />
					<EditorTableMergeCells />
					<EditorTableSplitCell />
					<EditorTableFix />
				</EditorTableGlobalMenu>
			</EditorTableMenu>
		</EditorProvider>
	);
};

export default DescriptionEditor;
