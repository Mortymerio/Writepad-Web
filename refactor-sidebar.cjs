const fs = require('fs');
let content = fs.readFileSync('src/ui/SidebarManager.js', 'utf8');

const replacements = [
  // Hide / show sidebars via CSS
  ['rightSidebar.style.display = \'none\';', 'rightSidebar.classList.add(\'hidden\'); rightSidebar.classList.remove(\'flex\');'],
  ['if (rightResizeHandle) rightResizeHandle.style.display = \'none\';', 'if (rightResizeHandle) rightResizeHandle.classList.add(\'hidden\');'],
  ['rightSidebar.style.display = \'flex\';', 'rightSidebar.classList.remove(\'hidden\'); rightSidebar.classList.add(\'flex\');'],
  ['if (rightResizeHandle) rightResizeHandle.style.display = \'block\';', 'if (rightResizeHandle) rightResizeHandle.classList.remove(\'hidden\');'],
  ['sidebar.style.display = \'none\';', 'sidebar.classList.add(\'hidden\'); sidebar.classList.remove(\'flex\');'],
  ['sidebar.style.display = \'flex\';', 'sidebar.classList.remove(\'hidden\'); sidebar.classList.add(\'flex\');'],
  
  // Empty states
  ['<div style="padding: 10px; color: #888;">No saved macros</div>', '<div class="sidebar-empty">No saved macros</div>'],
  ['<div style="padding: 10px; color: #888;">No active document</div>', '<div class="sidebar-empty">No active document</div>'],
  ['<div style="padding: 10px; color: #888;">No functions found</div>', '<div class="sidebar-empty">No functions found</div>'],
  ['<div style="padding:10px;">Tu navegador no soporta la API de File System Access para abrir carpetas locales.</div>', '<div class="sidebar-empty">Tu navegador no soporta la API de File System Access para abrir carpetas locales.</div>'],
  
  // Macro items
  ['item.style.display = \'flex\';', 'item.classList.add(\'sidebar-item\');'],
  ['item.style.justifyContent = \'space-between\';', ''],
  ['item.style.alignItems = \'center\';', ''],
  ['nameSpan.style.flex = \'1\';', 'nameSpan.classList.add(\'sidebar-item__name\');'],
  ['nameSpan.style.cursor = \'pointer\';', ''],
  
  // Search
  ['searchContainer.style.padding = \'8px\';', 'searchContainer.classList.add(\'sidebar-search\');'],
  
  // Files
  ['style="flex:1"', 'class="sidebar-item__name"'],
  
  // Open Folder Button
  ['btnContainer.style.padding = \'10px\';', 'btnContainer.classList.add(\'sidebar-search\');'],
  ['btn.style.cssText = \'padding: 6px 12px; cursor: pointer;\';', 'btn.className = \'sidebar-btn\';'],
  
  // Header
  ['header.style.cssText = \'display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:var(--bg-secondary); border-bottom:1px solid var(--border-dark); font-size:12px; color:var(--text-primary);\';', 'header.className = \'sidebar-header\';'],
  ['closeFolderBtn.style.cssText = \'background:none; border:none; color:var(--text-primary); cursor:pointer; font-size:14px; line-height:1;\';', 'closeFolderBtn.className = \'sidebar-close-btn\';'],
  
  // Tree
  ['childrenContainer.style.paddingLeft = \'15px\';', 'childrenContainer.className = \'sidebar-tree__children\';'],
  ['root.style.padding = \'5px 0\';', 'root.className = \'sidebar-tree\';'],
  ['style="font-size:10px;"', 'class="sidebar-spinner"']
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
  content = content.replace(search, replace); // run twice just in case
}

fs.writeFileSync('src/ui/SidebarManager.js', content);
console.log("SidebarManager refactored.");
