// Store the initial state of the paymentInfo div
var initialPaymentInfo = document.getElementById("paymentInfo").innerHTML;
var initialPaymentInfoHeight = document.getElementById("payment-item").offsetHeight;

function changePaymentInfo() {
    // Create the new content
    var newContent = `
<div class="payment-popup box-right row" id="payment-item">
                <div class="row">
                    <div class="col-lg-6 ">
                        <h4>Credit or Debit card</h4>
                        <p>Add credit or debit card</p>
                        <div class="d-grid gap-2" id="addCardButton">
                            <button class="btn btn-primary custom-btn edit-login-saveButton" type="button" onclick="showInput()" id="showBnt"
                                >Add credit or debit card</button>
                        </div>
                    </div>
                    <div class="col-lg-6 d-flex justify-content-center">
                        <img src="assets/logo-mastercard.png" alt="" width="auto" height="65px"
                            class="payment-logo">
                        <img src="assets/logo-visa.png" alt="" width="auto" height="50px" class="payment-logo">
                    </div>
                </div>
                <div class="col-lg-12" id="cardInput" style="display: none;">
                    <div>
                        <h6>Card number</h6>
                        <input type="text" class="form-control" id="cardNumber">
                    </div>
                    <div class="payment-input">
                        <h6>Name on Card</h6>
                        <input type="text" class="form-control" id="CardName">
                    </div>
                    <div class="payment-input" >
                        <div class="row">
                            <p>Expired Date</p>
                            <div class="col-lg-6">
                                <select class="form-select" aria-label="Default select example" id="EXPDate">
                                    <option value="1">01</option>
                                    <option value="2">02</option>
                                    <option value="3">03</option>
                                    <option value="4">04</option>
                                    <option value="5">05</option>
                                    <option value="6">06</option>
                                    <option value="7">07</option>
                                    <option value="8">08</option>
                                    <option value="9">09</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                  </select>
                            </div>
                            <div class="col-lg-6">
                                <select class="form-select" aria-label="Default select example" id="EXPMonth">
                                    <option value="1">24</option>
                                    <option value="2">25</option>
                                    <option value="3">26</option>
                                    <option value="4">27</option>
                                    <option value="5">28</option>
                                    <option value="6">29</option>
                                    <option value="7">30</option>
                                    <option value="8">31</option>
                                    <option value="9">32</option>
                                    <option value="10">33</option>
                                  </select>
                            </div>
                        </div>
                    </div>
                    <div class="payment-input" id="last">
                        <h6>Security code (CVV/CVC)</h6>
                        <input type="text" class="form-control" id="cvvAndcvc">
                    </div>
                    <div class="d-grid gap-2" id="addCardButton">
                            <button class="btn btn-primary custom-btn edit-login-saveButton" type="button" onclick="restorePaymentInfo()" id="saveAs"
                                >Add credit or debit card</button>
                    </div>
                </div>
            </div>
            <div class="payment-popup" id="payment-item"> <!-- Unique ID added -->
                <div class="col-lg-6">
                    <h4>Paypal</h4>
                    <p>Add Paypal</p>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary custom-btn" type="button">Add Paypal</button>
                    </div>
                </div>
                <div class="col-lg-6 d-flex justify-content-center align-items-center" >
                    <img src="assets/logo-paypal.png" alt="" width="140px" class="payment-logo">
                </div>
            </div>
    `;

    // Replace the content of paymentInfo with the new content
    document.getElementById("paymentInfo").innerHTML = newContent;
}
function editPayment() {
    // Create the new content
    var newContent = `
<div class="payment-popup box-right row" id="payment-item">
                <div class="row">
                    <div class="col-lg-6 ">
                        <h4>Credit or Debit card</h4>
                        <p>Edit credit or debit card</p>
                    </div>
                    <div class="col-lg-6 d-flex justify-content-center">
                        <img src="assets/logo-mastercard.png" alt="" width="auto" height="65px"
                            class="payment-logo">
                        <img src="assets/logo-visa.png" alt="" width="auto" height="50px" class="payment-logo">
                    </div>
                </div>
                <div class="col-lg-12" id="cardInput">
                    <div>
                        <h6>Card number</h6>
                        <input type="text" class="form-control" id="cardNumber">
                    </div>
                    <div class="payment-input">
                        <h6>Name on Card</h6>
                        <input type="text" class="form-control" id="CardName">
                    </div>
                    <div class="payment-input" >
                        <div class="row">
                            <p>Expired Date</p>
                            <div class="col-lg-6">
                                <select class="form-select" aria-label="Default select example" id="EXPDate">
                                    <option value="1">01</option>
                                    <option value="2">02</option>
                                    <option value="3">03</option>
                                    <option value="4">04</option>
                                    <option value="5">05</option>
                                    <option value="6">06</option>
                                    <option value="7">07</option>
                                    <option value="8">08</option>
                                    <option value="9">09</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                  </select>
                            </div>
                            <div class="col-lg-6">
                                <select class="form-select" aria-label="Default select example" id="EXPMonth">
                                    <option value="1">24</option>
                                    <option value="2">25</option>
                                    <option value="3">26</option>
                                    <option value="4">27</option>
                                    <option value="5">28</option>
                                    <option value="6">29</option>
                                    <option value="7">30</option>
                                    <option value="8">31</option>
                                    <option value="9">32</option>
                                    <option value="10">33</option>
                                  </select>
                            </div>
                        </div>
                    </div>
                    <div class="payment-input" id="last">
                        <h6>Security code (CVV/CVC)</h6>
                        <input type="text" class="form-control" id="cvvAndcvc">
                    </div>
                    <div class="d-grid gap-2" id="addCardButton">
                            <button class="btn btn-primary custom-btn edit-login-saveButton" type="button" onclick="restorePaymentInfo()" id="saveAs"
                                >Save</button>
                    </div>
                </div>
            </div>
    `;
    document.getElementById("paymentInfo").innerHTML = newContent;
    document.getElementById("payment-item").style.height = "500px";
}

