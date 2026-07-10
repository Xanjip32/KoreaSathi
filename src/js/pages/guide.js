import { fetchPost, getTitle, getContent, findPdfUrl, findVideoEmbed, formatDate, escapeHtml, downloadFile } from '../api.js';

// Remove the raw WordPress media blocks (PDF file block + TikTok embed figure)
// because we render those as clean media blocks above the article body.
function stripEmbeddedMedia(html) {
  if (!html) return html;
  let cleaned = html;
  // Remove the PDF file block: <div ... class="wp-block-file">...</div>
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*wp-block-file[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Remove the TikTok embed figure: <figure ... wp-block-embed-tiktok ...>...</figure>
  cleaned = cleaned.replace(/<figure[^>]*class="[^"]*wp-block-embed-tiktok[^"]*"[^>]*>[\s\S]*?<\/figure>/gi, '');
  return cleaned;
}

export function initGuide() {
  const guideBody = document.getElementById('guideBody');
  const guideTitle = document.getElementById('guideTitle');
  const guideDate = document.getElementById('guideDate');
  if (!guideBody) return;

  const params = new URLSearchParams(window.location.search);
  let postId = params.get('id');
  if (!postId) {
    const hash = window.location.hash.match(/id=(\d+)/);
    postId = hash ? hash[1] : null;
  }
  if (!postId) {
    guideBody.innerHTML = '<p class="text-white/30 text-center py-10">No guide selected.</p>';
    return;
  }

  guideBody.innerHTML = '<div class="space-y-4"><div class="skeleton h-8 w-3/4 mb-4"></div><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-2/3"></div></div>';

  fetchPost(postId)
    .then(post => {
      if (guideTitle) guideTitle.textContent = getTitle(post);
      if (guideDate) guideDate.textContent = formatDate(post.date);

      const rawContent = getContent(post) || '';
      const pdfUrl = findPdfUrl(rawContent);
      const video = findVideoEmbed(rawContent);
      const content = stripEmbeddedMedia(rawContent);

      // Build media block (PDF viewer + video) shown above the article body
      let mediaHtml = '';
      if (pdfUrl) {
        mediaHtml += `
          <div class="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span class="inline-flex items-center gap-2 text-sm font-semibold text-white"><i class="fas fa-file-pdf text-red-400"></i> PDF Guide</span>
              <a href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener" download class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"><i class="fas fa-download"></i> Download</a>
            </div>
            <iframe src="${escapeHtml(pdfUrl)}#view=FitH" class="w-full" style="height:600px;border:0;" title="PDF Guide"></iframe>
          </div>`;
      }
      if (video && video.platform === 'tiktok' && video.videoId) {
        const videoUrl = `https://www.tiktok.com/@csjibu/video/${video.videoId}`;
        mediaHtml += `
          <div class="mb-8">
            <div class="inline-flex items-center gap-2 text-sm font-semibold text-white mb-3"><i class="fab fa-tiktok text-pink-400"></i> Watch on TikTok</div>
            <div class="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0F1A]">
              <iframe
                src="https://www.tiktok.com/embed/v2/${escapeHtml(video.videoId)}"
                style="width:100%;height:700px;border:0;"
                class="w-full"
                allowfullscreen
                scrolling="no"
                title="TikTok video"
                loading="lazy"
              ></iframe>
            </div>
            <a href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"><i class="fab fa-tiktok"></i> Open on TikTok</a>
          </div>`;
      }

      guideBody.innerHTML = mediaHtml + (content || '<p class="text-white/30">No content available.</p>');
      const sourceLink = document.getElementById('guideSourceLink');
      const sourceUrl = post.URL || '';
      if (sourceLink && sourceUrl) {
        sourceLink.href = sourceUrl;
        sourceLink.classList.remove('hidden');
      }
    })
    .catch(err => {
      console.warn('Failed to load guide:', err);
      guideBody.innerHTML = '<p class="text-white/30 text-center py-10">Could not load guide.</p>';
    });
}