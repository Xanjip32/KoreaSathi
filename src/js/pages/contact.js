export function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Inline status region (announced to screen readers via aria-live)
  let status = document.getElementById('contactStatus');
  if (!status) {
    status = document.createElement('div');
    status.id = 'contactStatus';
    status.className = 'form-message';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', status);
  }
  const showStatus = (msg, type) => {
    status.textContent = msg;
    status.className = `form-message form-message--${type} show`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.name || !data.email || !data.message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    const sanitize = (s) => String(s).replace(/[\r\n\x00-\x1f]+/g, ' ').trim();
    const subject = encodeURIComponent(sanitize(`KoreaSathi Contact: ${data.subject || 'General'}`));
    const body = encodeURIComponent(`Name: ${sanitize(data.name)}\nEmail: ${sanitize(data.email)}\n\n${sanitize(data.message)}`);
    showStatus('Opening your email app to send the message…', 'success');
    window.location.href = `mailto:csjibu@gmail.com?subject=${subject}&body=${body}`;
  });
}