# Categorized VS Code Keybindings

This document lists all your keybindings from `keybindings.json`, grouped by category. Each entry includes the key, command, and when clause (if present).

---

## Navigation

| Key | Name | Command | When |
|-----|------|---------|------|
| [[down.a]] | Move Lines Down (remove) | [[editor.action.moveLinesDownAction]] | [[editorTextFocus]] && ![[editorReadonly]] |
| [[pagedown.a]] | Scroll Page Down (remove) | [[scrollPageDown]] | [[textInputFocus]] |
| [[pagedown.a]] | Next Editor In Group | [[workbench.action.nextEditorInGroup]] |  |
| [[pageup.a]] | Scroll Page Up (remove) | [[scrollPageUp]] | [[textInputFocus]] |
| [[pageup.a]] | Previous Editor In Group | [[workbench.action.previousEditorInGroup]] |  |
| [[up.a]] | Move Lines Up (remove) | [[editor.action.moveLinesUpAction]] | [[editorTextFocus]] && ![[editorReadonly]] |
| [[0.c]] | Toggle Bookmark 0 | [[numberedBookmarks.toggleBookmark0]] | [[editorTextFocus]] |
| [[1.c]] | Toggle Bookmark 1 | [[numberedBookmarks.toggleBookmark1]] | [[editorTextFocus]] |
| [[2.c]] | Toggle Bookmark 2 | [[numberedBookmarks.toggleBookmark2]] | [[editorTextFocus]] |
| [[3.c]] | Toggle Bookmark 3 | [[numberedBookmarks.toggleBookmark3]] | [[editorTextFocus]] |
| [[4.c]] | Toggle Bookmark 4 | [[numberedBookmarks.toggleBookmark4]] | [[editorTextFocus]] |
| [[5.c]] | Toggle Bookmark 5 | [[numberedBookmarks.toggleBookmark5]] | [[editorTextFocus]] |
| [[6.c]] | Toggle Bookmark 6 | [[numberedBookmarks.toggleBookmark6]] | [[editorTextFocus]] |
| [[7.c]] | Toggle Bookmark 7 | [[numberedBookmarks.toggleBookmark7]] | [[editorTextFocus]] |
| [[8.c]] | Toggle Bookmark 8 | [[numberedBookmarks.toggleBookmark8]] | [[editorTextFocus]] |
| [[9.c]] | Toggle Bookmark 9 | [[numberedBookmarks.toggleBookmark9]] | [[editorTextFocus]] |
| [[down.c]] | Move Lines Down (remove) | [[editor.action.moveLinesDownAction]] | [[editorTextFocus]] && ![[editorReadonly]] |
| [[down.c]] | Move Lines Down (remove) | [[scrollLineDown]] | [[textInputFocus]] |
| [[down.c]] | Space Block Jumper Down | [[spaceBlockJumper.moveDown]] | [[editorTextFocus]] |
| [[0.cs]] | Toggle Bookmark 0 (remove) | [[numberedBookmarks.toggleBookmark0]] | [[editorTextFocus]] |
| [[1.cs]] | Toggle Bookmark 1 (remove) | [[numberedBookmarks.toggleBookmark1]] | [[editorTextFocus]] |
| [[2.cs]] | Toggle Bookmark 2 (remove) | [[numberedBookmarks.toggleBookmark2]] | [[editorTextFocus]] |
| [[3.cs]] | Toggle Bookmark 3 (remove) | [[numberedBookmarks.toggleBookmark3]] | [[editorTextFocus]] |
| [[4.cs]] | Toggle Bookmark 4 (remove) | [[numberedBookmarks.toggleBookmark4]] | [[editorTextFocus]] |
| [[5.cs]] | Toggle Bookmark 5 (remove) | [[numberedBookmarks.toggleBookmark5]] | [[editorTextFocus]] |
| [[6.cs]] | Toggle Bookmark 6 (remove) | [[numberedBookmarks.toggleBookmark6]] | [[editorTextFocus]] |
| [[7.cs]] | Toggle Bookmark 7 (remove) | [[numberedBookmarks.toggleBookmark7]] | [[editorTextFocus]] |
| [[8.cs]] | Toggle Bookmark 8 (remove) | [[numberedBookmarks.toggleBookmark8]] | [[editorTextFocus]] |
| [[9.cs]] | Toggle Bookmark 9 (remove) | [[numberedBookmarks.toggleBookmark9]] | [[editorTextFocus]] |
| [[down.sc]] | Cursor Down Select (remove) | [[cursorDownSelect]] | [[textInputFocus]] |
| [[up.sc]] | Cursor Up Select (remove) | [[cursorUpSelect]] | [[textInputFocus]] |
| [[up.c]] | Move Lines Up (remove) | [[editor.action.moveLinesUpAction]] | [[editorTextFocus]] && ![[editorReadonly]] |
| [[up.c]] | Move Lines Up (remove) | [[scrollLineUp]] | [[textInputFocus]] |
| [[down.as]] | Scroll Line Down | [[scrollLineDown]] | [[editorTextFocus]] |
| [[down.as]] | Space Block Jumper Select Down | [[spaceBlockJumper.selectDown]] | [[editorTextFocus]] && [[config.keyboardlayer.active]] |
| [[up.as]] | Scroll Line Up | [[scrollLineUp]] | [[editorTextFocus]] |
| [[up.as]] | Space Block Jumper Select Up | [[spaceBlockJumper.selectUp]] | [[editorTextFocus]] && [[config.keyboardlayer.active]] |
| [[backquote.]] [[3.]] | Jump To Bookmark 3 | [[numberedBookmarks.jumpToBookmark3]] | [[editorTextFocus]] |
| [[backquote.]] [[4.]] | Jump To Bookmark 4 | [[numberedBookmarks.jumpToBookmark4]] | [[editorTextFocus]] |
| [[backquote.]] [[5.]] | Jump To Bookmark 5 | [[numberedBookmarks.jumpToBookmark5]] | [[editorTextFocus]] |
| [[backquote.]] [[6.]] | Jump To Bookmark 6 | [[numberedBookmarks.jumpToBookmark6]] | [[editorTextFocus]] |
| [[backquote.]] [[7.]] | Jump To Bookmark 7 | [[numberedBookmarks.jumpToBookmark7]] | [[editorTextFocus]] |
| [[backquote.]] [[8.]] | Jump To Bookmark 8 | [[numberedBookmarks.jumpToBookmark8]] | [[editorTextFocus]] |
| [[backquote.]] [[9.]] | Jump To Bookmark 9 | [[numberedBookmarks.jumpToBookmark9]] | [[editorTextFocus]] |
| [[backquote.]] [[equals.]] | Clairvoyant Sight Token | [[clairvoyant.sightToken]] |  |
| [[backquote.]] [[semicolon.]] | Clairvoyant Sight Document | [[clairvoyant.sightDocument]] |  |
| [[backquote.]] [[slash.]] | Go To Method | [[workbench.action.gotoMethod]] |  |
| [[backquote.]] [[period.]] | Go To Symbol | [[workbench.action.gotoSymbol]] |  |
| [[backquote.]] [[home.c]] | AceJump Line | [[extension.aceJump.line]] |  |
| [[backquote.]] [[pagedown.c]] | Marker Next In Files | [[editor.action.marker.nextInFiles]] | [[editorFocus]] && ![[editorReadonly]] |
| [[backquote.]] [[pageup.c]] | Marker Prev In Files | [[editor.action.marker.prevInFiles]] | [[editorFocus]] && ![[editorReadonly]] |
| [[backquote.]] [[down.acs]] | Move Active Editor Group Down | [[workbench.action.moveActiveEditorGroupDown]] |  |
| [[backquote.]] [[left.acs]] | Move Active Editor Group Left | [[workbench.action.moveActiveEditorGroupLeft]] |  |
| [[backquote.]] [[right.acs]] | Move Active Editor Group Right | [[workbench.action.moveActiveEditorGroupRight]] |  |
| [[backquote.]] [[up.acs]] | Move Active Editor Group Up | [[workbench.action.moveActiveEditorGroupUp]] |  |
| [[backquote.]] [[space.c]] | Toggle Editor Widths | [[workbench.action.toggleEditorWidths]] |  |
| [[backquote.]] [[delete.]] | Close Panel | [[workbench.action.closePanel]] | [[terminalFocus]] |
| [[backquote.]] [[down.]] | Focus Below Group | [[workbench.action.focusBelowGroup]] |  |
| [[backquote.]] [[end.]] | AceJump MultiChar | [[extension.aceJump.multiChar]] |  |
| [[backquote.]] [[f10.]] | Focus Call Stack View | [[workbench.debug.action.focusCallStackView]] |  |
| [[backquote.]] [[f9.]] | Focus Breakpoints View | [[workbench.debug.action.focusBreakpointsView]] |  |
| [[backquote.]] [[left.]] | Focus Left Group | [[workbench.action.focusLeftGroup]] |  |
| [[backquote.]] [[pagedown.]] | Marker Next | [[editor.action.marker.next]] | [[editorFocus]] && ![[editorReadonly]] |
| [[backquote.]] [[pageup.]] | Marker Prev | [[editor.action.marker.prev]] | [[editorFocus]] && ![[editorReadonly]] |
| [[backquote.]] [[right.]] | Focus Right Group | [[workbench.action.focusRightGroup]] |  |
| [[backquote.]] [[down.s]] | Move Editor To Below Group | [[workbench.action.moveEditorToBelowGroup]] |  |
| [[backquote.]] [[left.s]] | Move Editor To Left Group | [[workbench.action.moveEditorToLeftGroup]] |  |
| [[backquote.]] [[right.s]] | Move Editor To Right Group | [[workbench.action.moveEditorToRightGroup]] |  |
| [[backquote.]] [[up.s]] | Move Editor To Above Group | [[workbench.action.moveEditorToAboveGroup]] |  |
| [[down.sa]] | Scroll Line Down | [[scrollLineDown]] | [[editorTextFocus]] |
| [[up.sa]] | Scroll Line Up | [[scrollLineUp]] | [[editorTextFocus]] |


| [[down.as]] | Scroll Line Down | [[scrollLineDown]] | [[editorTextFocus]] |
| [[down.as]] | Space Block Jumper Select Down | [[spaceBlockJumper.selectDown]] | [[editorTextFocus]] && [[config.keyboardlayer.active]] |
| [[up.as]] | Scroll Line Up | [[scrollLineUp]] | [[editorTextFocus]] |
| [[up.as]] | Space Block Jumper Select Up | [[spaceBlockJumper.selectUp]] | [[editorTextFocus]] && [[config.keyboardlayer.active]] |

