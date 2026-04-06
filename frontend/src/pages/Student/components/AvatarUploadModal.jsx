import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import getCroppedImg from '../../../lib/cropImage';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Upload, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  Minus,
  Plus
} from 'lucide-react';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose
} from '../../../components/ui/Dialog';

export default function AvatarUploadModal({ isOpen, onClose, currentPhoto }) {
  const queryClient = useQueryClient();
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const mutation = useMutation({
    mutationFn: async (blob) => {
      const formData = new FormData();
      formData.append('foto', blob, 'avatar.jpg');
      const { data } = await api.post('/profil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mahasiswa', 'profile']);
      toast.success('Foto profil berhasil diperbarui');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal mengunggah foto');
    }
  });

  const handleUpload = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      mutation.mutate(croppedImage);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memproses gambar');
    }
  };

  const handleClose = () => {
    setImage(null);
    setZoom(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-[2rem]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Perbarui Foto Profil</DialogTitle>
          <DialogDescription>Pilih foto terbaikmu dan atur posisi yang pas.</DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {!image ? (
            <div className="border-2 border-dashed border-[#e5e5e5] rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 bg-[#fafafa] hover:bg-[#EAF1FF] hover:border-[#C9D8FF] transition-all group cursor-pointer relative">
               <input 
                type="file" 
                accept="image/*" 
                onChange={onSelectFile} 
                className="absolute inset-0 opacity-0 cursor-pointer"
               />
               <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#00236F] group-hover:scale-110 transition-transform">
                  <Upload size={32} />
               </div>
               <div className="text-center">
                  <p className="font-bold text-[#171717]">Pilih File Foto</p>
                  <p className="text-xs font-medium text-[#a3a3a3]">JPG atau PNG, Maksimal 2MB</p>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="relative h-64 w-full bg-[#00236F] rounded-[1.5rem] overflow-hidden shadow-inner">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape="round"
                    showGrid={false}
                  />
               </div>

               <div className="flex items-center gap-4 px-2">
                  <Minus size={16} className="text-[#a3a3a3]" />
                  <input 
                    type="range" 
                    value={zoom} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onChange={(e) => setZoom(e.target.value)}
                     className="flex-1 accent-[#00236F] h-1.5 bg-[#f5f5f5] rounded-full appearance-none cursor-pointer"
                   />
                  <Plus size={16} className="text-[#a3a3a3]" />
               </div>

               <div className="flex gap-3">
                  <button 
                    onClick={() => setImage(null)}
                    className="flex-1 py-3 px-4 rounded-2xl border border-[#e5e5e5] font-bold text-sm hover:bg-[#fafafa] transition-all"
                  >
                    Ganti File
                  </button>
                   <button 
                     onClick={handleUpload}
                     disabled={mutation.isPending}
                     className="flex-[2] py-3 px-4 rounded-2xl bg-[#00236F] text-white font-bold text-sm hover:bg-[#0B4FAE] transition-all shadow-md shadow-[#00236F]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                    {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Simpan Foto
                  </button>
               </div>
            </div>
          )}
        </div>
        
         <div className="p-4 bg-[#fafafa] border-t border-[#f5f5f5] text-center">
             <button onClick={handleClose} className="text-xs font-bold text-[#a3a3a3] hover:text-[#00236F] transition-colors uppercase tracking-widest">Batalkan</button>
         </div>
      </DialogContent>
    </Dialog>
  );
}
