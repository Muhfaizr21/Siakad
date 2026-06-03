import sys
c = open('D:/siakad/frontend/src/pages/SuperAdmin/UserManagement.jsx', encoding='utf-8').read()

# Fix 1: role render conflict
old1 = """\t\tconst r = v || row.role || ''
<<<<<<< Updated upstream
\t\tconst roleOption = roleOptions.find(role => role.value === r)
\t\tconst cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' }
=======
\t\tconst cfg = roleDetails[r] || { label: r, cls: 'bg-neutral-100 text-slate-500 shadow-none' }
>>>>>>> Stashed changes
\t\treturn"""
new1 = """\t\tconst r = v || row.role || ''
\t\tconst roleOption = roleOptions.find(role => role.value === r)
\t\tconst cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' }
\t\treturn"""
if old1 in c:
    c = c.replace(old1, new1, 1)
    print("Fix 1 applied")
else:
    print("Fix 1 NOT FOUND")

# Fix 2: Button Permission Matrix conflict
old2 = """\t\t\t<span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >security</span>
\t\t\tPermission Matrix
\t\t</Button>
\t\t<Button
\t\t  onClick={() => { setRoleForm(emptyRoleForm); setIsCreateRoleOpen(true) }}
\t\t  className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none"
\t\t>
\t\t  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span>
\t\t  Create Role
=======
\t\t\t<span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '16px' }} >security</span>
\t\t\tAccess Matrix
>>>>>>> Stashed changes"""
new2 = """\t\t\t<span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >security</span>
\t\t\tPermission Matrix
\t\t</Button>
\t\t<Button
\t\t  onClick={() => { setRoleForm(emptyRoleForm); setIsCreateRoleOpen(true) }}
\t\t  className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none"
\t\t>
\t\t  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span>
\t\t  Create Role"""
if old2 in c:
    c = c.replace(old2, new2, 1)
    print("Fix 2 applied")
else:
    print("Fix 2 NOT FOUND")

# Fix 3: Table Card opening conflict
old3 = """\t\t{/* ── Table Section ── */}
<<<<<<< Updated upstream
\t\t{activeTab === 'identities' && <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
=======
\t\t<Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
>>>>>>> Stashed changes
\t\t  <CardContent className="p-0">"""
new3 = """\t\t{/* ── Table Section ── */}
\t\t{activeTab === 'identities' && <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
\t\t  <CardContent className="p-0">"""
if old3 in c:
    c = c.replace(old3, new3, 1)
    print("Fix 3 applied")
else:
    print("Fix 3 NOT FOUND")

# Fix 4: DataTable filters conflict
old4 = """\t\t  addLabel="New Identity"
<<<<<<< Updated upstream
\t\t  filters={[{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roleOptions.map(r => ({ label: r.label, value: r.value })) }]}
=======
\t\t  filters={[{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roles.map(r => ({ label: roleDetails[r]?.label || r, value: r })) }]}
>>>>>>> Stashed changes
\t\t  searchWidth="max-w-md\""""
new4 = """\t\t  addLabel="New Identity"
\t\t  filters={[{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roleOptions.map(r => ({ label: r.label, value: r.value })) }]}
\t\t  searchWidth="max-w-md\""""
if old4 in c:
    c = c.replace(old4, new4, 1)
    print("Fix 4 applied")
else:
    print("Fix 4 NOT FOUND")

# Fix 5: Create Role Modal section (remove completely, keep Access Matrix)
# This section starts after </section> before Access Matrix
old5_start = """\t\t</section>

<<<<<<< Updated upstream
\t\t{/* ── Create Role Modal ── */}
\t\t<Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
\t\t  <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white animate-in zoom-in-95 duration-300">
\t\t    <DialogHeader className="p-8 pb-6 border-b border-neutral-100 bg-neutral-50/50">
\t\t      <div className="flex items-center gap-4">
\t\t        <div className="size-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xl shadow-neutral-900/20"><span className="material-symbols-outlined" style={{ fontSize: '22px' }}>badge</span></div>
\t\t        <div>
\t\t          <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-neutral-900 leading-none">Create RBAC Role</DialogTitle>
\t\t          <DialogDescription className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">Role baru terpisah dari provisioning identitas.</DialogDescription>
\t\t        </div>
\t\t      </div>
\t\t    </DialogHeader>
\t\t    <form onSubmit={handleCreateRole} className="p-8 space-y-6">
\t\t      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
\t\t        <div className="space-y-2">
\t\t          <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Role Key</Label>
\t\t          <Input required value={roleForm.key} onChange={e => setRoleForm({ ...roleForm, key: e.target.value })} placeholder="kencana_reviewer" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
\t\t        </div>
\t\t        <div className="space-y-2">
\t\t          <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Display Label</Label>
\t\t          <Input required value={roleForm.label} onChange={e => setRoleForm({ ...roleForm, label: e.target.value })} placeholder="Kencana Reviewer" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
\t\t        </div>
\t\t      </div>
\t\t      <div className="space-y-2">
\t\t        <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Description</Label>
\t\t        <Input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Jelaskan batas otoritas role ini..." className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
\t\t      </div>
\t\t      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-700 leading-relaxed">
\t\t        Setelah role dibuat, buka tab Permission Matrix untuk mengaktifkan permission per modul. Role custom akan tersedia di pilihan otorisasi akun, tetapi tidak membuat profil khusus seperti mahasiswa atau mentor Kencana.
\t\t      </div>
\t\t      <footer className="flex gap-4 pt-2 border-t border-neutral-100">
\t\t        <Button type="button" variant="ghost" onClick={() => setIsCreateRoleOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400">Abort</Button>
\t\t        <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-neutral-900/10 active:scale-[0.98] transition-all border-none flex items-center justify-center gap-2">
\t\t          {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>}
\t\t          Commit Role
\t\t        </Button>
\t\t      </footer>
\t\t    </form>
\t\t  </DialogContent>
\t\t</Dialog>
======="""
new5 = """\t\t</section>

"""
if old5_start in c:
    c = c.replace(old5_start, new5, 1)
    print("Fix 5 applied")
else:
    print("Fix 5 NOT FOUND, trying simpler approach...")
    # Try to find just the start
    marker5 = "<<<<<<< Updated upstream\n\t\t{/* ── Create Role Modal"
    idx5 = c.find(marker5)
    if idx5 >= 0:
        # Find end of this conflict block
        end5 = c.find(">>>>>>> Stashed changes", idx5)
        if end5 >= 0:
            end5 += len(">>>>>>> Stashed changes\n")
            c = c[:idx5] + c[end5:]
            print("Fix 5 applied (simpler)")
    else:
        print("Fix 5 marker NOT FOUND")

open('D:/siakad/frontend/src/pages/SuperAdmin/UserManagement.jsx', 'w', encoding='utf-8').write(c)
print("Written, length:", len(c))
remaining = c.count("<<<<<<<")
print("Remaining conflict markers:", remaining)
if remaining > 0:
    for i, line in enumerate(c.split('\n')):
        if '<<<<<<<' in line:
            print(f"  Line {i+1}: {line[:100]}")
