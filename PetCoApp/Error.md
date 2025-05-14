Error has been resolved!

Previous error was:
"VirtualizedLists should never be nested inside plain ScrollViews with the same orientation"

The issue was in ServiceFormModal.tsx where we had a horizontal ScrollView inside the main vertical ScrollView.

Solution:
- Replaced the nested inner ScrollView with a regular View with `flexDirection: 'row'` and `flexWrap: 'wrap'`
- Added `petsRow` style with proper flex properties
- Used a flexible layout instead of scrolling for pet selection

The modal now properly shows pets in a wrapped grid layout without nesting ScrollViews with the same orientation.