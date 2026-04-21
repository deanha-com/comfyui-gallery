import GalleryCard from './GalleryCard'

export default function GalleryGrid({ images, onOpen, allMetadata }) {
  if (images.length === 0) return null
  return (
    <div className="masonry-grid">
      {images.map((image, index) => (
        <GalleryCard key={image} image={image} onOpen={() => onOpen(index)} allMetadata={allMetadata} />
      ))}
    </div>
  )
}
