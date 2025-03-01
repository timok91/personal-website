'use client';

import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import styles from './PosterModal.module.css';

interface PosterModalProps {
  isOpen: boolean;
  posterPath: string;
  title: string;
  onClose: () => void;
}

export default function PosterModal({ isOpen, posterPath, title, onClose }: PosterModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Allow scrolling when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`${styles.backdrop} ${isOpen ? styles.open : styles.closed}`}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.zoomControls}>
          <p className={styles.instructions}>
            Use mouse wheel to zoom, click and drag to pan, or use the controls below
          </p>
        </div>
        
        <div className={styles.imageContainer}>
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit={true}
            limitToBounds={false}
            centerZoomedOut={false}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className={styles.tools}>
                  <button onClick={() => zoomIn()} className={styles.zoomButton}>+</button>
                  <button onClick={() => zoomOut()} className={styles.zoomButton}>-</button>
                  <button onClick={() => resetTransform()} className={styles.zoomButton}>Reset</button>
                </div>
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: "100%", height: "100%" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`/${posterPath}`}
                    alt={`Poster: ${title}`}
                    className={styles.posterImage}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
}