'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X } from 'lucide-react'

interface AvatarCropDialogProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImage: Blob) => void
}

interface Area {
  width: number
  height: number
  x: number
  y: number
}

export function AvatarCropDialog({ isOpen, onClose, imageSrc, onCropComplete }: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop)
  }

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom)
  }

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg', 0.95)
    })
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    try {
      setIsProcessing(true)
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedImage)
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-[10000] w-full max-w-2xl mx-4 bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold">Chỉnh sửa ảnh đại diện</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[400px] w-full bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Zoom Control */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium min-w-20">Phóng to</span>
            <input
              type="range"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              min={1}
              max={3}
              step={0.1}
              className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground min-w-12 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {isProcessing ? 'Đang xử lý...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
