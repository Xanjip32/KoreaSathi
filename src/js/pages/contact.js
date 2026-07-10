export function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      alert('Please fill in all required fields.');
      return;
    }

    // Since this is a static site, we'll use mailto: as fallback
    const subject = encodeURIComponent(`KoreaSathi Contact: ${data.subject || 'General'}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    window.location.href = `mailto:csjibu@gmail.com?subject=${subject}&body=${body}`;
  });
}