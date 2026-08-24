(() => {
        "use strict";


        const productId =
            new URLSearchParams(location.search).get("id");


        let product = null;
        let variants = [];
        let groups = [];
        let selected = {};
        let selectedVariant = null;



        const e = (value) =>
            KrestUI.escape(value || "");



        function formatNumber(value) {

            const n = Number(value);

            return Number.isFinite(n) ?
                n.toLocaleString("en-US", {
                    maximumFractionDigits: 2
                }) :
                String(value || "");

        }




        function effectivePrice(variant) {

            if (!variant)
                return Number(product.price || 0);


            return variant.variant_price == null ?
                Number(product.price || 0) :
                Number(variant.variant_price);

        }




        function variantValue(variant, type) {

            if (type === "color")
                return variant.color || "";


            if (type === "size")
                return variant.size || "";


            if (type === "weight") {
                return variant.weight_value == null ?
                    "" :
                    `${variant.weight_value}|${variant.weight_unit || ""}`;
            }


            if (type === "volume") {
                return variant.volume_value == null ?
                    "" :
                    `${variant.volume_value}|${variant.volume_unit || ""}`;
            }


            return "";

        }





        function optionLabel(type, value) {

            if (type === "weight" || type === "volume") {

                const [amount, unit] =
                String(value).split("|");


                return `${formatNumber(amount)} ${unit}`.trim();

            }


            return value;

        }





        function variantLabel(variant) {

            const arr = [];


            if (variant.color)
                arr.push(variant.color);


            if (variant.size)
                arr.push(`Size ${variant.size}`);


            if (variant.weight_value != null)
                arr.push(
                    `${formatNumber(variant.weight_value)} ${variant.weight_unit}`
                );


            if (variant.volume_value != null)
                arr.push(
                    `${formatNumber(variant.volume_value)} ${variant.volume_unit}`
                );


            return arr.join(" / ");

        }





        function isAvailable(v) {

            return v.status === "ACTIVE" &&
                Number(v.stock) > 0;

        }





        function buildGroups() {

            const defs = [
                ["color", "Color"],
                ["size", "Size"],
                ["weight", "Weight"],
                ["volume", "Volume"]
            ];


            groups =
                defs.map(([type, label]) => {

                    const values = [
                        ...new Set(
                            variants
                            .map(v => variantValue(v, type))
                            .filter(Boolean)
                        )
                    ];


                    return {
                        type,
                        label,
                        values
                    };


                })
                .filter(g => g.values.length);


        }






        function findSelectedVariant() {

            if (!groups.length)
                return null;


            if (!groups.every(g => selected[g.type]))
                return null;



            return variants.find(v =>

                isAvailable(v) &&
                groups.every(g =>
                    variantValue(v, g.type) ===
                    selected[g.type]
                )

            ) || null;


        }





        function renderProduct() {

            const box =
                document.getElementById("productDetail");


            box.innerHTML = `

<div class="product-detail-grid">


<div class="product-main-image">

${
product.image_url
?
`<img src="${e(product.image_url)}"
alt="${e(product.name)}">`
:
"📦"
}

</div>



<div class="product-buybox">


<h2>
${e(product.name)}
</h2>


<div class="rating">
★ ${Number(product.rating||0).toFixed(1)}
(${product.review_count||0})
</div>



<p class="muted">
${e(product.description || "No description")}
</p>



<div id="detailPrice"
class="market-price">
${KrestUI.money(product.price)}
</div>



<div id="variantPicker"></div>



<div class="quantity-row">

<input
id="qty"
class="input"
type="number"
min="1"
value="1">

</div>



<button
id="addCartBtn"
class="btn btn-primary">

Add to cart

</button>


<button
id="wishlistBtn"
class="btn btn-secondary">

♡ Wishlist

</button>



</div>


</div>

`;



        if(variants.length){

            buildGroups();

            renderVariantPicker();

        }



        document
        .getElementById("addCartBtn")
        ?.addEventListener(
            "click",
            addCart
        );

        document
        .getElementById("wishlistBtn")
        ?.addEventListener(
            "click",
            toggleWishlist
        );

    }    function renderVariantPicker(){

        const picker =
            document.getElementById("variantPicker");


        if(!picker)
            return;



        picker.innerHTML = groups.map(group=>`

            <div class="variant-option-group">

                <strong>
                    ${group.label}
                </strong>


                <div class="variant-option-buttons">

                ${
                    group.values.map(value=>`

                    <button
                    type="button"
                    class="variant-option-btn"
                    data-type="${e(group.type)}"
                    data-value="${e(value)}">

                    ${e(optionLabel(group.type,value))}

                    </button>

                    `).join("")
                }

                </div>

            </div>


        `).join("");





        picker.onclick=(event)=>{

            const btn =
            event.target.closest(
                ".variant-option-btn"
            );


            if(!btn)
                return;



            const type =
            btn.dataset.type;


            const value =
            btn.dataset.value;



            selected[type] =
            selected[type]===value
            ? ""
            : value;



            updateVariant();

        };


        updateVariant();

    }







    function updateVariant(){


        document
        .querySelectorAll(
            ".variant-option-btn"
        )
        .forEach(btn=>{

            btn.classList.toggle(
                "selected",
                selected[btn.dataset.type]
                ===
                btn.dataset.value
            );

        });



        selectedVariant =
            findSelectedVariant();



        const price =
        document.getElementById(
            "detailPrice"
        );



        if(selectedVariant){

            price.textContent =
            KrestUI.money(
                effectivePrice(selectedVariant)
            );

        }



    }







    async function toggleWishlist(){

        await KrestAPI(`/buyer/wishlist/${productId}`, {
            method:"POST"
        });

        const btn=document.getElementById("wishlistBtn");
        if(btn) btn.textContent="♥ Wishlist Updated";
    }


    async function addCart(){


        const message =
        document.getElementById(
            "message"
        );



        try{


            if(
                variants.length
                &&
                !selectedVariant
            ){

                KrestUI.showMessage(
                    message,
                    "Please select product option."
                );

                return;

            }





            const quantity =
            Math.max(
                1,
                Number(
                    document.getElementById("qty")
                    ?.value || 1
                )
            );





            const body={

                productId:Number(productId),

                quantity

            };




            if(selectedVariant){

                body.variantId =
                Number(selectedVariant.id);

            }






            await KrestAPI(

                "/buyer/cart/items",

                {

                    method:"POST",

                    body:
                    JSON.stringify(body)

                }

            );




            KrestUI.showMessage(
                message,
                "Added to cart.",
                "success"
            );



        }
        catch(error){

            KrestUI.showMessage(
                message,
                error.message
                ||
                "Cannot add cart."
            );

        }


    }









    async function submitReview(){


        const message =
        document.getElementById(
            "message"
        );



        const rating =
        Number(
            document.getElementById(
                "reviewRating"
            )?.value || 5
        );



        const comment =
        document.getElementById(
            "reviewComment"
        )
        ?.value
        .trim();





        try{


            if(!comment){

                KrestUI.showMessage(
                    message,
                    "Please write a review."
                );

                return;

            }






            await KrestAPI(

                "/buyer/reviews",

                {

                    method:"POST",

                    body:
                    JSON.stringify({

                        type: "PRODUCT",

                        targetId: Number(productId),

                        rating,

                        comment

                    })

                }

            );






            KrestUI.showMessage(

                message,

                "Review submitted.",

                "success"

            );






            document.getElementById(
                "reviewComment"
            ).value="";






            const data =
            await KrestAPI(
                `/marketplace/products/${productId}`
            );



            renderReviews(
                data.reviews || []
            );



        }
        catch(error){


            KrestUI.showMessage(

                message,

                error.message
                ||
                "Review failed."

            );


        }



    }








    function renderReviews(reviews){


        const list =
        document.getElementById(
            "reviewList"
        );



        if(!list)
            return;




        list.innerHTML =
        reviews.length

        ?

        reviews.map(review=>`

        <article class="card card-body">


        <div class="rating">

        ${
        "★".repeat(
            Number(review.rating||0)
        )
        }

        ${
        "☆".repeat(
            5-Number(review.rating||0)
        )
        }

        </div>



        <strong>

        ${e(review.buyer_name)}

        </strong>



        <p>

        ${e(review.comment)}

        </p>



        </article>


        `).join("")

        :

        `
        <div class="panel empty">
        No reviews yet.
        </div>
        `;


    }    document.addEventListener(
        "DOMContentLoaded",
        async()=>{


            const detail =
            document.getElementById(
                "productDetail"
            );



            if(!productId){

                detail.innerHTML =
                `
                <div class="notice error">
                Product ID is missing.
                </div>
                `;

                return;

            }




            try{


                const data =
                await KrestAPI(
                    `/marketplace/products/${productId}`
                );



                product =
                data.product;



                variants =
                Array.isArray(data.variants)

                ?

                data.variants.filter(
                    v=>v.status!=="DISABLED"
                )

                :

                [];





                renderProduct();





                renderReviews(
                    Array.isArray(data.reviews)

                    ?

                    data.reviews

                    :

                    []
                );






                document
                .getElementById(
                    "submitReviewBtn"
                )
                ?.addEventListener(
                    "click",
                    submitReview
                );



            }
            catch(error){



                detail.innerHTML =

                `

                <div class="notice error">

                ${
                e(
                    error.message
                    ||
                    "Unable to load product."
                )
                }

                </div>

                `;



            }



        }
    );



})();