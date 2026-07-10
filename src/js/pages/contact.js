export function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.name || !data.email || !data.message) {
      alert('Please fill in all required fields.');
      return;
    }

    const sanitize = (s) => String(s).replace(/[\r\n\x00-\x1f]+/g, ' ').trim();
    const subject = encodeURIComponent(sanitize(`KoreaSathi Contact: ${data.subject || 'General'}`));
    const body = encodeURIComponent(`Name: ${sanitize(data.name)}\nEmail: ${sanitize(data.email)}\n\n${sanitize(data.message)}`);
    window.location.href = `mailto:csjibu@gmail.com?subject=${subject}&body=${body}`;
  });
}