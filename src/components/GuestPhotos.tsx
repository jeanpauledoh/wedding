import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { SectionHead } from './SectionHead';
import { CameraIcon } from './Icons';
import { compressImage } from '../lib/compress';
import { useGuest } from '../context/GuestContext';

const ALBUM_ENABLED = import.meta.env.VITE_GALLERY_ENABLED === 'true';
const MAX_FILES = 20;

type Photo = { key: string; size: number; uploaded: string };
type Pending = { file: File; preview: string };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GuestPhotos() {
  useLingui();

  const { photos: enabled } = useGuest();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [pending, setPending] = useState<Pending[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState(false);

  const totalSize = pending.reduce((sum, { file }) => sum + file.size, 0);

  const loadPhotos = useCallback(async () => {
    setPhotosLoading(true);
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error(`Gallery failed (${response.status})`);
      const data = (await response.json()) as { photos?: Photo[] };
      setPhotos(data.photos ?? []);
      setPhotosError(false);
    } catch {
      setPhotosError(true);
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void loadPhotos();
  }, [enabled, loadPhotos]);

  const resetUpload = () => {
    pending.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setPending([]);
  };

  const openDialog = () => {
    setStatus('idle');
    setProgress(0);
    resetUpload();
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    if (uploading) return;
    resetUpload();
    dialogRef.current?.close();
  };

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    setStatus('idle');

    const room = MAX_FILES - pending.length;
    if (room <= 0) return;

    const next: Pending[] = [];
    Array.from(incoming)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, room)
      .forEach((file) => {
        next.push({ file, preview: URL.createObjectURL(file) });
      });

    setPending((current) => [...current, ...next]);
  };

  const removeFile = (index: number) => {
    setPending((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (pending.length === 0 || uploading) return;

    setUploading(true);
    setStatus('idle');
    setProgress(0);

    try {
      const prepared: Blob[] = [];
      for (const { file } of pending) {
        prepared.push(await compressImage(file));
      }

      const form = new FormData();
      pending.forEach(({ file }, i) => {
        const name = file.name.replace(/\.[^.]+$/, '') + (i > 0 ? `-${i + 1}` : '') + '.jpg';
        form.append('files', prepared[i], name);
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(form);
      });

      setStatus('success');
      pending.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setPending([]);
      void loadPhotos();
    } catch {
      setStatus('error');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (!enabled) return null;

  return (
    <section className="section" id="share-photos" aria-labelledby="share-photos-title">
      <div className="container">
        <SectionHead
          titleId="share-photos-title"
          eyebrow={<Trans>your moments</Trans>}
          title={<Trans>Share Your Photos</Trans>}
          intro={
            <Trans>
              Captured a special moment during the day? We would love to have it back
              from you. Your photos land straight in our private album.
            </Trans>
          }
        />

        <div className="upload-actions reveal">
          <button type="button" className="btn-ec btn-ec--gold" onClick={openDialog}>
            <CameraIcon />
            <Trans>Share your photos</Trans>
          </button>
        </div>

        <div className="guest-photos-wrap reveal" aria-live="polite">
          <h3 className="overline guest-photos-title">
            <Trans>Photos shared by guests</Trans>
          </h3>

          {photosLoading ? (
            <p className="guest-photos-empty">
              <Trans>Loading your photos…</Trans>
            </p>
          ) : photos.length > 0 ? (
            <div className="guest-photos">
              {photos.map((photo) => (
                <a
                  key={photo.key}
                  className="guest-photo"
                  href={`/api/photo/${encodeURIComponent(photo.key)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t`View photo`}
                >
                  <img
                    src={`/api/photo/${encodeURIComponent(photo.key)}`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              ))}
            </div>
          ) : photosError ? null : (
            <p className="guest-photos-empty">
              <Trans>No photos yet — be the first!</Trans>
            </p>
          )}

          {ALBUM_ENABLED && photos.length > 0 && (
            <div className="album-actions">
              <a className="btn-ec btn-ec--ghost" href="/api/album">
                <Trans>Download album (zip)</Trans>
              </a>
            </div>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="upload-dialog"
        aria-label={t`Share your photos`}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        <div className="upload-modal">
          <h3>
            <Trans>Share Your Photos</Trans>
          </h3>
          <p className="upload-hint">
            <Trans>Your photos will be compressed automatically before upload.</Trans>
          </p>

          {status === 'success' ? (
            <p className="upload-status upload-status--ok" role="status">
              <Trans>Thank you! Your photos are on their way to our album.</Trans>
            </p>
          ) : (
            <>
              <label
                className={dragOver ? 'dropzone drag-over' : 'dropzone'}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleInput}
                />
                <CameraIcon />
                <span>
                  <Trans>Drop your photos here or tap to choose</Trans>
                </span>
                <small>
                  <Trans>JPG, PNG, WebP or HEIC · up to 20 photos</Trans>
                </small>
              </label>

              {pending.length > 0 && (
                <div className="upload-details">
                  <ul className="upload-previews">
                    {pending.map(({ preview }, index) => (
                      <li className="upload-preview" key={preview}>
                        <img src={preview} alt="" />
                        <button
                          type="button"
                          className="upload-remove"
                          aria-label={t`Remove photo`}
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="upload-meta">
                    {pending.length} · {formatBytes(totalSize)}
                  </p>
                </div>
              )}

              {uploading && (
                <div
                  className="upload-progress"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              )}

              {status === 'error' && (
                <p className="upload-status upload-status--error" role="alert">
                  <Trans>Something went wrong. Please try again.</Trans>
                </p>
              )}
            </>
          )}

          <div className="upload-modal-actions">
            <button
              type="button"
              className="btn-ec btn-ec--ghost"
              onClick={closeDialog}
              disabled={uploading}
            >
              {status === 'success' ? <Trans>Close</Trans> : <Trans>Cancel</Trans>}
            </button>
            {status !== 'success' && (
              <button
                type="button"
                className="btn-ec btn-ec--gold"
                onClick={handleUpload}
                disabled={pending.length === 0 || uploading}
              >
                {uploading ? (
                  <Trans>Uploading…</Trans>
                ) : (
                  <>
                    <CameraIcon />
                    <Trans>Upload</Trans>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </section>
  );
}