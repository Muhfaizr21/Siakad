"use client"

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Hapus Data?", 
  description = "Tindakan ini bersifat permanen dan data tidak dapat dikembalikan lagi dari sistem.",
  loading = false
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl bg-white/95 backdrop-blur-xl max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="size-20 rounded-[2rem] bg-rose-50 text-rose-600 flex items-center justify-center mb-6 mx-auto shadow-inner">
            <Trash2 className="size-10" />
          </div>
          <AlertDialogTitle className="text-3xl font-black font-headline uppercase leading-none text-center tracking-tighter text-slate-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-6 leading-relaxed font-headline">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-12 gap-4 flex flex-row items-center w-full">
          <AlertDialogCancel 
            onClick={(e) => { e.preventDefault(); onClose(); }}
            className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex-1 border-slate-200 font-headline hover:bg-slate-50 transition-all"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={loading}
            className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex-1 bg-rose-600 hover:bg-rose-700 text-white border-none shadow-2xl shadow-rose-600/20 active:scale-95 transition-all font-headline flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? 'Processing...' : 'Hapus Sekarang'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
