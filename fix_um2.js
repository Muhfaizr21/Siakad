const fs = require('fs');
const c = fs.readFileSync('D:/siakad/frontend/src/pages/SuperAdmin/UserManagement.jsx', 'utf8');
let r = c;

// Fix 1: role render conflict - keep upstream
// Marker: <<<<<<< Updated upstream (no trailing space in file)
r = r.replace(
  '\t\tconst r = v || row.role || \'\''\r\n<<<<<<< Updated upstream\r\n' +
  '\t\tconst roleOption = roleOptions.find(role => role.value === r)\r\n' +
  '\t\tconst cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: \'bg-neutral-100 text-neutral-500 shadow-none\' }\r\n' +
  '=======\r\n' +
  '\t\tconst cfg = roleDetails[r] || { label: r, cls: \'bg-neutral-100 text-slate-500 shadow-none\' }\r\n' +
  '>>>>>>> Stashed changes\r\n',
  '\t\tconst r = v || row.role || \'\'\r\n' +
  '\t\tconst roleOption = roleOptions.find(role => role.value === r)\r\n' +
  '\t\tconst cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: \'bg-neutral-100 text-neutral-500 shadow-none\' }\r\n'
);
console.log('Fix 1 done');

// Fix 2: Button Permission Matrix conflict - keep upstream
r = r.replace(
  '\t\t\t\t<span className="material-symbols-outlined text-primary" style={{ fontSize: \'14px\' }} >security</span>\r\n' +
  '\t\t\t\tPermission Matrix\r\n' +
  '\t\t\t</Button>\r\n' +
  '\t\t\t<Button\r\n' +
  '\t\t\t  onClick={() => { setRoleForm(emptyRoleForm); setIsCreateRoleOpen(true) }}\r\n' +
  '\t\t\t  className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none"\r\n' +
  '\t\t\t>\r\n' +
  '\t\t\t  <span className="material-symbols-outlined" style={{ fontSize: \'14px\' }} >add</span>\r\n' +
  '\t\t\t  Create Role\r\n' +
  '=======\r\n' +
  '\t\t\t<span className="material-symbols-outlined text-bku-primary" style={{ fontSize: \'16px\' }} >security</span>\r\n' +
  '\t\t\tAccess Matrix\r\n' +
  '>>>>>>> Stashed changes',
  '\t\t\t<span className="material-symbols-outlined text-primary" style={{ fontSize: \'14px\' }} >security</span>\r\n' +
  '\t\t\tPermission Matrix\r\n' +
  '\t\t\t</Button>\r\n' +
  '\t\t\t<Button\r\n' +
  '\t\t\t  onClick={() => { setRoleForm(emptyRoleForm); setIsCreateRoleOpen(true) }}\r\n' +
  '\t\t\t  className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none"\r\n' +
  '\t\t\t>\r\n' +
  '\t\t\t  <span className="material-symbols-outlined" style={{ fontSize: \'14px\' }} >add</span>\r\n' +
  '\t\t\t  Create Role'
);
console.log('Fix 2 done, remaining markers:', r.split('<<<<<<<').length - 1);

fs.writeFileSync('D:/siakad/frontend/src/pages/SuperAdmin/UserManagement.jsx', r, 'utf8');
console.log('Written, length:', r.length);
