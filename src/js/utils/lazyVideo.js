// ============================================
// Lazy Video Loading
// ============================================

export function initLazyVideos() {
  const lazyContainers = document.querySelectorAll('.lazy-video[data-video-id]');

  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const videoId = container.dataset.videoId;
        const platform = container.dataset.videoPlatform || 'youtube';

        if (platform === 'youtube') {
          container.innerHTML = `
            <iframe 
              src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1" 
              class="w-full aspect-video rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              loading="lazy"
              title="Video"
            ></iframe>
          `;
        } else if (platform === 'tiktok') {
          container.innerHTML = `
            <iframe
              src="https://www.tiktok.com/embed/v2/${videoId}"
              class="w-full aspect-video rounded-xl"
              style="border:0"
              allowfullscreen
              loading="lazy"
              title="TikTok video"
            ></iframe>
          `;
        }

        observer.unobserve(container);
      }
    });
  }, {
    rootMargin: '100px 0px',
    threshold: 0.01
  });

  lazyContainers.forEach(container => videoObserver.observe(container));

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    lazyContainers.forEach(container => {
      const videoId = container.dataset.videoId;
      const platform = container.dataset.videoPlatform || 'youtube';
      if (platform === 'youtube') {
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0" class="w-full aspect-video rounded-xl" allowfullscreen loading="lazy" title="Video"></iframe>`;
      } else if (platform === 'tiktok') {
        container.innerHTML = `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" class="w-full aspect-video rounded-xl" style="border:0" allowfullscreen loading="lazy" title="TikTok video"></iframe>`;
      }
    });
  }
}