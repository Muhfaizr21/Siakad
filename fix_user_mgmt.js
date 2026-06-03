const fs = require('fs');
let c = fs.readFileSync('D:/siakad/frontend/src/pages/SuperAdmin/UserManagement.jsx', 'utf8');

// Fix 1: role render conflict - keep upstream
c = c.replace(
  /\t\tconst r = v \|\| row\.role \|\| ''\n<<<<<<< Updated upstream\n\t\tconst roleOption = roleOptions\.find\(role => role\.value === r\)\n\t\tconst cfg = ROLE_DETAILS\[r\] \|\| \{ label: roleOption\?\.\?label \|\| r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' \}\n=======\n\t\tconst cfg = roleDetails\[r\] \|\| \{ label: r, cls: 'bg-neutral-100 text-slate-500 shadow-none' \}\n>>>>>>> Stashed changes\n\t\treturn /g,
  "\t\tconst r = v || row.role || ''\n\t\tconst roleOption = roleOptions.find(role => role.value === r)\n\t\tconst cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' }\n\t\treturn"
);

// Fix 2: Button 'Permission Matrix' conflict - keep upstream
c = c.replace(
  /                <span className="material-symbols-outlined text-primary" style=\{ \{ fontSize: '14px' \} \} >security<\/span>\n                Permission Matrix\n              <\/Button>\n              <Button \n                onClick=\(\) => \{ setRoleForm\(emptyRoleForm\); setIsCreateRoleOpen\(true\) \}\}\n                className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none"\n              >\n                <span className="material-symbols-outlined" style=\{ \{ fontSize: '14px' \} \} >add<\/span>\n                Create Role\n=======\n                <span className="material-symbols-outlined text-bku-primary" style=\{ \{ fontSize: '16px' \} \} >security<\/span>\n                Access Matrix\n>>>>>>> Stashed changes/g,
  "                <span className=\"material-symbols-outlined text-primary\" style={{ fontSize: '14px' }} >security</span>\n                Permission Matrix\n              </Button>\n              <Button\n                onClick={() => { setRoleForm(emptyRoleForm); setIsCreateRoleOpen(true) }}\n                className=\"h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none\"\n              >\n                <span className=\"material-symbols-outlined\" style={{ fontSize: '14px' }} >add</span>\n                Create Role"
);

// Fix 3: Table Card conflict - keep upstream
c = c.replace(
  /        \{\/\* ── Table Section ─+\*\/\}\n<<<<<<< Updated upstream\n        \{\)activeTab === 'identities' && <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">\n=======\n        <Card className="glass-card border border-slate-200\/60 shadow-none rounded-2xl overflow-hidden">\n>>>>>>> Stashed changes\n          <CardContent className="p-0">/g,
  "        {/* ── Table Section ── */}\n        {activeTab === 'identities' && <Card className=\"border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden\">\n          <CardContent className=\"p-0\">"
);

// Fix 4: DataTable filters conflict - keep upstream
c = c.replace(
  /              addLabel="New Identity"\n<<<<<<< Updated upstream\n              filters=\[\{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roleOptions\.map\(r => \(\{ label: r\.label, value: r\.value \}\)\)\}\]\n=======\n              filters=\[\{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roles\.map\(r => \(\{ label: roleDetails\[r\]\?\.\?label \|\| r, value: r \}\)\)\}\]\n>>>>>>> Stashed changes\n              searchWidth="max-w-md"/g,
  "              addLabel=\"New Identity\"\n              filters={[{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roleOptions.map(r => ({ label: r.label, value: r.value })) }]}\n              searchWidth=\"max-w-md\""
);

// Fix 5: Remove the entire Create Role Modal section (keep upstream dialog structure)
// Find and remove lines 762-1116 (the Create Role Modal)
const marker5 = "<<<<<<< Updated upstream\n      {/* ── Create Role Modal ── */}";
const endMarker5 = "      {/* ── Access Matrix Modal ── */}";
const m5 = c.indexOf(marker5);
const e5 = c.indexOf(endMarker5);
if (m5 > 0 && e5 > 0 && m5 < e5) {
  c = c.slice(0, m5) + c.slice(e5);
  console.log("Removed Create Role Modal section");
}

// Fix 6: Remove orphaned closing tags from Create Role Modal removal
// The closing </section> after the table and before the Access Matrix dialog needs adjustment
// Also fix the closing braces from removed section

fs.writeFileSync('D:/siakad/frontend/src/pages/SuperAdmin/UserManagement.jsx', c, 'utf8');
console.log("Done, length:", c.length);

// Verify no more conflict markers
const remaining = (c.match(/<<<<<<</g) || []).length;
console.log("Remaining conflict markers:", remaining);