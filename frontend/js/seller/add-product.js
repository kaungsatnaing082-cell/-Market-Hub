document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       PRODUCT ELEMENTS
    ========================================================= */

    const productForm =
        document.getElementById("productForm");

    const message =
        document.getElementById("message");

    const nameInput =
        document.getElementById("name");

    const categoryInput =
        document.getElementById("category");

    const skuInput =
        document.getElementById("sku");

    const priceInput =
        document.getElementById("price");

    const stockInput =
        document.getElementById("stock");

    const stockHelp =
        document.getElementById("stockHelp");

    const descriptionInput =
        document.getElementById("description");

    const publishProductBtn =
        document.getElementById("publishProductBtn");


    /* =========================================================
       IMAGE ELEMENTS
    ========================================================= */

    const productImageInput =
        document.getElementById("productImage");

    const productImagePreview =
        document.getElementById("productImagePreview");

    const imagePlaceholder =
        document.getElementById("imagePlaceholder");

    const selectedImageInfo =
        document.getElementById("selectedImageInfo");


    /* =========================================================
       VARIANT ELEMENTS
    ========================================================= */

    const hasVariantsInput =
        document.getElementById("hasVariants");

    const variantBuilder =
        document.getElementById("variantBuilder");

    const variantCount =
        document.getElementById("variantCount");

    const variantColorField =
        document.getElementById("variantColorField");

    const variantSizeField =
        document.getElementById("variantSizeField");

    const weightFields =
        document.getElementById("weightFields");

    const volumeFields =
        document.getElementById("volumeFields");


    const variantColorInput =
        document.getElementById("variantColor");

    const variantSizeInput =
        document.getElementById("variantSize");

    const variantWeightValueInput =
        document.getElementById("variantWeightValue");

    const variantWeightUnitInput =
        document.getElementById("variantWeightUnit");

    const variantVolumeValueInput =
        document.getElementById("variantVolumeValue");

    const variantVolumeUnitInput =
        document.getElementById("variantVolumeUnit");

    const variantPriceInput =
        document.getElementById("variantPrice");

    const variantStockInput =
        document.getElementById("variantStock");

    const variantSkuInput =
        document.getElementById("variantSku");

    const addVariantBtn =
        document.getElementById("addVariantBtn");

    const variantEmptyState =
        document.getElementById("variantEmptyState");

    const variantTableContainer =
        document.getElementById("variantTableContainer");

    const variantTableBody =
        document.getElementById("variantTableBody");


    /* =========================================================
       IMAGE SETTINGS
    ========================================================= */

    const MAX_IMAGE_SIZE =
        5 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    /* =========================================================
       STATE
    ========================================================= */

    let previewUrl = null;

    let pendingVariants = [];

    let normalStockValue =
        stockInput.value || "0";

    let createdProductId = null;


    /* =========================================================
       CATEGORY VARIANT RULES
    ========================================================= */

    const CATEGORY_RULES = {

        Electronic: {
            color: true,
            size: false,
            weight: false,
            volume: false
        },

        Fashion: {
            color: true,
            size: true,
            weight: false,
            volume: false
        },

        Beauty: {
            color: true,
            size: false,
            weight: false,
            volume: true
        },

        "Home & Living": {
            color: true,
            size: true,
            weight: false,
            volume: false
        },

        Sports: {
            color: true,
            size: true,
            weight: false,
            volume: false
        },

        "Food & Beverage": {
            color: false,
            size: false,
            weight: true,
            volume: true
        },

        Books: {
            color: false,
            size: true,
            weight: false,
            volume: false
        },

        "Toys & Games": {
            color: true,
            size: true,
            weight: false,
            volume: false
        },

        "Health & Personal Care": {
            color: false,
            size: true,
            weight: false,
            volume: true
        },

        Automotive: {
            color: true,
            size: true,
            weight: false,
            volume: false
        },

        Accessories: {
            color: true,
            size: true,
            weight: false,
            volume: false
        },

        Other: {
            color: true,
            size: true,
            weight: true,
            volume: true
        }
    };


    /* =========================================================
       IMAGE PREVIEW
    ========================================================= */

    productImageInput.addEventListener(
        "change",
        () => {

            const file =
                productImageInput.files[0];


            if (previewUrl) {

                URL.revokeObjectURL(
                    previewUrl
                );

                previewUrl = null;
            }


            if (!file) {

                resetImagePreview();

                return;
            }


            /* =================================================
               FILE TYPE
            ================================================= */

            if (!ALLOWED_IMAGE_TYPES.includes(
                    file.type
                )) {

                productImageInput.value =
                    "";

                resetImagePreview();


                showMessage(
                    "Please choose a JPG, PNG or WEBP image."
                );

                return;
            }


            /* =================================================
               FILE SIZE
            ================================================= */

            if (
                file.size >
                MAX_IMAGE_SIZE
            ) {

                productImageInput.value =
                    "";

                resetImagePreview();


                showMessage(
                    "Product image must be 5 MB or smaller."
                );

                return;
            }


            /* =================================================
               PREVIEW
            ================================================= */

            previewUrl =
                URL.createObjectURL(
                    file
                );


            productImagePreview.src =
                previewUrl;

            productImagePreview.hidden =
                false;

            imagePlaceholder.hidden =
                true;


            selectedImageInfo.hidden =
                false;

            selectedImageInfo.className =
                "notice";

            selectedImageInfo.textContent =
                `${file.name} • ${formatFileSize(
                    file.size
                )}`;
        }
    );


    /* =========================================================
       ENABLE / DISABLE VARIANTS
    ========================================================= */

    hasVariantsInput.addEventListener(
        "change",
        () => {

            const enabled =
                hasVariantsInput.checked;


            variantBuilder.hidden = !enabled;


            if (enabled) {

                normalStockValue =
                    stockInput.value || "0";


                stockInput.value =
                    "0";

                stockInput.disabled =
                    true;


                stockHelp.textContent =
                    "Stock is calculated automatically from all variant stocks.";


                updateVariantFields();

            } else {

                stockInput.disabled =
                    false;

                stockInput.value =
                    normalStockValue;


                stockHelp.textContent =
                    "Used when the product has no variants.";


                /*
                 * Variants are temporary until
                 * product is published.
                 */
                pendingVariants = [];

                renderVariants();
            }
        }
    );


    /* =========================================================
       CATEGORY CHANGE
    ========================================================= */

    categoryInput.addEventListener(
        "change",
        () => {

            if (
                hasVariantsInput.checked
            ) {

                updateVariantFields();
            }
        }
    );


    /* =========================================================
       UPDATE VARIANT INPUTS BY CATEGORY
    ========================================================= */

    function updateVariantFields() {

        const category =
            categoryInput.value.trim();


        const rules =
            CATEGORY_RULES[category] ||
            CATEGORY_RULES.Other;


        variantColorField.hidden = !rules.color;

        variantSizeField.hidden = !rules.size;

        weightFields.hidden = !rules.weight;

        volumeFields.hidden = !rules.volume;


        /* =====================================================
           REMOVE VALUES FROM HIDDEN OPTION TYPES
        ====================================================== */

        if (!rules.color) {

            variantColorInput.value =
                "";
        }


        if (!rules.size) {

            variantSizeInput.value =
                "";
        }


        if (!rules.weight) {

            variantWeightValueInput.value =
                "";

            variantWeightUnitInput.value =
                "";
        }


        if (!rules.volume) {

            variantVolumeValueInput.value =
                "";

            variantVolumeUnitInput.value =
                "";
        }
    }


    /* =========================================================
       ADD VARIANT
    ========================================================= */

    addVariantBtn.addEventListener(
        "click",
        () => {

            const variant =
                readVariantForm();


            if (!variant) {

                return;
            }


            /* =================================================
               DUPLICATE SKU CHECK
            ================================================= */

            if (variant.sku) {

                const duplicateSku =
                    pendingVariants.some(
                        item =>
                        item.sku &&
                        item.sku
                        .toLowerCase() ===
                        variant.sku
                        .toLowerCase()
                    );


                if (duplicateSku) {

                    showMessage(
                        "This variant SKU is already added."
                    );

                    variantSkuInput.focus();

                    return;
                }
            }


            /* =================================================
               DUPLICATE OPTION CHECK
            ================================================= */

            const key =
                createVariantKey(
                    variant
                );


            const duplicateOption =
                pendingVariants.some(
                    item =>
                    createVariantKey(
                        item
                    ) === key
                );


            if (duplicateOption) {

                showMessage(
                    "This product option has already been added."
                );

                return;
            }


            pendingVariants.push(
                variant
            );


            clearVariantForm();

            renderVariants();


            showMessage(
                "Variant added to the product.",
                "success"
            );
        }
    );


    /* =========================================================
       READ VARIANT FORM
    ========================================================= */

    function readVariantForm() {

        const category =
            categoryInput.value.trim();


        if (!category) {

            showMessage(
                "Please select the product category first."
            );

            categoryInput.focus();

            return null;
        }


        const rules =
            CATEGORY_RULES[category] ||
            CATEGORY_RULES.Other;


        const color =
            rules.color ?
            variantColorInput.value.trim() :
            "";


        const size =
            rules.size ?
            variantSizeInput.value.trim() :
            "";


        /* =====================================================
           WEIGHT
        ====================================================== */

        const weightText =
            rules.weight ?
            variantWeightValueInput.value.trim() :
            "";


        const weightValue =
            weightText === "" ?
            null :
            Number(weightText);


        const weightUnit =
            rules.weight ?
            variantWeightUnitInput.value :
            "";


        /* =====================================================
           VOLUME
        ====================================================== */

        const volumeText =
            rules.volume ?
            variantVolumeValueInput.value.trim() :
            "";


        const volumeValue =
            volumeText === "" ?
            null :
            Number(volumeText);


        const volumeUnit =
            rules.volume ?
            variantVolumeUnitInput.value :
            "";


        /* =====================================================
           PRICE
        ====================================================== */

        const priceText =
            variantPriceInput.value.trim();


        const variantPrice =
            priceText === "" ?
            null :
            Number(priceText);


        /* =====================================================
           STOCK
        ====================================================== */

        const stock =
            Number(
                variantStockInput.value
            );


        const sku =
            variantSkuInput.value.trim();


        /* =====================================================
           AT LEAST ONE OPTION
        ====================================================== */

        if (!color &&
            !size &&
            weightValue === null &&
            volumeValue === null
        ) {

            showMessage(
                "Enter at least one variant option such as color, size, weight or volume."
            );

            return null;
        }


        /* =====================================================
           WEIGHT VALIDATION
        ====================================================== */

        if (
            weightValue !== null
        ) {

            if (!Number.isFinite(
                    weightValue
                ) ||
                weightValue <= 0
            ) {

                showMessage(
                    "Please enter a valid weight."
                );

                variantWeightValueInput.focus();

                return null;
            }


            if (!["g", "kg"].includes(
                    weightUnit
                )) {

                showMessage(
                    "Please select g or kg for the weight."
                );

                variantWeightUnitInput.focus();

                return null;
            }

        } else if (weightUnit) {

            showMessage(
                "Please enter the weight value."
            );

            variantWeightValueInput.focus();

            return null;
        }


        /* =====================================================
           VOLUME VALIDATION
        ====================================================== */

        if (
            volumeValue !== null
        ) {

            if (!Number.isFinite(
                    volumeValue
                ) ||
                volumeValue <= 0
            ) {

                showMessage(
                    "Please enter a valid volume."
                );

                variantVolumeValueInput.focus();

                return null;
            }


            if (!["ml", "L"].includes(
                    volumeUnit
                )) {

                showMessage(
                    "Please select ml or L for the volume."
                );

                variantVolumeUnitInput.focus();

                return null;
            }

        } else if (volumeUnit) {

            showMessage(
                "Please enter the volume value."
            );

            variantVolumeValueInput.focus();

            return null;
        }


        /* =====================================================
           VARIANT PRICE
        ====================================================== */

        if (
            variantPrice !== null &&
            (!Number.isFinite(
                    variantPrice
                ) ||
                variantPrice < 0
            )
        ) {

            showMessage(
                "Please enter a valid variant price."
            );

            variantPriceInput.focus();

            return null;
        }


        /* =====================================================
           STOCK
        ====================================================== */

        if (!Number.isInteger(stock) ||
            stock < 0
        ) {

            showMessage(
                "Variant stock must be a non-negative whole number."
            );

            variantStockInput.focus();

            return null;
        }


        return {

            color: color || null,

            size: size || null,

            weightValue,

            weightUnit: weightValue !== null ?
                weightUnit : null,

            volumeValue,

            volumeUnit: volumeValue !== null ?
                volumeUnit : null,

            variantPrice,

            stock,

            sku: sku || null
        };
    }


    /* =========================================================
       CREATE UNIQUE VARIANT KEY
    ========================================================= */

    function createVariantKey(
        variant
    ) {

        return [
            String(
                variant.color || ""
            ).trim().toLowerCase(),

            String(
                variant.size || ""
            ).trim().toLowerCase(),

            variant.weightValue || "",

            String(
                variant.weightUnit || ""
            ).toLowerCase(),

            variant.volumeValue || "",

            String(
                variant.volumeUnit || ""
            ).toLowerCase()
        ].join("|");
    }


    /* =========================================================
       CLEAR VARIANT FORM
    ========================================================= */

    function clearVariantForm() {

        variantColorInput.value =
            "";

        variantSizeInput.value =
            "";

        variantWeightValueInput.value =
            "";

        variantWeightUnitInput.value =
            "";

        variantVolumeValueInput.value =
            "";

        variantVolumeUnitInput.value =
            "";

        variantPriceInput.value =
            "";

        variantStockInput.value =
            "0";

        variantSkuInput.value =
            "";
    }


    /* =========================================================
       RENDER VARIANT TABLE
    ========================================================= */

    function renderVariants() {

        const total =
            pendingVariants.length;


        variantCount.textContent =
            `${total} variant${total === 1 ? "" : "s"}`;


        if (!total) {

            variantEmptyState.hidden =
                false;

            variantTableContainer.hidden =
                true;

            variantTableBody.innerHTML =
                "";

            return;
        }


        variantEmptyState.hidden =
            true;

        variantTableContainer.hidden =
            false;


        variantTableBody.innerHTML =
            pendingVariants
            .map(
                (variant, index) => {

                    return `
                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHtml(
                                            variantLabel(
                                                variant
                                            )
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    ${
                                        variant.variantPrice === null
                                            ? '<span class="muted">Base price</span>'
                                            : escapeHtml(
                                                formatMoney(
                                                    variant.variantPrice
                                                )
                                            )
                                    }
                                </td>

                                <td>
                                    ${variant.stock}
                                </td>

                                <td>
                                    ${
                                        variant.sku
                                            ? escapeHtml(
                                                variant.sku
                                            )
                                            : '<span class="muted">—</span>'
                                    }
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="btn btn-secondary remove-variant-btn"
                                        data-index="${index}"
                                    >
                                        Remove
                                    </button>

                                </td>

                            </tr>
                        `;
                }
            )
            .join("");
    }


    /* =========================================================
       VARIANT LABEL
    ========================================================= */

    function variantLabel(
        variant
    ) {

        const parts = [];


        if (variant.color) {

            parts.push(
                variant.color
            );
        }


        if (variant.size) {

            parts.push(
                `Size ${variant.size}`
            );
        }


        if (
            variant.weightValue !== null
        ) {

            parts.push(
                `${variant.weightValue} ${variant.weightUnit}`
            );
        }


        if (
            variant.volumeValue !== null
        ) {

            parts.push(
                `${variant.volumeValue} ${variant.volumeUnit}`
            );
        }


        return parts.join(" / ");
    }


    /* =========================================================
       REMOVE VARIANT FROM PREVIEW
    ========================================================= */

    variantTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".remove-variant-btn"
                );


            if (!button) {

                return;
            }


            const index =
                Number(
                    button.dataset.index
                );


            if (!Number.isInteger(index) ||
                !pendingVariants[index]
            ) {

                return;
            }


            pendingVariants.splice(
                index,
                1
            );


            renderVariants();


            showMessage(
                "Variant removed.",
                "success"
            );
        }
    );


    /* =========================================================
       PRODUCT FORM SUBMIT
    ========================================================= */

    productForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const imageFile =
                productImageInput.files[0];


            /* =================================================
               IMAGE REQUIRED
            ================================================= */

            if (!imageFile) {

                showMessage(
                    "Please choose a product image."
                );

                productImageInput.focus();

                return;
            }


            /* =================================================
               PRODUCT VALUES
            ================================================= */

            const productName =
                nameInput.value.trim();


            const category =
                categoryInput.value.trim();


            const sku =
                skuInput.value.trim();


            const price =
                Number(
                    priceInput.value
                );


            const hasVariants =
                hasVariantsInput.checked;


            const stock =
                hasVariants ?
                0 :
                Number(
                    stockInput.value
                );


            const description =
                descriptionInput.value.trim();


            /* =================================================
               PRODUCT VALIDATION
            ================================================= */

            if (!productName) {

                showMessage(
                    "Please enter the product name."
                );

                nameInput.focus();

                return;
            }


            if (!category) {

                showMessage(
                    "Please select a product category."
                );

                categoryInput.focus();

                return;
            }


            if (!Number.isFinite(price) ||
                price < 0
            ) {

                showMessage(
                    "Please enter a valid MMK price."
                );

                priceInput.focus();

                return;
            }


            if (!Number.isInteger(stock) ||
                stock < 0
            ) {

                showMessage(
                    "Please enter a valid stock quantity."
                );

                stockInput.focus();

                return;
            }


            /* =================================================
               VARIANT VALIDATION
            ================================================= */

            if (
                hasVariants &&
                pendingVariants.length === 0
            ) {

                showMessage(
                    "This product is marked as having variants. Please add at least one variant."
                );

                addVariantBtn.focus();

                return;
            }


            try {

                createdProductId =
                    null;


                setLoadingState(
                    true
                );


                /* =================================================
                   STEP 1
                   UPLOAD PRODUCT IMAGE
                ================================================= */

                const formData =
                    new FormData();


                formData.append(
                    "image",
                    imageFile
                );


                const uploadResult =
                    await KrestAPI(
                        "/uploads/product", {
                            method: "POST",
                            body: formData
                        }
                    );


                if (!uploadResult.imageUrl) {

                    throw new Error(
                        "Product image upload failed."
                    );
                }


                /* =================================================
                   STEP 2
                   CREATE PRODUCT
                ================================================= */

                const productResult =
                    await KrestAPI(
                        "/seller/products", {
                            method: "POST",

                            body: JSON.stringify({

                                name: productName,

                                category,

                                sku: sku || null,

                                /*
                                 * Parent stock is 0 when
                                 * variants are enabled.
                                 *
                                 * Backend will calculate
                                 * total stock from variants.
                                 */
                                price,

                                stock,

                                description,

                                imageUrl: uploadResult.imageUrl
                            })
                        }
                    );


                if (!productResult.productId) {

                    throw new Error(
                        "Product was created but no product ID was returned."
                    );
                }


                createdProductId =
                    productResult.productId;


                /* =================================================
                   STEP 3
                   CREATE PRODUCT VARIANTS
                ================================================= */

                if (hasVariants) {

                    for (
                        let index = 0; index < pendingVariants.length; index++
                    ) {

                        const variant =
                            pendingVariants[index];


                        publishProductBtn.textContent =
                            `Saving variant ${index + 1} of ${pendingVariants.length}...`;


                        await KrestAPI(
                            `/seller/products/${createdProductId}/variants`, {
                                method: "POST",

                                body: JSON.stringify({
                                    color: variant.color,

                                    size: variant.size,

                                    weightValue: variant.weightValue,

                                    weightUnit: variant.weightUnit,

                                    volumeValue: variant.volumeValue,

                                    volumeUnit: variant.volumeUnit,

                                    variantPrice: variant.variantPrice,

                                    stock: variant.stock,

                                    sku: variant.sku
                                })
                            }
                        );
                    }
                }


                /* =================================================
                   SUCCESS
                ================================================= */

                const successMessage =
                    hasVariants

                    ?
                    `Product created successfully with ${pendingVariants.length} variant${pendingVariants.length === 1 ? "" : "s"}.`

                : "Product created successfully.";


                showMessage(
                    successMessage,
                    "success"
                );


                publishProductBtn.textContent =
                    "Published";


                setTimeout(
                    () => {

                        location.href =
                            `/pages/seller/product-detail.html?id=${createdProductId}`;

                    },
                    800
                );


            } catch (error) {

                /*
                 * Important:
                 * Product may already exist when a later
                 * variant request fails.
                 *
                 * Do not let the seller submit again and
                 * accidentally create another product.
                 */
                if (createdProductId) {

                    showMessage(
                        `Product #${createdProductId} was created, but one or more variants could not be saved. ${error.message || ""} Open the product detail page and continue editing the variants there.`
                    );


                    publishProductBtn.disabled =
                        true;

                    publishProductBtn.textContent =
                        "Product created";


                    setTimeout(
                        () => {

                            location.href =
                                `/pages/seller/product-detail.html?id=${createdProductId}`;

                        },
                        2200
                    );


                    return;
                }


                showMessage(
                    error.message ||
                    "Unable to create product."
                );


                setLoadingState(
                    false
                );
            }
        }
    );


    /* =========================================================
       RESET IMAGE PREVIEW
    ========================================================= */

    function resetImagePreview() {

        productImagePreview.src =
            "";

        productImagePreview.hidden =
            true;

        imagePlaceholder.hidden =
            false;

        selectedImageInfo.hidden =
            true;

        selectedImageInfo.textContent =
            "";
    }


    /* =========================================================
       SHOW MESSAGE
    ========================================================= */

    function showMessage(
        text,
        type = "error"
    ) {

        KrestUI.showMessage(
            message,
            text,
            type
        );


        message.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =========================================================
       FORMAT MMK
    ========================================================= */

    function formatMoney(
        value
    ) {

        if (
            window.KrestUI &&
            typeof KrestUI.money ===
            "function"
        ) {

            return KrestUI.money(
                value
            );
        }


        return (
            Number(value)
            .toLocaleString(
                "en-US", {
                    maximumFractionDigits: 0
                }
            ) +
            " MMK"
        );
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

            return (
                (
                    bytes /
                    1024
                ).toFixed(1) +
                " KB"
            );
        }


        return (
            (
                bytes /
                (
                    1024 *
                    1024
                )
            ).toFixed(2) +
            " MB"
        );
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(
        value
    ) {

        return String(
                value || ""
            )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =========================================================
       LOADING STATE
    ========================================================= */

    function setLoadingState(
        isLoading
    ) {

        publishProductBtn.disabled =
            isLoading;


        addVariantBtn.disabled =
            isLoading;


        hasVariantsInput.disabled =
            isLoading;


        categoryInput.disabled =
            isLoading;


        publishProductBtn.textContent =
            isLoading ?
            "Publishing..." :
            "Publish product";
    }


    /* =========================================================
       CLEAN PREVIEW URL
    ========================================================= */

    window.addEventListener(
        "beforeunload",
        () => {

            if (previewUrl) {

                URL.revokeObjectURL(
                    previewUrl
                );
            }
        }
    );


    /* =========================================================
       INITIAL UI
    ========================================================= */

    variantBuilder.hidden =
        true;

    renderVariants();

    updateVariantFields();
});