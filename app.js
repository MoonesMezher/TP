// Register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker registered", reg))
            .catch(err => console.error("Service Worker failed", err));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const setsToggle = document.getElementById('setsToggle');
    const currentSets = document.getElementById('currentSets');
    const setsCounts = document.querySelectorAll('.sets-count');
    
    let isTwoSets = true;
    
    setsToggle.addEventListener('click', function() {
        // Add animation effect
        setsToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            setsToggle.style.transform = '';
        }, 150);
        
        if (isTwoSets) {
            // Change to 3 sets
            setsCounts.forEach(el => {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.textContent = '3';
                    el.style.opacity = '1';
                }, 300);
            });
            
            currentSets.style.opacity = '0';
            setTimeout(() => {
                currentSets.textContent = '3';
                currentSets.style.opacity = '1';
            }, 300);
            
            setsToggle.innerHTML = '<i class="fas fa-sync-alt"></i><span>تغيير عدد الجولات إلى 2</span>';
            isTwoSets = false;
        } else {
            // Change to 2 sets
            setsCounts.forEach(el => {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.textContent = '2';
                    el.style.opacity = '1';
                }, 300);
            });
            
            currentSets.style.opacity = '0';
            setTimeout(() => {
                currentSets.textContent = '2';
                currentSets.style.opacity = '1';
            }, 300);
            
            setsToggle.innerHTML = '<i class="fas fa-sync-alt"></i><span>تغيير عدد الجولات إلى 3</span>';
            isTwoSets = true;
        }
    });
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.day-card, .intro, .note, .motivation').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});
