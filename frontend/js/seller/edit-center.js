document.addEventListener("DOMContentLoaded", async() => {
    const message = document.getElementById("message");

    const editCenterForm =
        document.getElementById("editCenterForm");

    const nameInput =
        document.getElementById("name");

    const categoryInput =
        document.getElementById("category");

    const locationInput =
        document.getElementById("location");

    const descriptionInput =
        document.getElementById("description");

    const profileImageInput =
        document.getElementById("profileImageInput");

    const coverImageInput =
        document.getElementById("coverImageInput");

    const profileImagePreview =
        document.getElementById("profileImagePreview");

    const coverImagePreview =
        document.getElementById("coverImagePreview");

    const profilePlaceholder =
        document.getElementById("profilePlaceholder");

    const coverPlaceholder =
        document.getElementById("coverPlaceholder");

    const profileImageInfo =
        document.getElementById("profileImageInfo");

    const coverImageInfo =
        document.getElementById("coverImageInfo");

    const saveCenterBtn =
        document.getElementById("saveCenterBtn");

    /* =========================================================
       SETTINGS
    ========================================================= */

    const PROFILE_MAX_SIZE =
        5 * 1024 * 1024;

    const COVER_MAX_SIZE =
        8 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    let currentProfileImage = "";
    let currentCoverImage = "";

    let profilePreviewObjectUrl = null;
    let coverPreviewObjectUrl = null;

    let centerExists = false;

    /* =========================================================
       LOAD CURRENT CENTER
    ========================================================= */

    async function loadCenter() {
        try {
            const result =
                await KrestAPI("/seller/center");

            const center =
                result.center;

            if (!center) {
                centerExists = false;

                KrestUI.showMessage(
                    message,
                    "Your center must be approved before editing."
                );

                if (saveCenterBtn) {
                    saveCenterBtn.disabled = true;
                }

                return;
            }

            centerExists = true;

            nameInput.value =
                center.name || "";

            categoryInput.value =
                center.category || "";

            locationInput.value =
                center.location || "";

            descriptionInput.value =
                center.description || "";

            currentProfileImage =
                center.profile_image || "";

            currentCoverImage =
                center.cover_image || "";

            showProfileImage(
                currentProfileImage
            );

            showCoverImage(
                currentCoverImage
            );

        } catch (error) {
            KrestUI.showMessage(
                message,
                error.message ||
                "Unable to load center information."
            );
        }
    }

    /* =========================================================
       PROFILE IMAGE CHANGE
    ========================================================= */

    profileImageInput.addEventListener(
        "change",
        () => {
            const file =
                profileImageInput.files[0];

            clearProfilePreviewObjectUrl();

            if (!file) {
                showProfileImage(
                    currentProfileImage
                );

                return;
            }

            const validationError =
                validateImage(
                    file,
                    PROFILE_MAX_SIZE,
                    "Center profile picture"
                );

            if (validationError) {
                profileImageInput.value = "";

                KrestUI.showMessage(
                    message,
                    validationError
                );

                showProfileImage(
                    currentProfileImage
                );

                return;
            }

            profilePreviewObjectUrl =
                URL.createObjectURL(file);

            profileImagePreview.src =
                profilePreviewObjectUrl;

            profileImagePreview.hidden =
                false;

            profilePlaceholder.hidden =
                true;

            profileImageInfo.hidden =
                false;

            profileImageInfo.className =
                "notice";

            profileImageInfo.textContent =
                `${file.name} • ${formatFileSize(
          file.size
        )}`;
        }
    );

    /* =========================================================
       COVER IMAGE CHANGE
    ========================================================= */

    coverImageInput.addEventListener(
        "change",
        () => {
            const file =
                coverImageInput.files[0];

            clearCoverPreviewObjectUrl();

            if (!file) {
                showCoverImage(
                    currentCoverImage
                );

                return;
            }

            const validationError =
                validateImage(
                    file,
                    COVER_MAX_SIZE,
                    "Center cover photo"
                );

            if (validationError) {
                coverImageInput.value = "";

                KrestUI.showMessage(
                    message,
                    validationError
                );

                showCoverImage(
                    currentCoverImage
                );

                return;
            }

            coverPreviewObjectUrl =
                URL.createObjectURL(file);

            coverImagePreview.src =
                coverPreviewObjectUrl;

            coverImagePreview.hidden =
                false;

            coverPlaceholder.hidden =
                true;

            coverImageInfo.hidden =
                false;

            coverImageInfo.className =
                "notice";

            coverImageInfo.textContent =
                `${file.name} • ${formatFileSize(
          file.size
        )}`;
        }
    );

    /* =========================================================
       SAVE CENTER
    ========================================================= */

    editCenterForm.addEventListener(
        "submit",
        async(event) => {
            event.preventDefault();

            if (!centerExists) {
                KrestUI.showMessage(
                    message,
                    "Your center must be approved before editing."
                );

                return;
            }

            const name =
                nameInput.value.trim();

            const category =
                categoryInput.value.trim();

            const location =
                locationInput.value.trim();

            const description =
                descriptionInput.value.trim();

            const newProfileImage =
                profileImageInput.files[0];

            const newCoverImage =
                coverImageInput.files[0];

            /* =====================================================
               VALIDATION
            ====================================================== */

            if (!name) {
                KrestUI.showMessage(
                    message,
                    "Please enter the center name."
                );

                nameInput.focus();

                return;
            }

            if (!category) {
                KrestUI.showMessage(
                    message,
                    "Please enter the center category."
                );

                categoryInput.focus();

                return;
            }

            try {
                setLoadingState(true);

                let finalProfileImage =
                    currentProfileImage;

                let finalCoverImage =
                    currentCoverImage;

                /* ===================================================
                   UPLOAD NEW CENTER PROFILE IMAGE
                ==================================================== */

                if (newProfileImage) {
                    const formData =
                        new FormData();

                    formData.append(
                        "image",
                        newProfileImage
                    );

                    const uploadResult =
                        await KrestAPI(
                            "/uploads/center-profile", {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!uploadResult.imageUrl) {
                        throw new Error(
                            "Center profile picture upload failed."
                        );
                    }

                    finalProfileImage =
                        uploadResult.imageUrl;
                }

                /* ===================================================
                   UPLOAD NEW CENTER COVER IMAGE
                ==================================================== */

                if (newCoverImage) {
                    const formData =
                        new FormData();

                    formData.append(
                        "image",
                        newCoverImage
                    );

                    const uploadResult =
                        await KrestAPI(
                            "/uploads/center-cover", {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!uploadResult.imageUrl) {
                        throw new Error(
                            "Center cover photo upload failed."
                        );
                    }

                    finalCoverImage =
                        uploadResult.imageUrl;
                }

                /* ===================================================
                   UPDATE CENTER DATA
                ==================================================== */

                await KrestAPI(
                    "/seller/center", {
                        method: "PUT",

                        body: JSON.stringify({
                            name,
                            category,
                            location,
                            description,

                            profileImage: finalProfileImage,

                            coverImage: finalCoverImage
                        })
                    }
                );

                /* ===================================================
                   UPDATE CURRENT IMAGES
                ==================================================== */

                currentProfileImage =
                    finalProfileImage;

                currentCoverImage =
                    finalCoverImage;

                /* ===================================================
                   RESET FILE INPUTS
                ==================================================== */

                profileImageInput.value = "";
                coverImageInput.value = "";

                clearProfilePreviewObjectUrl();
                clearCoverPreviewObjectUrl();

                showProfileImage(
                    currentProfileImage
                );

                showCoverImage(
                    currentCoverImage
                );

                KrestUI.showMessage(
                    message,
                    "Center profile updated successfully.",
                    "success"
                );

            } catch (error) {
                KrestUI.showMessage(
                    message,
                    error.message ||
                    "Unable to update center profile."
                );

            } finally {
                setLoadingState(false);
            }
        }
    );

    /* =========================================================
       SHOW CURRENT CENTER PROFILE IMAGE
    ========================================================= */

    function showProfileImage(imageUrl) {
        if (imageUrl) {
            profileImagePreview.src =
                imageUrl;

            profileImagePreview.hidden =
                false;

            profilePlaceholder.hidden =
                true;

            profileImageInfo.hidden =
                false;

            profileImageInfo.className =
                "notice";

            profileImageInfo.textContent =
                "Current center profile picture";

        } else {
            profileImagePreview.src = "";

            profileImagePreview.hidden =
                true;

            profilePlaceholder.hidden =
                false;

            profileImageInfo.hidden =
                true;

            profileImageInfo.textContent =
                "";
        }
    }

    /* =========================================================
       SHOW CURRENT CENTER COVER
    ========================================================= */

    function showCoverImage(imageUrl) {
        if (imageUrl) {
            coverImagePreview.src =
                imageUrl;

            coverImagePreview.hidden =
                false;

            coverPlaceholder.hidden =
                true;

            coverImageInfo.hidden =
                false;

            coverImageInfo.className =
                "notice";

            coverImageInfo.textContent =
                "Current center cover photo";

        } else {
            coverImagePreview.src = "";

            coverImagePreview.hidden =
                true;

            coverPlaceholder.hidden =
                false;

            coverImageInfo.hidden =
                true;

            coverImageInfo.textContent =
                "";
        }
    }

    /* =========================================================
       VALIDATE IMAGE
    ========================================================= */

    function validateImage(
        file,
        maxSize,
        label
    ) {
        if (!ALLOWED_IMAGE_TYPES.includes(
                file.type
            )) {
            return `${label} must be JPG, PNG or WEBP.`;
        }

        if (file.size > maxSize) {
            const maxMb =
                Math.round(
                    maxSize /
                    (1024 * 1024)
                );

            return `${label} must be ${maxMb} MB or smaller.`;
        }

        return null;
    }

    /* =========================================================
       FORMAT FILE SIZE
    ========================================================= */

    function formatFileSize(bytes) {
        if (
            bytes <
            1024 * 1024
        ) {
            return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
        }

        return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
    }

    /* =========================================================
       LOADING STATE
    ========================================================= */

    function setLoadingState(
        isLoading
    ) {
        if (!saveCenterBtn) {
            return;
        }

        saveCenterBtn.disabled =
            isLoading;

        saveCenterBtn.textContent =
            isLoading ?
            "Saving..." :
            "Save center profile";
    }

    /* =========================================================
       CLEAN PROFILE PREVIEW
    ========================================================= */

    function clearProfilePreviewObjectUrl() {
        if (profilePreviewObjectUrl) {
            URL.revokeObjectURL(
                profilePreviewObjectUrl
            );

            profilePreviewObjectUrl =
                null;
        }
    }

    /* =========================================================
       CLEAN COVER PREVIEW
    ========================================================= */

    function clearCoverPreviewObjectUrl() {
        if (coverPreviewObjectUrl) {
            URL.revokeObjectURL(
                coverPreviewObjectUrl
            );

            coverPreviewObjectUrl =
                null;
        }
    }

    /* =========================================================
       CLEANUP
    ========================================================= */

    window.addEventListener(
        "beforeunload",
        () => {
            clearProfilePreviewObjectUrl();
            clearCoverPreviewObjectUrl();
        }
    );

    /* =========================================================
       START
    ========================================================= */

    await loadCenter();
});