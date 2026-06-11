# Panduan UI/UX Modal & Dialog (Siakad)

Dokumen ini berisi standar baku untuk pembuatan dan modifikasi *Modal* atau *Dialog* di seluruh aplikasi agar tampilannya konsisten, elegan, dan tidak ada komponen yang terpotong.

Setiap kali Anda (AI Assistant atau Developer) diminta untuk membuat atau memperbaiki modal, **BACA DAN IKUTI ATURAN INI SECARA KETAT.**

## 1. Struktur Komponen Dasar
Gunakan selalu komponen `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, dan `DialogFooter` dari `src/components/ui/Dialog.jsx`. JANGAN membuat *wrapper* modal secara manual dengan `div` kosong kecuali sangat terpaksa.

## 2. Flex-Box Constraint (PENTING AGAR BISA DI-SCROLL)
Agar *header* dan *footer* modal selalu menempel di atas dan di bawah (fixed), sementara bagian tengah (konten) bisa di-scroll ketika isinya panjang, struktur flexbox-nya HARUS seperti ini:

```jsx
<Dialog open={isOpen} onOpenChange={setIsOpen} maxWidth="max-w-2xl">
  <DialogContent>
    {/* 1. Header otomatis pakai shrink-0 (sudah diset di komponen DialogHeader) */}
    <DialogHeader icon="emoji_events" iconClassName="text-primary">
      <DialogTitle>Judul Modal</DialogTitle>
    </DialogHeader>

    {/* 2. Body harus pakai: flex-1 min-h-0 overflow-y-auto */}
    {/* Kalau pakai form, PASTIKAN form-nya juga flex-1 min-h-0 */}
    <form className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="p-6 sm:p-8 space-y-4 overflow-y-auto flex-1 min-h-0 font-body bg-[var(--theme-bg)]">
         {/* Isi konten di sini */}
      </div>

      {/* 3. Footer otomatis pakai shrink-0 (sudah diset di komponen DialogFooter) */}
      <DialogFooter>
        <button type="submit" className="...">Simpan</button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**ATURAN FLEX-BOX YANG HARAM DILANGGAR:**
- Jangan pernah pakai `overflow-y-auto` di parent paling luar (`DialogContent` / `Dialog`) karena akan membuat header/footer ikut terguling ke atas dan keluar layar!
- `DialogContent` sudah tersetting sebagai `flex flex-col flex-1 min-h-0 overflow-hidden` secara global.
- Body Content di dalam `DialogContent` (atau di dalam form wrapper) **HARUS** memiliki utility: `flex-1 min-h-0 overflow-y-auto`. `min-h-0` adalah kunci agar elemen anak flexbox tidak melebar ke bawah tanpa batas (*flex blowout*).

## 3. Pewarnaan & Kontras (Standard Theme)
Kombinasi warna modal **DIWAJIBKAN** untuk menggunakan kontras berikut agar rapi dan informasinya menonjol:
1. **DialogHeader**: `bg-white` (Putih murni)
2. **Body Konten Utama**: `bg-[var(--theme-bg)]` (Krem/Abu Terang - `#F8FAFC`)
3. **DialogFooter**: `bg-white` (Putih murni)

**Styling Kartu (Cards) & Input di dalam Modal Body:**
Karena latar belakang utama modal body adalah *Krem*, maka **SEMUA** kotak informasi tambahan, detail aplikasi, kotak *input*, `textarea`, atau `select` di dalamnya **HARUS** menggunakan latar *Putih* (`bg-white`) agar terlihat *pop-out* dan kontras.

- **BENAR**: `<div className="bg-white p-4 rounded-xl border border-neutral-200"> ... </div>`
- **BENAR**: `<Input className="bg-white" />`
- **SALAH**: `<div className="bg-[var(--theme-bg)] ...">` (Akan menyatu tidak terlihat dengan background modal).
- **SALAH**: `<Input className="bg-neutral-50/30" />` (Akan kurang kontras dan seolah-olah transparan).

> **Catatan Teknis Komponen `Input.jsx`**:
> Komponen `src/components/ui/input.jsx` sudah tidak mengunci *background color* via *inline-styles*. Saat memanggil `<Input />` di dalam form modal, pastikan selalu menambahkan class `bg-white`.

## 4. Tipografi & Hirarki Label
- Gunakan `font-body` (Inter/Jakarta) untuk paragraf atau konten.
- **Label Card/Section**: `text-[8px]` atau `text-[10px] font-bold text-slate-400 uppercase tracking-wider`.
- **Label Input Form**: `text-xs font-bold text-neutral-500 font-jakarta ml-1`.

Dengan merujuk ke panduan ini, seluruh form *Update*, *Review*, atau *Detail* di dalam aplikasi akan memiliki standar *User Experience* (UX) yang profesional dan kokoh di berbagai ukuran layar.
