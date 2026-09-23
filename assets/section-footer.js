document.addEventListener('DOMContentLoaded', function() {
  const headings = document.querySelectorAll('.footer-block__heading');

  headings.forEach(function(heading) {
    heading.addEventListener('click', function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if (content && content.classList.contains('footer-dropdown-content')) {
        content.classList.toggle('active');
      }
    });
  });
});