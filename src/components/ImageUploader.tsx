import React, { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

const ImageUploader: React.FC = () => {
  const [_, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement | undefined>
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const imageFile = files[0]
      setSelectedImage(imageFile)
      const imageUrl = URL.createObjectURL(imageFile)
      setImageUrl(imageUrl)
    }
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" onChange={handleImageChange} />
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
          className="absolute inset-20"
          style={{ width: 640, height: 480 }}
        />
      )}
    </div>
  )
}

export default ImageUploader
