import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import MinimalNavbar from '../components/MinimalNavbar';
import TCAPWordmark from '../components/TCAPWordmark';
import { GALLERY_ALBUMS } from '../data/galleryAlbums';

export default function GalleryLinks() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #2a0000 40%, #1a0000 100%)',
      }}
    >
      <MinimalNavbar />

      <main className="pt-28 pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="mb-stack-md">
          <h1 className="section-heading-bold text-5xl md:text-display-sm text-primary mb-2">
            Archives
          </h1>
          <span className="h-[2px] w-24 bg-accent-red block mb-4" />
          <p className="font-body text-on-surface-variant max-w-2xl">
            Browse TCAP event coverage. Click an album to open the full gallery on Google Photos or Google Drive.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ALBUMS.map((album) => (
            <article
              key={album.id}
              className="frosted-glass border border-white/10 overflow-hidden group hover:border-accent-red/40 transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden gallery-item">
                <img
                  src={album.thumbnail}
                  alt={album.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-mono text-xs text-accent-red uppercase tracking-widest mb-1">{album.date}</p>
                  <h2 className="font-bold-display text-lg text-primary uppercase tracking-wide">{album.name}</h2>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {album.photosUrl && (
                  <a
                    href={album.photosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 font-label text-label-caps uppercase bg-accent-red text-white hover:bg-white hover:text-background transition-all"
                  >
                    Google Photos <FiExternalLink size={14} />
                  </a>
                )}
                {album.driveUrl && (
                  <a
                    href={album.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 font-label text-label-caps uppercase liquid-glass text-primary hover:bg-white/10 transition-all border border-white/10"
                  >
                    Google Drive <FiExternalLink size={14} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-stack-lg pt-stack-md border-t border-white/5">
          <TCAPWordmark size="lg" subtitle="TCET Capture" />
        </div>
      </main>
    </div>
  );
}
