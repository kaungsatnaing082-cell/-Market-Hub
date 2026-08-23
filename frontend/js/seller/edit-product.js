/* =========================================================
   PRODUCT ID
========================================================= */

const pid = new URLSearchParams(
    location.search
).get("id");


/* =========================================================
   STATE
========================================================= */

let currentImageUrl = "";
let previewObjectUrl = null;

let currentProduct = null;
let variants = [];

let variantBusy = false;


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
   CATEGORY VARIANT RULES
========================================================= */

const CATEGORY_RULES = {

    Electronic: {
        color: true,
        size: false,
        weight: false,
        volume: false
    },

    Electronics: {
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

    Food: {
        color: false,
        size: false,
        weight: true,
        volume: false
    },

    Beverage: {
        color: false,
        size: false,
        weight: false,
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
   LOAD PRODUCT
========================================================= */

async function loadProduct() {

    try {

        if (!pid) {

            throw new Error(
                "Product ID is missing."
            );
        }


        const result =
            await KrestAPI(
                `/seller/products/${pid}`
            );


        if (!result.product) {

            throw new Error(
                "Product not found."
            );
        }


        currentProduct =
            result.product;


        /* =====================================================
           PRODUCT DATA
        ====================================================== */

        document.getElementById(
                "name"
            ).value =
            currentProduct.name || "";


        ensureCategoryOption(
            currentProduct.category
        );


        document.getElementById(
                "category"
            ).value =
            currentProduct.category || "";


        document.getElementById(
                "price"
            ).value =
            currentProduct.price || "";


        document.getElementById(
                "status"
            ).value =
            currentProduct.status ||
            "ACTIVE";


        document.getElementById(
                "description"
            ).value =
            currentProduct.description ||
            "";


        /* =====================================================
           CURRENT IMAGE
        ====================================================== */

        currentImageUrl =
            currentProduct.image_url ||
            "";


        showCurrentImage(
            currentImageUrl
        );


        /* =====================================================
           VARIANTS
        ====================================================== */

        variants =
            Array.isArray(
                result.variants
            ) ?
            result.variants : [];


        updateVariantFields();

        renderVariants();


    } catch (error) {

        showMessage(
            error.message ||
            "Unable to load product."
        );
    }
}


/* =========================================================
   LOAD VARIANTS
========================================================= */

async function loadVariants() {

    if (!pid) {
        return;
    }


    const result =
        await KrestAPI(
            `/seller/products/${pid}/variants`
        );


    variants =
        Array.isArray(
            result.variants
        ) ?
        result.variants : [];


    renderVariants();
}


/* =========================================================
   SUPPORT EXISTING CUSTOM CATEGORY
========================================================= */

function ensureCategoryOption(
    category
) {

    if (!category) {
        return;
    }


    const categoryInput =
        document.getElementById(
            "category"
        );


    const exists =
        Array.from(
            categoryInput.options
        ).some(
            option =>
            option.value ===
            category
        );


    if (!exists) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category;

        option.textContent =
            category;


        categoryInput.appendChild(
            option
        );
    }
}


/* =========================================================
   SHOW CURRENT IMAGE
========================================================= */

function showCurrentImage(
    imageUrl
) {

    const preview =
        document.getElementById(
            "productImagePreview"
        );

    const placeholder =
        document.getElementById(
            "imagePlaceholder"
        );

    const info =
        document.getElementById(
            "selectedImageInfo"
        );


    if (!preview ||
        !placeholder
    ) {
        return;
    }


    if (imageUrl) {

        preview.src =
            imageUrl;

        preview.hidden =
            false;

        placeholder.hidden =
            true;


        if (info) {

            info.hidden =
                false;

            info.className =
                "notice";

            info.textContent =
                "Current product image";
        }

    } else {

        preview.src =
            "";

        preview.hidden =
            true;

        placeholder.hidden =
            false;


        if (info) {

            info.hidden =
                true;

            info.textContent =
                "";
        }
    }
}


/* =========================================================
   NEW IMAGE PREVIEW
========================================================= */

function setupImagePreview() {

    const imageInput =
        document.getElementById(
            "productImage"
        );

    const preview =
        document.getElementById(
            "productImagePreview"
        );

    const placeholder =
        document.getElementById(
            "imagePlaceholder"
        );

    const info =
        document.getElementById(
            "selectedImageInfo"
        );


    if (!imageInput) {
        return;
    }


    imageInput.addEventListener(
        "change",
        () => {

            const file =
                imageInput.files[0];


            clearTemporaryImageUrl();


            if (!file) {

                showCurrentImage(
                    currentImageUrl
                );

                return;
            }


            /* =================================================
               TYPE
            ================================================= */

            if (!ALLOWED_IMAGE_TYPES.includes(
                    file.type
                )) {

                imageInput.value =
                    "";


                showMessage(
                    "Please choose a JPG, PNG or WEBP image."
                );


                showCurrentImage(
                    currentImageUrl
                );

                return;
            }


            /* =================================================
               SIZE
            ================================================= */

            if (
                file.size >
                MAX_IMAGE_SIZE
            ) {

                imageInput.value =
                    "";


                showMessage(
                    "Product image must be 5 MB or smaller."
                );


                showCurrentImage(
                    currentImageUrl
                );

                return;
            }


            /* =================================================
               PREVIEW
            ================================================= */

            previewObjectUrl =
                URL.createObjectURL(
                    file
                );


            preview.src =
                previewObjectUrl;

            preview.hidden =
                false;

            placeholder.hidden =
                true;


            if (info) {

                info.hidden =
                    false;

                info.className =
                    "notice";

                info.textContent =
                    `${file.name} • ${formatFileSize(
                        file.size
                    )}`;
            }
        }
    );
}


/* =========================================================
   UPDATE PRODUCT
========================================================= */

async function updateProduct(
    event
) {

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "saveProductBtn"
        );


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const category =
        document.getElementById(
            "category"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "price"
            ).value
        );


    const status =
        document.getElementById(
            "status"
        ).value;


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    const imageInput =
        document.getElementById(
            "productImage"
        );


    const newImage =
        imageInput.files[0];


    /* =========================================================
       VALIDATION
    ========================================================= */

    if (!name) {

        showMessage(
            "Please enter the product name."
        );

        return;
    }


    if (!category) {

        showMessage(
            "Please select the product category."
        );

        return;
    }


    if (!Number.isFinite(price) ||
        price < 0
    ) {

        showMessage(
            "Please enter a valid MMK price."
        );

        return;
    }


    try {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";


        let finalImageUrl =
            currentImageUrl;


        /* =====================================================
           UPLOAD NEW IMAGE
        ====================================================== */

        if (newImage) {

            const formData =
                new FormData();


            formData.append(
                "image",
                newImage
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
                    "Unable to upload the new product image."
                );
            }


            finalImageUrl =
                uploadResult.imageUrl;
        }


        /* =====================================================
           UPDATE
        ====================================================== */

        const result =
            await KrestAPI(
                `/seller/products/${pid}`, {
                    method: "PUT",

                    body: JSON.stringify({
                        name,
                        category,
                        price,
                        status,
                        description,

                        imageUrl: finalImageUrl
                    })
                }
            );


        currentImageUrl =
            finalImageUrl;


        currentProduct = {
            ...currentProduct,

            name,
            category,
            price,

            status: result.status ||
                status,

            description,

            image_url: finalImageUrl
        };


        document.getElementById(
                "status"
            ).value =
            result.status ||
            status;


        imageInput.value =
            "";


        clearTemporaryImageUrl();


        showCurrentImage(
            currentImageUrl
        );


        updateVariantFields();


        showMessage(
            "Product updated successfully.",
            "success"
        );


    } catch (error) {

        showMessage(
            error.message ||
            "Unable to update product."
        );


    } finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save product";
    }
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct() {

    if (!pid) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this product? This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    const button =
        document.getElementById(
            "deleteProduct"
        );


    try {

        button.disabled =
            true;

        button.textContent =
            "Deleting...";


        await KrestAPI(
            `/seller/products/${pid}`, {
                method: "DELETE"
            }
        );


        location.href =
            "/pages/seller/products.html";


    } catch (error) {

        showMessage(
            error.message ||
            "Unable to delete product."
        );


        button.disabled =
            false;

        button.textContent =
            "Delete product";
    }
}


