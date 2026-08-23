document.addEventListener("DOMContentLoaded", async() => {
    const message =
        document.getElementById("message");

    const profileForm =
        document.getElementById("profileForm");

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const phoneInput =
        document.getElementById("phone");

    const bioInput =
        document.getElementById("bio");

    const addressInput =
        document.getElementById("address");

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

    const saveProfileBtn =
        document.getElementById("saveProfileBtn");


    /* =========================================================
       IMAGE SETTINGS
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


    /* =========================================================
       CURRENT IMAGES
    ========================================================= */

    let currentProfileImage = "";
    let currentCoverImage = "";

    let profilePreviewObjectUrl = null;
    let coverPreviewObjectUrl = null;


    /* =========================================================
       LOAD BUYER PROFILE
    ========================================================= */

    async function loadProfile() {
        try {
            const data =
                await KrestAPI("/buyer/me");

            const user =
                data.user || {};

            const profile =
                data.profile || {};

            nameInput.value =
                user.name || "";

            emailInput.value =
                user.email || "";

            phoneInput.value =
                user.phone || "";

            bioInput.value =
                profile.bio || "";

            addressInput.value =
                profile.default_address || "";

            currentProfileImage =
                user.profile_image || "";

            currentCoverImage =
                user.cover_image || "";

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
                "Unable to load buyer profile."
            );
        }
    }


    /* =========================================================
       PROFILE PICTURE CHANGE
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
                    "Profile picture"
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
       COVER PHOTO CHANGE
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
                    "Cover photo"
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
       SAVE BUYER PROFILE
    ========================================================= */

    profileForm.addEventListener(
        "submit",
        async(event) => {
            event.preventDefault();

            const name =
                nameInput.value.trim();

            const phone =
                phoneInput.value.trim();

            const bio =
                bioInput.value.trim();

            const address =
                addressInput.value.trim();

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
                    "Please enter your full name."
                );

                nameInput.focus();

                return;
            }


            try {
                setLoadingState(true);

                let finalProfileImage =
                    currentProfileImage;

                let finalCoverImage =
                    currentCoverImage;


                /* ===================================================
                   UPLOAD PROFILE PICTURE
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
                            "/uploads/profile", {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!uploadResult.imageUrl) {
                        throw new Error(
                            "Profile picture upload failed."
                        );
                    }

                    finalProfileImage =
                        uploadResult.imageUrl;
                }


                /* ===================================================
                   UPLOAD COVER PHOTO
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
                            "/uploads/cover", {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!uploadResult.imageUrl) {
                        throw new Error(
                            "Cover photo upload failed."
                        );
                    }

                    finalCoverImage =
                        uploadResult.imageUrl;
                }


                /* ===================================================
                   UPDATE BUYER PROFILE
                ==================================================== */

                const data =
                    await KrestAPI(
                        "/buyer/profile", {
                            method: "PUT",

                            body: JSON.stringify({
                                name,
                                phone,

                                profileImage: finalProfileImage,

                                coverImage: finalCoverImage,

                                bio,
                                address
                            })
                        }
                    );


                /* ===================================================
                   KEEP CURRENT IMAGES
                ==================================================== */

                currentProfileImage =
                    data.user.profile_image ||
                    finalProfileImage;

                currentCoverImage =
                    data.user.cover_image ||
                    finalCoverImage;


                /* ===================================================
                   UPDATE LOCAL STORAGE USER
                ==================================================== */

                const currentUser =
                    KrestStorage.getUser() || {};

                KrestStorage.setAuth(
                    KrestStorage.getToken(), {
                        ...currentUser,

                        name: data.user.name ||
                            name,

                        profile_image: currentProfileImage,

                        cover_image: currentCoverImage
                    }
                );


                /* ===================================================
                   RESET FILE INPUTS
                ==================================================== */

                profileImageInput.value =
                    "";

                coverImageInput.value =
                    "";

                clearProfilePreviewObjectUrl();

                clearCoverPreviewObjectUrl();


                /* ===================================================
                   SHOW SAVED IMAGES
                ==================================================== */

                showProfileImage(
                    currentProfileImage
                );

                showCoverImage(
                    currentCoverImage
                );


                /* ===================================================
                   SUCCESS
                ==================================================== */

                KrestUI.showMessage(
                    message,
                    "Buyer profile updated successfully.",
                    "success"
                );

            } catch (error) {
                KrestUI.showMessage(
                    message,
                    error.message ||
                    "Unable to update buyer profile."
                );

            } finally {
                setLoadingState(false);
            }
        }
    );


    /* =========================================================
       SHOW PROFILE PICTURE
    ========================================================= */

    function showProfileImage(
        imageUrl
    ) {
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
                "Current profile picture";

        } else {
            profileImagePreview.src =
                "";

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
       SHOW COVER PHOTO
    ========================================================= */

    function showCoverImage(
        imageUrl
    ) {
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
                "Current cover photo";

        } else {
            coverImagePreview.src =
                "";

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
       IMAGE VALIDATION
    ========================================================= */

    function validateImage(
        file,
        maxSize,
        label
    ) {
        if (!ALLOWED_IMAGE_TYPES.includes(
                file.type
            )) {
            return (
                `${label} must be JPG, PNG or WEBP.`
            );
        }

        if (
            file.size >
            maxSize
        ) {
            const maxMb =
                Math.round(
                    maxSize /
                    (1024 * 1024)
                );

            return (
                `${label} must be ${maxMb} MB or smaller.`
            );
        }

        return null;
    }


    /* =========================================================
       FORMAT FILE SIZE
    ========================================================= */

    function formatFileSize(
        bytes
    ) {
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
       SAVE BUTTON LOADING
    ========================================================= */

    function setLoadingState(
        isLoading
    ) {
        if (!saveProfileBtn) {
            return;
        }

        saveProfileBtn.disabled =
            isLoading;

        saveProfileBtn.textContent =
            isLoading ?
            "Saving..." :
            "Save profile";
    }


    /* =========================================================
       CLEAR PROFILE PREVIEW OBJECT URL
    ========================================================= */

    function clearProfilePreviewObjectUrl() {
        if (
            profilePreviewObjectUrl
        ) {
            URL.revokeObjectURL(
                profilePreviewObjectUrl
            );

            profilePreviewObjectUrl =
                null;
        }
    }


    /* =========================================================
       CLEAR COVER PREVIEW OBJECT URL
    ========================================================= */

    function clearCoverPreviewObjectUrl() {
        if (
            coverPreviewObjectUrl
        ) {
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

    await loadProfile();
});