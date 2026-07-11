export function initFooter() {
  const footerTarget = document.querySelector('[data-footer]');
  if (!footerTarget) return;

  const isPagesPath = window.location.pathname.includes('/pages/');
  const rootPrefix = isPagesPath ? '../' : '';

  footerTarget.innerHTML = `
    <footer class="bg-dark border-t border-border" role="contentinfo">
      <div class="container-custom">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 py-12 lg:py-16">
          <!-- Brand -->
          <div class="lg:col-span-2">
            <a href="${rootPrefix}index.html" class="flex items-center gap-3 text-white font-extrabold text-lg tracking-tight hover:text-blue-400 transition-colors mb-6" aria-label="KoreaSathi Home">
              <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/30">KS</span>
              KoreaSathi
            </a>
            <p class="text-white/50 text-base leading-relaxed max-w-xs mb-8">
              The ultimate free & open-source student hub for Korea. Helping international students with part-time jobs, work permits, immigration guides, and community support.
            </p>
            <div class="flex items-center gap-4">
              <a href="https://github.com/Xanjip32/KoreaSathi" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition-colors" aria-label="GitHub">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/csjibu" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SanjeevShresthaUnfiltered" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition-colors" aria-label="YouTube">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@csjibu" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition-colors" aria-label="TikTok">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.3z"/></svg>
              </a>
            </div>
          </div>

          <!-- Navigation -->
          <div>
            <h3 class="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <nav aria-label="Footer navigation">
              <ul class="space-y-3">
                <li><a href="${rootPrefix}pages/about.html" class="text-white/60 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Guides</a></li>
                <li><a href="${rootPrefix}pages/videos.html" class="text-white/60 hover:text-white transition-colors text-sm">Videos</a></li>
                <li><a href="${rootPrefix}pages/organization.html" class="text-white/60 hover:text-white transition-colors text-sm">Organizations</a></li>
                <li><a href="${rootPrefix}pages/contact.html" class="text-white/60 hover:text-white transition-colors text-sm">Contact</a></li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 class="text-white font-bold text-sm uppercase tracking-wider mb-4">Guides</h3>
            <nav aria-label="Footer guides">
              <ul class="space-y-3">
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Work Permit Guide</a></li>
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Visa & Immigration</a></li>
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Part-time Jobs</a></li>
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Housing & Settlement</a></li>
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Banking & Finance</a></li>
                <li><a href="${rootPrefix}pages/guides.html" class="text-white/60 hover:text-white transition-colors text-sm">Emergency Resources</a></li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 class="text-white font-bold text-sm uppercase tracking-wider mb-4">Connect</h3>
            <nav aria-label="Footer social">
              <ul class="space-y-3">
                <li><a href="https://www.youtube.com/@SanjeevShresthaUnfiltered" target="_blank" rel="noopener noreferrer" class="text-white/60 hover:text-white transition-colors text-sm">YouTube</a></li>
                <li><a href="https://www.tiktok.com/@csjibu" target="_blank" rel="noopener noreferrer" class="text-white/60 hover:text-white transition-colors text-sm">TikTok</a></li>
                <li><a href="https://github.com/Xanjip32/KoreaSathi" target="_blank" rel="noopener noreferrer" class="text-white/60 hover:text-white transition-colors text-sm">GitHub</a></li>
                <li><a href="https://discord.gg/koreasathi" target="_blank" rel="noopener noreferrer" class="text-white/60 hover:text-white transition-colors text-sm">Discord</a></li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-border pt-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p class="text-white/60 text-sm">
              &copy; ${new Date().getFullYear()} KoreaSathi. Free & Open Source. Built by students, for students.
            </p>
            <div class="flex items-center gap-6 text-sm">
              <a href="https://github.com/Xanjip32/KoreaSathi" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition-colors">View Source</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}