function ChangeToGift() {
    var newContent = `
            <div class="payment-popup" id="payment-item">
                <div class="col-lg-6 d-flex justify-content-center align-items-center">
                    <i class="fa-solid fa-gift fa-10x "></i>
                </div>
                <div class="col-lg-6 card-col">
                    <h4>Gift Card</h4>
                    <div id="balance" >
                        <div class="d-flex">
                            <p>Balance :</p>
                            <p>฿0.00</p>
                        </div>
                    </div>
                    <div class="d-flex link-payment">
                        <a href="#" onclick="showInputGift()" id="redeem">
                            <h4>Redeem</h4>
                        </a>
                    </div>
                    <div class="col-lg-12" id="cardInput" style="display: none;">
                    <div>
                        <h6>Code</h6>
                        <input type="text" class="form-control" id="cardNumber">
                    </div>
                    <div class="d-grid gap-2" id="addCardButton">
                            <button class="btn btn-primary custom-btn edit-login-saveButton" type="button" onclick="restorePaymentInfo()" id="saveAs"
                                >Add to your balance</button>
                    </div>
                </div>
                </div>
            </div>
    `;

    // Replace the content of paymentInfo with the new content
    document.getElementById("paymentInfo").innerHTML = newContent;
}

function restorePaymentInfo() {
    document.getElementById("payment-item").style.height = initialPaymentInfoHeight + "px";
    // Restore the initial state of the paymentInfo div
    document.getElementById("paymentInfo").innerHTML = initialPaymentInfo;

    var buttons = document.querySelectorAll(".payment-box");

    // Remove "selected-button" class from all buttons
    buttons.forEach(function (btn) {
        btn.classList.remove("selected-button");
    });

    // Add "selected-button" class to the first button
    buttons[0].classList.add("selected-button");
}

document.addEventListener("DOMContentLoaded", function () {
    // Get all buttons with class "payment-box"
    var buttons = document.querySelectorAll(".payment-box");

    // Loop through each button and add a click event listener
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Remove "selected-button" class from all buttons
            buttons.forEach(function (btn) {
                btn.classList.remove("selected-button");
            });

            // Add "selected-button" class to the clicked button
            this.classList.add("selected-button");
        });
    });

    function redirectToPageIfMobile(elementId, nextPage) {
        var element = document.getElementById(elementId);
        element.addEventListener("click", function () {
            // Check if screen width is less than or equal to 768px
            if (window.innerWidth <= 768) {
                // Redirect to the next page only if screen width is 768px or less
                window.location.href = nextPage;
            } else {
                // Otherwise, do nothing
                console.log("Screen width is greater than 768px. Not redirecting.");
            }
        });
    }
    
    // Function to handle all button clicks
    function handleButtonClicks() {
        redirectToPageIfMobile("addPaymentbtn", "add-PaymentMedthod-mobile.html");
        redirectToPageIfMobile("GiftCardbtn", "redeem-payment-mobile.html");
        redirectToPageIfMobile("EditMobile", "edit-Payment-mobile.html");
    }
    
    // Call the function to handle all button clicks
    handleButtonClicks();
});

function showInput() {
    var cardInput = document.getElementById("cardInput");
    cardInput.style.display = (cardInput.style.display === "none") ? "block" : "none";

    // Set the height of the payment popup to 500px
    document.getElementById("payment-item").style.height = "500px";

    // Hide the button with id "showBnt"
    document.getElementById("showBnt").style.display = "none";
}

function showInputGift() {
    var cardInput = document.getElementById("cardInput");
    cardInput.style.display = (cardInput.style.display === "none") ? "block" : "none";

    document.getElementById("balance").style.display = "none";
    document.getElementById("redeem").style.display = "none";
}