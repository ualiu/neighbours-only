// Main JavaScript file for client-side functionality

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');

    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});

// Inline Post Creation
document.addEventListener('DOMContentLoaded', function() {
    const postTextarea = document.getElementById('postTextarea');
    const charCount = document.getElementById('charCount');
    const postSubmitBtn = document.getElementById('postSubmitBtn');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (!postTextarea) return;

    // Auto-resize textarea
    postTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';

        // Update character count
        const count = this.value.length;
        charCount.textContent = count;

        // Enable/disable post button
        if (count > 0 && count <= 2000) {
            postSubmitBtn.disabled = false;
        } else {
            postSubmitBtn.disabled = true;
        }
    });

    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];

        if (file) {
            // Check file size (15MB max)
            if (file.size > 15 * 1024 * 1024) {
                alert('File size must be less than 15MB');
                this.value = '';
                return;
            }

            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);

            // Enable post button if there's an image
            postSubmitBtn.disabled = false;
        }
    });

    // Remove image
    removeImageBtn.addEventListener('click', function() {
        imageUpload.value = '';
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';

        // Disable post button if no text
        if (postTextarea.value.trim().length === 0) {
            postSubmitBtn.disabled = true;
        }
    });
});

// Confirm delete actions
document.addEventListener('DOMContentLoaded', function() {
    const deleteForms = document.querySelectorAll('form[action*="/delete"]');

    deleteForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this?')) {
                e.preventDefault();
            }
        });
    });
});

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);

    if (!form) return;

    form.addEventListener('submit', function(e) {
        if (!form.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
        }

        form.classList.add('was-validated');
    });
}

// Initialize tooltips if Bootstrap tooltips are used
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// Image lazy loading
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        images.forEach(function(img) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
});

// Prevent double form submission
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');

    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';

                // Re-enable after 3 seconds as a safety measure
                setTimeout(function() {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
                }, 3000);
            }
        });
    });
});