/* =========================================================
   CATEGORY FIELD VISIBILITY
========================================================= */

function updateVariantFields() {

    const category =
        document.getElementById(
            "category"
        ).value.trim();


    const rule =
        CATEGORY_RULES[category] ||
        CATEGORY_RULES.Other;


    document.getElementById(
        "variantColorField"
    ).hidden = !rule.color;


    document.getElementById(
        "variantSizeField"
    ).hidden = !rule.size;


    document.getElementById(
        "weightFields"
    ).hidden = !rule.weight;


    document.getElementById(
        "volumeFields"
    ).hidden = !rule.volume;
}


/* =========================================================
   READ VARIANT FORM
========================================================= */

function readVariantForm() {

    const category =
        document.getElementById(
            "category"
        ).value.trim();


    if (!category) {

        showMessage(
            "Please select a product category first."
        );

        return null;
    }


    const rule =
        CATEGORY_RULES[category] ||
        CATEGORY_RULES.Other;


    const color =
        rule.color ?
        document.getElementById(
            "variantColor"
        ).value.trim() :
        "";


    const size =
        rule.size ?
        document.getElementById(
            "variantSize"
        ).value.trim() :
        "";


    /* =========================================================
       WEIGHT
    ========================================================= */

    const weightInput =
        document.getElementById(
            "variantWeightValue"
        );


    const weightText =
        rule.weight ?
        weightInput.value.trim() :
        "";


    const weightValue =
        weightText === "" ?
        null :
        Number(
            weightText
        );


    const weightUnit =
        rule.weight ?
        document.getElementById(
            "variantWeightUnit"
        ).value :
        "";


    /* =========================================================
       VOLUME
    ========================================================= */

    const volumeInput =
        document.getElementById(
            "variantVolumeValue"
        );


    const volumeText =
        rule.volume ?
        volumeInput.value.trim() :
        "";


    const volumeValue =
        volumeText === "" ?
        null :
        Number(
            volumeText
        );


    const volumeUnit =
        rule.volume ?
        document.getElementById(
            "variantVolumeUnit"
        ).value :
        "";


    /* =========================================================
       PRICE
    ========================================================= */

    const variantPriceInput =
        document.getElementById(
            "variantPrice"
        );


    const priceText =
        variantPriceInput.value.trim();


    const variantPrice =
        priceText === "" ?
        null :
        Number(
            priceText
        );


    /* =========================================================
       STOCK
    ========================================================= */

    const variantStockInput =
        document.getElementById(
            "variantStock"
        );


    const stock =
        Number(
            variantStockInput.value
        );


    /* =========================================================
       SKU
    ========================================================= */

    const sku =
        document.getElementById(
            "variantSku"
        ).value.trim();


    /* =========================================================
       REQUIRE OPTION
    ========================================================= */

    if (!color &&
        !size &&
        weightValue === null &&
        volumeValue === null
    ) {

        showMessage(
            "Enter at least one option: color, size, weight or volume."
        );

        return null;
    }


    /* =========================================================
       WEIGHT VALIDATION
    ========================================================= */

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

            weightInput.focus();

            return null;
        }


        if (![
                "g",
                "kg"
            ].includes(
                weightUnit
            )) {

            showMessage(
                "Please select g or kg."
            );

            return null;
        }


    } else if (weightUnit) {

        showMessage(
            "Please enter the weight value."
        );

        return null;
    }


    /* =========================================================
       VOLUME VALIDATION
    ========================================================= */

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

            volumeInput.focus();

            return null;
        }


        if (![
                "ml",
                "L"
            ].includes(
                volumeUnit
            )) {

            showMessage(
                "Please select ml or L."
            );

            return null;
        }


    } else if (volumeUnit) {

        showMessage(
            "Please enter the volume value."
        );

        return null;
    }


    /* =========================================================
       PRICE VALIDATION
    ========================================================= */

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

        return null;
    }


    /* =========================================================
       STOCK VALIDATION
    ========================================================= */

    if (!Number.isInteger(stock) ||
        stock < 0
    ) {

        showMessage(
            "Variant stock must be a non-negative whole number."
        );

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
   SAVE VARIANT
========================================================= */

async function saveVariant() {

    if (
        variantBusy ||
        !pid
    ) {
        return;
    }


    const variant =
        readVariantForm();


    if (!variant) {
        return;
    }


    const editingVariantId =
        document.getElementById(
            "editingVariantId"
        ).value;


    /* =========================================================
       DUPLICATE SKU
    ========================================================= */

    if (variant.sku) {

        const duplicateSku =
            variants.some(
                item =>
                String(item.id) !==
                String(editingVariantId) &&

                item.sku &&

                String(
                    item.sku
                )
                .trim()
                .toLowerCase() ===
                variant.sku
                .trim()
                .toLowerCase()
            );


        if (duplicateSku) {

            showMessage(
                "This variant SKU already exists."
            );

            return;
        }
    }


    /* =========================================================
       DUPLICATE OPTION
    ========================================================= */

    const newKey =
        createVariantKey(
            variant
        );


    const duplicateOption =
        variants.some(
            item => {

                if (
                    String(item.id) ===
                    String(editingVariantId)
                ) {
                    return false;
                }


                return (
                    createVariantKey(
                        normalizeServerVariant(
                            item
                        )
                    ) === newKey
                );
            }
        );


    if (duplicateOption) {

        showMessage(
            "This product option already exists."
        );

        return;
    }


    const saveButton =
        document.getElementById(
            "saveVariantBtn"
        );


    try {

        variantBusy =
            true;


        saveButton.disabled =
            true;


        /* =====================================================
           UPDATE
        ====================================================== */

        if (editingVariantId) {

            saveButton.textContent =
                "Saving...";


            await KrestAPI(
                `/seller/products/${pid}/variants/${editingVariantId}`, {
                    method: "PUT",

                    body: JSON.stringify(
                        variant
                    )
                }
            );


            showMessage(
                "Variant updated successfully.",
                "success"
            );


        } else {

            /* =================================================
               CREATE
            ================================================= */

            saveButton.textContent =
                "Adding...";


            await KrestAPI(
                `/seller/products/${pid}/variants`, {
                    method: "POST",

                    body: JSON.stringify(
                        variant
                    )
                }
            );


            showMessage(
                "Variant added successfully.",
                "success"
            );
        }


        clearVariantEditor();


        await loadVariants();


    } catch (error) {

        showMessage(
            error.message ||
            "Unable to save variant."
        );


    } finally {

        variantBusy =
            false;


        saveButton.disabled =
            false;


        if (
            document.getElementById(
                "editingVariantId"
            ).value
        ) {

            saveButton.textContent =
                "Save Variant";

        } else {

            saveButton.textContent =
                "＋ Add Variant";
        }
    }
}


/* =========================================================
   START EDITING VARIANT
========================================================= */

function startVariantEdit(
    variantId
) {

    const variant =
        variants.find(
            item =>
            String(item.id) ===
            String(variantId)
        );


    if (!variant) {

        showMessage(
            "Variant not found."
        );

        return;
    }


    document.getElementById(
            "editingVariantId"
        ).value =
        variant.id;


    document.getElementById(
            "variantEditorTitle"
        ).textContent =
        "Edit Variant";


    document.getElementById(
            "saveVariantBtn"
        ).textContent =
        "Save Variant";


    document.getElementById(
            "cancelVariantEditBtn"
        ).hidden =
        false;


    updateVariantFields();


    document.getElementById(
            "variantColor"
        ).value =
        variant.color || "";


    document.getElementById(
            "variantSize"
        ).value =
        variant.size || "";


    document.getElementById(
            "variantWeightValue"
        ).value =
        variant.weight_value ||
        "";


    document.getElementById(
            "variantWeightUnit"
        ).value =
        variant.weight_unit ||
        "";


    document.getElementById(
            "variantVolumeValue"
        ).value =
        variant.volume_value ||
        "";


    document.getElementById(
            "variantVolumeUnit"
        ).value =
        variant.volume_unit ||
        "";


    document.getElementById(
            "variantPrice"
        ).value =
        variant.variant_price ||
        "";


    document.getElementById(
            "variantStock"
        ).value =
        variant.stock || 0;


    document.getElementById(
            "variantSku"
        ).value =
        variant.sku || "";


    document.getElementById(
        "variantEditor"
    ).scrollIntoView({
        behavior: "smooth",

        block: "start"
    });
}


/* =========================================================
   CLEAR VARIANT EDITOR
========================================================= */

function clearVariantEditor() {

    document.getElementById(
            "editingVariantId"
        ).value =
        "";


    document.getElementById(
            "variantEditorTitle"
        ).textContent =
        "Add Variant";


    document.getElementById(
            "saveVariantBtn"
        ).textContent =
        "＋ Add Variant";


    document.getElementById(
            "cancelVariantEditBtn"
        ).hidden =
        true;


    document.getElementById(
            "variantColor"
        ).value =
        "";


    document.getElementById(
            "variantSize"
        ).value =
        "";


    document.getElementById(
            "variantWeightValue"
        ).value =
        "";


    document.getElementById(
            "variantWeightUnit"
        ).value =
        "";


    document.getElementById(
            "variantVolumeValue"
        ).value =
        "";


    document.getElementById(
            "variantVolumeUnit"
        ).value =
        "";


    document.getElementById(
            "variantPrice"
        ).value =
        "";


    document.getElementById(
            "variantStock"
        ).value =
        "0";


    document.getElementById(
            "variantSku"
        ).value =
        "";


    updateVariantFields();
}


/* =========================================================
   REMOVE VARIANT
========================================================= */

async function removeVariant(
    variantId
) {

    if (variantBusy) {
        return;
    }


    const variant =
        variants.find(
            item =>
            String(item.id) ===
            String(variantId)
        );


    if (!variant) {

        showMessage(
            "Variant not found."
        );

        return;
    }


    const confirmed =
        confirm(
            `Remove variant "${variantLabel(
                normalizeServerVariant(
                    variant
                )
            )}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        variantBusy =
            true;


        await KrestAPI(
            `/seller/products/${pid}/variants/${variantId}`, {
                method: "DELETE"
            }
        );


        /* =====================================================
           IF CURRENT EDITED VARIANT WAS REMOVED
        ====================================================== */

        if (
            String(
                document.getElementById(
                    "editingVariantId"
                ).value
            ) ===
            String(variantId)
        ) {

            clearVariantEditor();
        }


        await loadVariants();


        showMessage(
            "Variant removed successfully.",
            "success"
        );


    } catch (error) {

        showMessage(
            error.message ||
            "Unable to remove variant."
        );


    } finally {

        variantBusy =
            false;
    }
}


/* =========================================================
   NORMALIZE SERVER VARIANT
========================================================= */

function normalizeServerVariant(
    variant
) {

    return {

        color: variant.color ||
            null,

        size: variant.size ||
            null,

        weightValue: variant.weight_value ===
            null ||
            variant.weight_value ===
            undefined

            ?
            null : Number(
                variant.weight_value
            ),

        weightUnit: variant.weight_unit ||
            null,

        volumeValue: variant.volume_value ===
            null ||
            variant.volume_value ===
            undefined

            ?
            null : Number(
                variant.volume_value
            ),

        volumeUnit: variant.volume_unit ||
            null,

        variantPrice: variant.variant_price ===
            null ||
            variant.variant_price ===
            undefined

            ?
            null : Number(
                variant.variant_price
            ),

        stock: Number(
            variant.stock || 0
        ),

        sku: variant.sku ||
            null
    };
}


/* =========================================================
   VARIANT UNIQUE KEY
========================================================= */

function createVariantKey(
    variant
) {

    return [

        String(
            variant.color ||
            ""
        )
        .trim()
        .toLowerCase(),

        String(
            variant.size ||
            ""
        )
        .trim()
        .toLowerCase(),

        variant.weightValue ||
        "",

        String(
            variant.weightUnit ||
            ""
        )
        .trim()
        .toLowerCase(),

        variant.volumeValue ||
        "",

        String(
            variant.volumeUnit ||
            ""
        )
        .trim()
        .toLowerCase()

    ].join("|");
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
        variant.weightValue !== null &&
        variant.weightValue !== undefined
    ) {

        parts.push(
            `${variant.weightValue} ${variant.weightUnit || ""}`
        );
    }


    if (
        variant.volumeValue !== null &&
        variant.volumeValue !== undefined
    ) {

        parts.push(
            `${variant.volumeValue} ${variant.volumeUnit || ""}`
        );
    }


    return parts.length ?
        parts.join(" / ") :
        "Product option";
}


/* =========================================================
   RENDER VARIANTS
========================================================= */

function renderVariants() {

    const count =
        document.getElementById(
            "variantCount"
        );

    const empty =
        document.getElementById(
            "variantEmptyState"
        );

    const container =
        document.getElementById(
            "variantTableContainer"
        );

    const body =
        document.getElementById(
            "variantTableBody"
        );


    const total =
        variants.length;


    count.textContent =
        `${total} variant${total === 1 ? "" : "s"}`;


    if (!total) {

        empty.hidden =
            false;

        container.hidden =
            true;

        body.innerHTML =
            "";

        return;
    }


    empty.hidden =
        true;

    container.hidden =
        false;


    body.innerHTML =
        variants.map(
            variant => {

                const normalized =
                    normalizeServerVariant(
                        variant
                    );


                const effectivePrice =
                    normalized.variantPrice !== null

                    ?
                    normalized.variantPrice :
                    Number(
                        currentProduct.price ||
                        0
                    );


                const status =
                    variant.status ||
                    (
                        normalized.stock > 0 ?
                        "ACTIVE" :
                        "OUT_OF_STOCK"
                    );


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    variantLabel(
                                        normalized
                                    )
                                )}
                            </strong>
                        </td>


                        <td>
                            ${
                                normalized.variantPrice === null

                                    ? `
                                        <span
                                            class="muted"
                                            title="Uses product base price"
                                        >
                                            ${escapeHtml(
                                                formatMoney(
                                                    effectivePrice
                                                )
                                            )}
                                            <br>
                                            Base price
                                        </span>
                                    `

                                    : escapeHtml(
                                        formatMoney(
                                            effectivePrice
                                        )
                                    )
                            }
                        </td>


                        <td>
                            ${
                                normalized.stock > 0

                                    ? escapeHtml(
                                        String(
                                            normalized.stock
                                        )
                                    )

                                    : `
                                        <span class="stock-out">
                                            0
                                        </span>
                                    `
                            }
                        </td>


                        <td>
                            ${
                                normalized.sku

                                    ? escapeHtml(
                                        normalized.sku
                                    )

                                    : `
                                        <span class="muted">
                                            —
                                        </span>
                                    `
                            }
                        </td>


                        <td>
                            ${statusBadge(
                                status
                            )}
                        </td>


                        <td>

                            <div
                                class="actions"
                                style="
                                    display:flex;
                                    gap:7px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn btn-secondary edit-variant-btn"
                                    data-variant-id="${variant.id}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="btn btn-danger remove-variant-btn"
                                    data-variant-id="${variant.id}"
                                >
                                    Remove
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(
    status
) {

    const clean =
        String(
            status || ""
        ).toUpperCase();


    if (
        clean ===
        "ACTIVE"
    ) {

        return `
            <span
                style="
                    display:inline-flex;
                    padding:5px 9px;
                    border-radius:999px;
                    background:#dcfce7;
                    color:#166534;
                    font-size:.78rem;
                    font-weight:800;
                "
            >
                ACTIVE
            </span>
        `;
    }


    if (
        clean ===
        "OUT_OF_STOCK"
    ) {

        return `
            <span
                style="
                    display:inline-flex;
                    padding:5px 9px;
                    border-radius:999px;
                    background:#fee2e2;
                    color:#991b1b;
                    font-size:.78rem;
                    font-weight:800;
                "
            >
                OUT OF STOCK
            </span>
        `;
    }


    return `
        <span
            style="
                display:inline-flex;
                padding:5px 9px;
                border-radius:999px;
                background:#f1f5f9;
                color:#475569;
                font-size:.78rem;
                font-weight:800;
            "
        >
            ${escapeHtml(clean)}
        </span>
    `;
}


/* =========================================================
   VARIANT TABLE BUTTONS
========================================================= */

function setupVariantTableActions() {

    const body =
        document.getElementById(
            "variantTableBody"
        );


    body.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    ".edit-variant-btn"
                );


            if (editButton) {

                startVariantEdit(
                    editButton.dataset.variantId
                );

                return;
            }


            const removeButton =
                event.target.closest(
                    ".remove-variant-btn"
                );


            if (removeButton) {

                removeVariant(
                    removeButton.dataset.variantId
                );
            }
        }
    );
}


/* =========================================================
   CATEGORY CHANGE
========================================================= */

function setupCategoryChange() {

    const category =
        document.getElementById(
            "category"
        );


    category.addEventListener(
        "change",
        () => {

            /*
             * If seller changes category while
             * editing a variant, reset the editor.
             */
            clearVariantEditor();

            updateVariantFields();
        }
    );
}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    text,
    type = "error"
) {

    const message =
        document.getElementById(
            "message"
        );


    KrestUI.showMessage(
        message,
        text,
        type
    );


    message.scrollIntoView({
        behavior:
            "smooth",

        block:
            "nearest"
    });
}


/* =========================================================
   FORMAT MONEY
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
                "en-US",
                {
                    maximumFractionDigits:
                        0
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
        value ?? ""
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
   CLEAR TEMP IMAGE URL
========================================================= */

function clearTemporaryImageUrl() {

    if (
        previewObjectUrl
    ) {

        URL.revokeObjectURL(
            previewObjectUrl
        );

        previewObjectUrl =
            null;
    }
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           PRODUCT
        ====================================================== */

        loadProduct();

        setupImagePreview();


        document
            .getElementById(
                "editProductForm"
            )
            .addEventListener(
                "submit",
                updateProduct
            );


        document
            .getElementById(
                "deleteProduct"
            )
            .addEventListener(
                "click",
                deleteProduct
            );


        /* =====================================================
           VARIANT
        ====================================================== */

        document
            .getElementById(
                "saveVariantBtn"
            )
            .addEventListener(
                "click",
                saveVariant
            );


        document
            .getElementById(
                "cancelVariantEditBtn"
            )
            .addEventListener(
                "click",
                () => {

                    clearVariantEditor();
                }
            );


        setupVariantTableActions();

        setupCategoryChange();

        updateVariantFields();
    }
);


/* =========================================================
   CLEAN TEMPORARY IMAGE
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        clearTemporaryImageUrl();
    }
);