/* ===== Visit Lesotho - main JavaScript ===== */
document.addEventListener("DOMContentLoaded", function () {

    /* 1. Fallback for any missing image */
    var placeholder = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00209f"/><stop offset="1" stop-color="#009543"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><text x="300" y="210" font-size="30" fill="#fff" text-anchor="middle" font-family="Georgia">Visit Lesotho</text></svg>');
    document.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () { if (img.src !== placeholder) img.src = placeholder; });
        if (img.complete && img.naturalWidth === 0) img.src = placeholder;
    });

    /* 2. Image gallery with lightbox (select, preview, next / previous) */
    var thumbs = document.querySelectorAll("[data-gallery]");
    var lightboxEl = document.getElementById("lightbox");
    if (thumbs.length && lightboxEl) {
        var modal = new bootstrap.Modal(lightboxEl);
        var imgEl = document.getElementById("lightboxImg");
        var titleEl = document.getElementById("lightboxTitle");
        var countEl = document.getElementById("lightboxCount");
        var current = 0;

        function show(i) {
            current = (i + thumbs.length) % thumbs.length;
            var t = thumbs[current];
            imgEl.src = t.src;
            imgEl.alt = t.alt;
            titleEl.textContent = t.dataset.caption;
            countEl.textContent = "Image " + (current + 1) + " of " + thumbs.length;
        }
        thumbs.forEach(function (t, i) {
            t.addEventListener("click", function () { show(i); modal.show(); });
            t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i); modal.show(); } });
        });
        document.getElementById("nextBtn").addEventListener("click", function () { show(current + 1); });
        document.getElementById("prevBtn").addEventListener("click", function () { show(current - 1); });
        document.addEventListener("keydown", function (e) {
            if (!lightboxEl.classList.contains("show")) return;
            if (e.key === "ArrowRight") show(current + 1);
            if (e.key === "ArrowLeft") show(current - 1);
        });
    }

    /* 3. Accommodation booking modal (price calculator) */
    var bookModal = document.getElementById("bookModal");
    if (bookModal) {
        var nights = document.getElementById("nights");
        var price = 0;
        function total() {
            var n = Math.max(1, Math.min(30, parseInt(nights.value, 10) || 1));
            document.getElementById("bookTotal").textContent = "M" + (price * n);
        }
        bookModal.addEventListener("show.bs.modal", function (e) {
            var b = e.relatedTarget;
            price = parseInt(b.dataset.price.replace("M", ""), 10);
            document.getElementById("bookStay").textContent = b.dataset.stay;
            document.getElementById("bookPrice").textContent = b.dataset.price;
            nights.value = 1;
            total();
        });
        nights.addEventListener("input", total);
    }

    /* 4. Registration form validation */
    var form = document.getElementById("registerForm");
    if (form) {
        var f = {
            name: form.fullName, email: form.email, phone: form.phone, dest: form.destination,
            date: form.travelDate, pass: form.password, confirm: form.confirmPassword
        };
        var today = new Date().toISOString().split("T")[0];
        f.date.min = today;

        function setState(input, ok, msg) {
            input.classList.toggle("is-invalid", !ok);
            input.classList.toggle("is-valid", ok);
            if (!ok && msg) input.parentElement.querySelector(".invalid-feedback").textContent = msg;
            return ok;
        }
        var rules = {
            name: function () {
                var v = f.name.value.trim();
                if (!v) return setState(f.name, false, "Full name is required.");
                if (!/^[A-Za-z' .\-]{3,}$/.test(v)) return setState(f.name, false, "Use letters only (at least 3 characters).");
                return setState(f.name, true);
            },
            email: function () {
                var v = f.email.value.trim();
                if (!v) return setState(f.email, false, "Email address is required.");
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setState(f.email, false, "Enter a valid email, e.g. name@example.com.");
                return setState(f.email, true);
            },
            phone: function () {
                var v = f.phone.value.trim();
                if (!v) return setState(f.phone, false, "Phone number is required.");
                if (!/^(\+266)?\s?[2568][0-9]{7}$/.test(v)) return setState(f.phone, false, "Enter 8 digits starting with 2, 5, 6 or 8 (optional +266).");
                return setState(f.phone, true);
            },
            gender: function () {
                var ok = !!form.querySelector('input[name="gender"]:checked');
                document.getElementById("genderError").classList.toggle("d-none", ok);
                return ok;
            },
            dest: function () { return setState(f.dest, f.dest.value !== "", "Please choose a destination."); },
            date: function () {
                if (!f.date.value) return setState(f.date, false, "Travel date is required.");
                if (f.date.value < today) return setState(f.date, false, "Travel date cannot be in the past.");
                return setState(f.date, true);
            },
            pass: function () {
                var v = f.pass.value;
                if (!v) return setState(f.pass, false, "Password is required.");
                if (v.length < 8 || !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/[0-9]/.test(v))
                    return setState(f.pass, false, "Use 8+ characters with an uppercase letter, a lowercase letter and a number.");
                return setState(f.pass, true);
            },
            confirm: function () {
                if (!f.confirm.value) return setState(f.confirm, false, "Please confirm your password.");
                if (f.confirm.value !== f.pass.value) return setState(f.confirm, false, "Passwords do not match.");
                return setState(f.confirm, true);
            }
        };

        /* live validation after the user leaves a field */
        Object.keys(f).forEach(function (k) {
            f[k].addEventListener("blur", rules[k]);
            f[k].addEventListener("input", function () { if (f[k].classList.contains("is-invalid") || f[k].classList.contains("is-valid")) rules[k](); });
        });
        form.querySelectorAll('input[name="gender"]').forEach(function (r) { r.addEventListener("change", rules.gender); });
        f.pass.addEventListener("input", function () { if (f.confirm.value) rules.confirm(); });

        var alertBox = document.getElementById("formAlert");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var allOk = true;
            Object.keys(rules).forEach(function (k) { if (!rules[k]()) allOk = false; });
            if (allOk) {
                alertBox.className = "alert alert-success";
                alertBox.textContent = "Thank you, " + f.name.value.trim() + "! Your registration for " + f.dest.value + " on " + f.date.value + " was successful. We will contact you at " + f.email.value.trim() + ".";
                form.reset();
                form.querySelectorAll(".is-valid,.is-invalid").forEach(function (el) { el.classList.remove("is-valid", "is-invalid"); });
                alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                alertBox.className = "alert alert-danger";
                alertBox.textContent = "Please fix the errors highlighted below and try again.";
                var firstBad = form.querySelector(".is-invalid");
                if (firstBad) firstBad.focus();
            }
        });
        form.addEventListener("reset", function () {
            setTimeout(function () {
                form.querySelectorAll(".is-valid,.is-invalid").forEach(function (el) { el.classList.remove("is-valid", "is-invalid"); });
                document.getElementById("genderError").classList.add("d-none");
                alertBox.className = "alert d-none";
            }, 0);
        });
    }
});
