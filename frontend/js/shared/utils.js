window.KrestUI = {

    qs(sel, root = document) {
        return root.querySelector(sel);
    },

    qsa(sel, root = document) {
        return [...root.querySelectorAll(sel)];
    },

    /* =========================================================
       KREST CENTER - MMK CURRENCY FORMAT
       
       Examples:
       45000   -> 45,000 MMK
       120000  -> 120,000 MMK
       1500000 -> 1,500,000 MMK
    ========================================================= */

    money(value) {

        const amount = Number(value || 0);

        return (
            new Intl.NumberFormat(
                "en-US", {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0
                }
            ).format(amount) + " MMK"
        );
    },

    /* =========================================================
       DATE FORMAT
    ========================================================= */

    date(value) {

        return value ?
            new Date(value).toLocaleDateString() :
            "—";
    },

    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    escape(value) {

        return String(value || "").replace(
            /[&<>'"]/g,
            ch => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            }[ch])
        );
    },

    /* =========================================================
       STATUS BADGE
    ========================================================= */

    badge(status = "") {

        const safe = this.escape(status);

        const s = String(status).toLowerCase();

        const cls =
            s.includes("approved") ||
            s.includes("resolved") ||
            s.includes("active") ||
            s.includes("delivered") ||
            s.includes("paid")

        ?
        "success"

        :
        s.includes("pending") ||
            s.includes("warning") ||
            s.includes("preparing") ||
            s.includes("confirmed")

        ?
        "warning"

        :
        s.includes("reject") ||
            s.includes("suspend") ||
            s.includes("closed") ||
            s.includes("cancel") ||
            s.includes("deleted")

        ?
        "danger"

        :
        "info";

        return `
      <span class="badge ${cls}">
        ${safe}
      </span>
    `;
    },

    /* =========================================================
       MESSAGE
    ========================================================= */

    showMessage(
        el,
        message,
        type = "error"
    ) {

        if (!el) {
            return;
        }

        el.className =
            `notice ${type}`;

        el.textContent =
            message;

        el.hidden =
            false;

        el.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

};