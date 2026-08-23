window.KrestAPI = async function(path, options = {}) {

    const headers = {
        ...(options.headers || {})
    };

    const token = KrestStorage.getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    /*
     * FormData ဖြစ်ရင် Content-Type ကို manually မသတ်မှတ်ရပါဘူး။
     * Browser က multipart/form-data boundary ကို auto ထည့်ပေးမယ်။
     */
    const isFormData =
        options.body instanceof FormData;

    if (!isFormData) {
        headers["Content-Type"] =
            headers["Content-Type"] || "application/json";
    }

    const response = await fetch(
        `${KREST_CONFIG.apiBase}${path}`, {
            ...options,
            headers
        }
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {

        const error = new Error(
            data.message || "Request failed"
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
};