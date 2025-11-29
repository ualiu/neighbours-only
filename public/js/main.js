// Main JavaScript file for client-side functionality

// Auto-dismiss flash message alerts after 5 seconds (but not persistent alerts)
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert.alert-dismissible');

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

// ========== AI MODERATION - CONCERN REPORTING SYSTEM ==========

// Handle "Send Concern" button clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.concern-btn')) {
        const postId = e.target.closest('.concern-btn').dataset.postId;
        document.getElementById('concernPostId').value = postId;
        const modal = new bootstrap.Modal(document.getElementById('concernModal'));
        modal.show();
    }
});

// Handle concern form submission
document.addEventListener('DOMContentLoaded', function() {
    const concernForm = document.getElementById('concernForm');

    if (!concernForm) return;

    concernForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const postId = document.getElementById('concernPostId').value;
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

        try {
            const response = await fetch(`/api/posts/${postId}/concern`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: formData.get('reason'),
                    details: formData.get('details')
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Show success message
                let message = result.message;
                if (result.willReanalyze) {
                    message += ` (${result.reportCount} neighbors have flagged this post)`;
                }

                showToast('success', message);

                // Close modal and reset form
                bootstrap.Modal.getInstance(document.getElementById('concernModal')).hide();
                e.target.reset();

                // Optional: Fade out the post if it was hidden after re-analysis
                if (result.willReanalyze) {
                    const postElement = document.querySelector(`[data-post-id="${postId}"]`)?.closest('.post-card');
                    if (postElement) {
                        postElement.style.opacity = '0.5';
                        postElement.style.pointerEvents = 'none';
                    }
                }
            } else {
                showToast('error', result.message || 'Failed to submit concern');
            }

        } catch (error) {
            console.error('Concern submission error:', error);
            showToast('error', 'Failed to submit concern. Please try again.');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});

// Toast notification function
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// ========== TIME AGO FUNCTIONALITY (Facebook-style) ==========

// Time ago formatting function
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 30) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
}

// Update all post timestamps
function updateTimestamps() {
    document.querySelectorAll('.post-timestamp').forEach(el => {
        const timestamp = parseInt(el.dataset.timestamp);
        if (timestamp) {
            el.textContent = timeAgo(timestamp);
        }
    });
}

// Update on page load and every minute
document.addEventListener('DOMContentLoaded', () => {
    updateTimestamps();
    setInterval(updateTimestamps, 60000); // Update every minute
});
